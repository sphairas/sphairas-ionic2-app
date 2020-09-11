import { Injectable } from '@angular/core';
import { List, Record } from 'immutable';
import { BehaviorSubject, Observable } from 'rxjs';
import { Grade } from './grade';
import { PouchDBService } from './pouchdb.service';
import { StudentRecords } from './student-records';
import { student, studentFactory } from './time';
import { TimesService } from './times.service';
import { filter, take, map, distinctUntilChanged } from 'rxjs/operators';

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

  private _records: BehaviorSubject<List<StudentRecords>> = new BehaviorSubject(List([]));

  constructor(private times: TimesService, private db: PouchDBService) {
    this.loadInitialData();
  }

  loadInitialData() {
    let s = this.times.start.format('YYYYMMDDHHmm');
    let e = this.times.end.format('YYYYMMDDHHmm');
    //startkey, endkey will skip 'doc:' and 'cfg:'
    let options = {
      include_docs: true,
      attachments: false,
      // startkey: s,
      // endkey: e
    };
    this.db.query('times/times-targets', options)
      .then(res => {
        let recs: StudentRecords[] = [];
        let units: any[] = [];
        //TODO: load cfg:default
        for (let i = 0; i < res.rows.length; i++) {
          let id = res.rows[i].id;
          if (id.indexOf('rec:') === 0) {
            let start = res.rows[i].key.replace(/\D/g, '');
            if (start < s || start > e) continue;
            let rd = res.rows[i].doc;
            if (rd.unitDoc) {
              let tu = units[rd.unitDoc];
              if (!tu) {
                let unit = rd.unitDoc;
                let ud = res.rows.find(r => r.key === unit).doc;
                let studs: Record<student>[] = ud.students.map(s => studentFactory(s));;
                tu = {
                  students: List(studs),
                  convention: ud.convention
                };
                units[unit] = tu;
              }
              let records: { student: string, grade: string, timestamp: number }[] = rd.records || [];
              let sr: StudentRecords = new StudentRecords(id, rd.unitDoc, tu.students, records);
              sr.convention = tu.convention;
              recs.push(sr);
            }
          }
        }
        return recs;
      })
      .then(recs => this._records.next(List(recs)))
      .catch(err => console.log(err));
  }

  // get records(): Observable<List<StudentRecords>> {
  //   return this._records.asObservable();
  // }

  get(time: string): Observable<StudentRecords> {
    return <Observable<StudentRecords>>this._records
      .pipe(
        map(l => l.find(t => t.time === time)),
        filter(x => x !== undefined),
        distinctUntilChanged(),
        take(1)
      );
    //toPromise not working?
    // return new Promise<StudentRecords>((resolve, reject) => res.subscribe(
    //   value => { if (value) {
    //   console.log("sdjflksdajflk " + value.size);
    //   resolve(value) }},
    //   error => reject(error)));
  }

  async setGrade(time: string, student: string, grade: string) {
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
    return this.db.change(time, cb)
    .then(res => {
      this.loadInitialData();
      return res;
    });
  }

}
