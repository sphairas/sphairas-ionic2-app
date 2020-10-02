import { Injectable } from '@angular/core';
import { from, merge, Observable, Subject } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { PouchDBService } from './pouchdb.service';
import { TimeRecordsDoc } from './types/time-records';
import { Note } from './types/note';
import { StudentRecordItem } from './types/student-record-item';
import { Tag } from './types/tag';
import { TagsService } from './services/tags.service';

@Injectable({
  providedIn: 'root'
})
export class RecordsService {

  constructor(private db: PouchDBService, private tags: TagsService) {
  }

  timeRecords(recordId: string): Observable<TimeRecordsDoc> {
    let k = recordId.substring(4).replace(/\D/g, '');
    let options = {
      include_docs: true,
      attachments: false,
      key: k
    };
    let res: Observable<TimeRecordsDoc> = from(this.load(options));
    let changes: Observable<TimeRecordsDoc> = this.db.changes.pipe(
      filter(c => c.id === recordId),
      switchMap(() => from(this.load(options))),
      //startWith(undefined)
    );
    return merge(res, changes);
  }

  private async load(options: any): Promise<TimeRecordsDoc> {
    return this.db.query('times/times-times', options)
      .then(res => {
        //TODO: load cfg:default
        let recs: TimeRecordsDoc[] = res.rows.map(r => {
          let ret: TimeRecordsDoc = new TimeRecordsDoc(r.id, r);
          if (r.doc) {
            ret.journal = r.doc.journal;
            if (r.doc.records) ret.records = r.doc.records.map(r => {
              let sr = new StudentRecordItem(r.student, r.grade);
              sr.timestamp = r.timestamp;
              sr.tags = r.tags || [];
              sr.tags.forEach(t => {
                if (!t.label) {
                  let tag: Tag = this.tags.userTag(t.value)
                  if (tag) t.label = tag.label;
                }
              });
              sr.notes = r.notes || []; //.slice(0);//copies? sr.notes = r.notes is reference
              return sr;
            });
          }
          return ret;
        });
        return recs;
      })
      .then(async res => {
        const res0: any = await this.db.query('times/times-unitstudents', { attachments: false });
        res.forEach(tr => {
          let ud = res0.rows.find(r => r.id === tr.unit);
          if (ud) {
            tr.text = ud.value.name;
            ud.value.students.forEach(stud => {
              let sri: StudentRecordItem = tr.records.find(i => i.student === stud.id);
              if (!sri) {
                sri = new StudentRecordItem(stud.id, undefined, stud.name);
                tr.records.push(sri);
              } else {
                sri.name = stud.name;
              }
            });
            tr.records.sort((s1, s2) => s1.name.localeCompare(s2.name));
          }
        });
        return res;
      })
      .then(records => {
        //if (records.length === 1) ret.next(records[0]);
        if (records.length === 1) return records[0];
      })
      .catch(err => console.log(err)) as Promise<TimeRecordsDoc>;
  }

  async setTimeJournalText(id: string, value: string) {
    return this.db.change(id, doc => {
      let j = {
        text: value,
        timestamp: Date.now()
      };
      if (!doc.journal || doc.journal.text !== value) doc.journal = j;
    });
  }

  async setStudentGrade(time: string, student: string, grade: string) {
    const cb = (doc: any): void => {
      if (!doc.records) doc.records = [];
      let i = 0;
      for (; i < doc.records.length; i++) {
        let record: { student: string, grade: string, timestamp: number } = doc.records[i];
        if (record.student === student) {
          record.grade = grade;
          record.timestamp = Date.now();
          return;
        }
      }
      let record: { student: string, grade: string, timestamp: number } = {
        student: student,
        grade: grade,
        timestamp: Date.now()
      };
      doc.records.push(record);
    };
    return this.db.change(time, cb);
  }

  async addStudentTag(time: string, student: string, tag: Tag) {
    const cb = (doc: any): void => {
      if (!doc.records) doc.records = [];
      let i = 0;
      for (; i < doc.records.length; i++) {
        let record: { student: string, tags: Tag[] } = doc.records[i];
        if (record.student === student) {
          if (!record.tags) record.tags = [];
          tag.timestamp = Date.now();
          record.tags.push(tag);
          return;
        }
      }
      let record = {
        student: student,
        timestamp: Date.now(),
        tags: [tag]
      };
      doc.records.push(record);
    };
    return this.db.change(time, cb);
  }

  async removeStudentTag(time: string, student: string, id: string) {
    const cb = (doc: any): void => {
      if (!doc.records) doc.records = [];
      let i = 0;
      for (; i < doc.records.length; i++) {
        let record: { student: string, tags: Tag[] } = doc.records[i];
        if (record.student === student) {
          if (record.tags) {
            let j = 0;
            for (; j < record.tags.length; j++) {
              let tag: Tag = record.tags[j];
              if (tag.value === id) {
                record.tags.splice(j, 1)
                break;
              }
            }
          }
        }
      }
    };
    return this.db.change(time, cb);
  }

  async addStudentNote(time: string, student: string, note: Note) {
    const cb = (doc: any): void => {
      if (!doc.records) doc.records = [];
      let i = 0;
      for (; i < doc.records.length; i++) {
        let record: { student: string, notes: Note[], timestamp: number } = doc.records[i];
        if (record.student === student) {
          if (!record.notes) record.notes = [];
          note.timestamp = Date.now();
          record.notes.push(note);
          return;
        }
      }
      let record = {
        student: student,
        timestamp: Date.now(),
        notes: [note]
      };
      doc.records.push(record);
    };
    return this.db.change(time, cb);
  }

  async updateStudentNote(time: string, student: string, id: string, value: string) {
    const cb = (doc: any): void => {
      if (!doc.records) doc.records = [];
      let i = 0;
      for (; i < doc.records.length; i++) {
        let record: { student: string, notes: Note[], timestamp: number } = doc.records[i];
        if (record.student === student) {
          if (record.notes) {
            for (let j = 0; j < record.notes.length; j++) {
              let note: Note = record.notes[j];
              if (note.id === id) {
                note.value = value || '';
                note.timestamp = Date.now();
                return;
              }
            }
          }
        }
      }
    };
    return this.db.change(time, cb);
  }

  async removeStudentNote(time: string, student: string, id: string) {
    const cb = (doc: any): void => {
      if (!doc.records) doc.records = [];
      let i = 0;
      for (; i < doc.records.length; i++) {
        let record: { student: string, notes: Note[] } = doc.records[i];
        if (record.student === student) {
          if (record.notes) {
            let j = 0;
            for (; j < record.notes.length; j++) {
              let note: Note = record.notes[j];
              if (note.id === id) {
                record.notes.splice(j, 1)
                return;
              }
            }
          }
        }
      }
    };
    return this.db.change(time, cb);
  }

}
