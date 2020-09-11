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
  private readonly daysDefault: number = 5;
  private daysBefore: number = this.daysDefault;
  private daysAfter: number = this.daysDefault;

  constructor(private db: PouchDBService) {
    this.start = utc().startOf('day').subtract(this.daysBefore, 'days');
    this.end = utc().endOf('day').add(this.daysAfter, 'days');

    this.loadInitialData();
    this.db.eventHandler.subscribe(e => this.loadInitialData());
  }

  public addDaysBefore(num: number) {
    this.daysBefore = this.daysBefore + num;
    this.loadInitialData();
  }

  public addDaysAfter(num: number) {
    this.daysAfter = this.daysAfter + num;
    this.loadInitialData();
  }

  loadInitialData() {
    let s = this.start.format('YYYYMMDDHHmm');
    let e = this.end.format('YYYYMMDDHHmm');
    //startkey, endkey will skip 'doc:' and 'cfg:'
    let options = {
      include_docs: true,
      attachments: false,
      // startkey: s,
      // endkey: e
    };
    this.db.query('times/times-targets', options)
      .then(res => {
        let recs: Time[] = [];
        //TODO: load cfg:default
        for (let i = 0; i < res.rows.length; i++) {
          let id = res.rows[i].id;
          if (id.indexOf('rec:') === 0) {
            let start = res.rows[i].key.replace(/\D/g, '');
            if (start < s || start > e) continue;
            let rd = res.rows[i].doc;
            let end = rd.end;
            let text = 'Unterricht';
            if (rd.unitDoc) {
              let unit = rd.unitDoc;
              let ud = res.rows.find(r => r.key === unit).doc;
              text = ud ? ud.name : text;
            }
            let t: Time = new Time(id, text);
            t.unit = rd.unitDoc;
            t.start = utc(start, "YYYYMMDDHHmm");
            t.end = utc(end, "YYYYMMDDHHmm");
            t.period = rd.period;
            t.location = rd.location;
            if (rd.journal) t.text = rd.journal.text;
            recs.push(t);
          }
        }
        return recs;
      })
      .then(recs => this._times.next(List(recs)))
      .catch(err => console.log(err));
  }

  get times(): Observable<List<Time>> {
    return this._times.asObservable();
  }

  async setTimeText(id: string, value: string) {
    return this.db.change(id, doc => {
      let j = {
        text: value,
        timestamp: Date.now()
      };
      if (!doc.journal || doc.journal.text !== value) doc.journal = j;
    })
    .then(res => {
      this.loadInitialData();
      return res;
    });
  }

}
