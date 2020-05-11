import { Injectable } from '@angular/core';
import { List } from 'immutable';
import { Moment, utc } from 'moment';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';
import { PouchDBService } from './pouchdb.service';
import { Time } from './time';

export const pmdays: number = 100;

@Injectable({
  providedIn: 'root'
})
export class TimesService {

  private _times: BehaviorSubject<List<Time>> = new BehaviorSubject(List([]));

  public start: Moment;
  public end: Moment;

  constructor(private db: PouchDBService) {
    this.start = utc().startOf('day').subtract(pmdays, 'days');
    this.end = utc().endOf('day').add(pmdays, 'days');

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
        let units: string[] = [];
        //TODO: load cfg:default
        for (let i = 0; i < res.rows.length; i++) {
          let id = res.rows[i].id;
          if (id.indexOf('rec:') === 0) {
            let start = res.rows[i].key;
            if (start < s || start > e) continue;
            let rd = res.rows[i].doc;
            let end = rd.end;
            let text = 'Unterricht';
            if (rd.unitDoc) {
              let unit = rd.unitDoc;
              let ud = res.rows.find(r => r.key === unit).doc;
              text = ud ? ud.name : text;
            }
            let t: Time = new Time(id, text, this);
            t.unit = rd.unitDoc;
            t.start = utc(start, "YYYYMMDDHHmm");
            t.end = utc(end, "YYYYMMDDHHmm");
            t.period = rd.period;
            t.location = rd.location;
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

  async get(id: string): Promise<Time> {
    let res: Observable<Time> = this.times
      .pipe(
        map(l => l.find(t => t.id === id)),
        filter(Boolean),
        // distinctUntilChanged(),
        take(1)
      );
    //toPromise not working?
    return new Promise<Time>((resolve, reject) => res.subscribe(
      value => { if (value) resolve(value) },
      error => reject(error)));
  }

  async setTimeText(id: string, value: string) {
    return this.db.change(id, doc => {
      let j = {
        text: value,
        timestamp: Date.now()
      };
      doc.journal = j;
    });
  }

}
