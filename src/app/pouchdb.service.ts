import { Injectable } from '@angular/core';
//import { ReplaySubject } from 'rxjs/Rx';
//import * as PouchDB from 'pouchdb';
import PouchDB from 'pouchdb';
import { fromEvent, Observable, ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class PouchDBService {

  public localDB: any;
  private remoteDB: any;
  public readonly eventHandler: ReplaySubject<any> = new ReplaySubject(1);
  public changes: Observable<any>
  private syncHandler: any;

  public constructor() {
    this.localDB = new PouchDB("local", { auto_compaction: true });
    this.changes = fromEvent(this.localDB.changes({
      since: 'now',
      live: true
    }), 'change')
      .pipe(
        map(e => e[0])
      );
    this.localDB.info()
      .then(function (info) {
        console.info(info);
      });
    this.initRemoteDB();
    //this.authService.changes.subscribe(e => this.onChange(e)); Not working, this service might be initialized after AuthService
  }

  authChange(change: { type: string }) {
    switch (change.type) {
      case 'login':
        this.initRemoteDB();
        break;
      case 'logout':
        if (this.syncHandler) this.syncHandler.cancel();
        this.localDB.destroy()
          .then(console.log('localDB destroyed.'))
          .catch(e => console.log(e));
    }
  }

  private initRemoteDB() {
    if (this.syncHandler) this.syncHandler.cancel();
    if (this.remoteDB) this.remoteDB.close().then(console.log('Logged out'));
    let settings: { db: string, api: string, account: string } = JSON.parse(localStorage.getItem('app-settings')) || {};
    if (!settings.db) return;
    this.remoteDB = new PouchDB(settings.db, {
      skip_setup: true,
      fetch: (url: any, opts: any) => {
        let auth = localStorage.getItem('id_token');
        if (auth) opts.headers.set('Authorization', `Bearer ${auth}`);
        return PouchDB.fetch(url, opts);
      }
    })
    this.syncHandler = this.localDB
      .sync(this.remoteDB, {
        live: true,
        retry: true,
        //                        filter: '_view',
      })
      .on('active', info => {
        console.log(info);
      })
      .on('error', err => {
        console.info('Sync error. ' + err);
      })
      .on('denied', err => {
        console.info('Sync denied.' + err);
        //Don't cancel! Syncing may be denied because of missing permissions, e. g. _design/times cannot be synced
        //this.syncHandler.cancel();
      })
      .on('complete', info => {
        // replication was canceled!
        console.log(info);
      })
      .on('change', event => {
        if (event.direction === 'pull') {
          let e = {
            type: 'change',
            id: event.change
          };
          this.eventHandler.next(e);
        }
      });
  }

  public async find(doc: string) {
    return this.localDB.get(doc);
  }

  public async query(view: string, options?: any) {
    //options causing weird problems....
    return this.localDB.query(view, options);
  }

  public async change(doc: string, callback: (doc: any) => void) {
    return this.localDB.get(doc)
      .then(d => {
        callback(d);
        return this.localDB.put(d);
      })
      .then(function (res) {
        return res;
      }).catch(function (err) {
        console.log(err);
      });
  }
}
