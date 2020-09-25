import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Grade } from './types/grade';
import { PouchDBService } from './pouchdb.service';
import { TimeRecords } from './time-records';
import { StudentRecordItem } from './types/student-record-item';

export let grades: Grade[] = [
  new Grade('minus-minus', ' --', true, 'remove-circle'),
  new Grade('minus', '-', true, 'remove'),
  new Grade('x', '*', true, 'star-outline'),
  new Grade('x-plus', '*+', true, 'star'),
  new Grade('plus', '+', true, 'add'),
  new Grade('plus-plus', '++', true, 'add-circle'),
  new Grade('f', 'fehlend', false),
  new Grade('e', 'entschuldigt', false)
];

@Injectable({
  providedIn: 'root'
})
export class RecordsService {


  constructor(private db: PouchDBService) {
  }

  timeRecord(recordId: string): Observable<TimeRecords> {
    let k = recordId.substring(4).replace(/\D/g, '');
    let options = {
      include_docs: true,
      attachments: false,
      key: k
    };
    let ret: Subject<TimeRecords> = new Subject();
    this.db.query('times/times-times', options)
      .then(res => {
        //TODO: load cfg:default
        let recs: TimeRecords[] = res.rows.map(r => {
          let ret: TimeRecords = new TimeRecords(r.id, r);
          if (r.doc) {
            ret.journal = r.doc.journal;
            if (r.doc.records) ret.records = r.doc.records.map(r => {
              let sr = new StudentRecordItem(r.student);
              sr.setGrade(r.grade);
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
                sri = new StudentRecordItem(stud.id, stud.name);
                tr.records.push(sri);
              } else {
                sri.name = stud.name;
              }
            });
          }
        });
        return res;
      })
      .then(records => {
        if (records.length === 1) ret.next(records[0]);
      })
      .catch(err => console.log(err));
    return ret;
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
