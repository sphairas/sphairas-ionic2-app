import { Injectable } from '@angular/core';
import { List } from 'immutable';
import { Moment, utc } from 'moment';
import { BehaviorSubject, Observable } from 'rxjs';
import { PouchDBService } from './pouchdb.service';
import { Time } from './time';

@Injectable({
  providedIn: 'root'
})
export class TimesService {

  private _times: BehaviorSubject<List<Time>> = new BehaviorSubject(List([]));

  public start: Moment;
  public end: Moment;
  private readonly daysDefault: number = 7;
  private daysBefore: number = this.daysDefault;
  private daysAfter: number = this.daysDefault;

  constructor(private db: PouchDBService) {
    this.start = utc().startOf('day').subtract(this.daysBefore, 'days');
    this.end = utc().endOf('day').add(this.daysAfter, 'days');
    this.loadInitialData();
    this.db.eventHandler.subscribe(() => this.loadInitialData());
  }

  public addDaysBefore(num: number) {
    this.daysBefore = this.daysBefore + num;
    this.loadInitialData();
  }

  public addDaysAfter(num: number) {
    this.daysAfter = this.daysAfter + num;
    this.loadInitialData();
  }

  get times(): Observable<List<Time>> {
    return this._times;
  }

  loadInitialData() {
    let s = this.start.format('YYYYMMDDHHmm');
    let e = this.end.format('YYYYMMDDHHmm');
    //startkey, endkey will skip 'doc:' and 'cfg:'
    let options = {
      //include_docs: true,
      attachments: false,
      startkey: s,
      endkey: e
    };
    let recs: Promise<any> = this.db.query('times/times-times', options)
      .then(res => {
        //TODO: load cfg:default
        let recs: Time[] = res.rows.map(r => new Time(r.id, r));

        //for (let i = 0; i < res.rows.length; i++) {
        // if (id.indexOf('rec:') === 0) {
        //   let start = res.rows[i].key.replace(/\D/g, '');
        //   if (start < s || start > e) continue;
        //   let rd = res.rows[i].doc;
        //   let end = rd.end;
        //   let text = 'Unterricht';
        //   if (rd.unitDoc) {
        //     let unit = rd.unitDoc;
        //     let ud = res.rows.find(r => r.key === unit).doc;
        //     text = ud ? ud.name : text;
        //   }
        //   let t: Time = new Time(id, text);
        //   t.unit = rd.unitDoc;
        //   t.start = utc(start, "YYYYMMDDHHmm");
        //   t.end = utc(end, "YYYYMMDDHHmm");
        //   t.period = rd.period;
        //   t.location = rd.location;
        //   if (rd.journal) t.text = rd.journal.text;
        //   recs.push(t);
        // }
        //}
        return recs;
      });
    let units: Promise<any> = this.db.query('times/times-unitstudents', { attachments: false })
      .then(res => {
        let ret: any[] = [];
        res.rows.forEach(r => { ret[r.id] = r.value.name; });
        return ret;
      });
    Promise.all([recs, units])
      .then(([records, names]: [List<Time>, any[]]) => {
        records.forEach(r => { if (r.unit) r.text = names[r.unit] });
        this._times.next(List(records));
      })
      .catch(err => console.log(err));
  }

}
