import { Component } from '@angular/core';

import { Time } from '../time';
import { UpdatesService } from '../updates.service';
import { PouchDBService } from '../pouchdb.service';
import { TimesService } from '../times.service';

@Component({
  selector: 'app-times',
  templateUrl: 'times.page.html',
  styleUrls: ['times.page.scss'],
  providers: [PouchDBService]
})
export class TimesPage {

  // times: Time[] = [];
  subscription: any;
  start: any;
  end: any;

  constructor(public service: TimesService, private updates: UpdatesService) { }

  ngOnDestroy() {
    this.subscription.dispose();
  }

  ngOnInit(): void {
  }

  ionViewDidEnter(): void {
  }

  onSelect(time: Time): void {
  }

  loadTop(event) {
    setTimeout(() => {
      this.service.addDaysBefore(3);
      event.target.complete();
    }, 500);
  }

  loadBottom(event) {
    setTimeout(() => {
      this.service.addDaysAfter(3);
      event.target.complete();
    }, 500);
  }
}
