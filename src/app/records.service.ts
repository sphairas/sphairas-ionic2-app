import { Injectable } from '@angular/core';
import { from, merge, Observable, Subject } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { PouchDBService } from './pouchdb.service';
import { TimeRecords } from './time-records';
import { StudentRecordItem } from './types/student-record-item';

@Injectable({
  providedIn: 'root'
})
export class RecordsService {

  constructor(private db: PouchDBService) {
  }

  timeRecords(recordId: string): Observable<TimeRecords> {
    let k = recordId.substring(4).replace(/\D/g, '');
    let options = {
      include_docs: true,
      attachments: false,
      key: k
    };
    let res: Observable<TimeRecords> = from(this.load(options));
    let changes: Observable<TimeRecords> = this.db.changes.pipe(
      filter(c => c.id === recordId),
      switchMap(() => from(this.load(options))),
      //startWith(undefined)
    );
    return merge(res, changes);
  }

  private async load(options: any): Promise<TimeRecords> {
    return this.db.query('times/times-times', options)
      .then(res => {
        //TODO: load cfg:default
        let recs: TimeRecords[] = res.rows.map(r => {
          let ret: TimeRecords = new TimeRecords(r.id, r);
          if (r.doc) {
            ret.journal = r.doc.journal;
            if (r.doc.records) ret.records = r.doc.records.map(r => {
              let sr = new StudentRecordItem(r.student, r.grade);
              sr.timestamp = r.timestamp;
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
      .catch(err => console.log(err)) as Promise<TimeRecords>;
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
}
