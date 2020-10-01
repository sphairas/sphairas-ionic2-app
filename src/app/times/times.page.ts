import { Component } from '@angular/core';
import { TimeDoc } from '../types/time';
import { PouchDBService } from '../pouchdb.service';
import { TimesService } from '../times.service';
import { Observable } from 'rxjs';
import { List } from 'immutable';

@Component({
  selector: 'app-times',
  templateUrl: 'times.page.html',
  styleUrls: ['times.page.scss'],
  providers: [PouchDBService]
})
export class TimesPage {

  times: Observable<List<TimeDoc>>;
  start: any;
  end: any;

  constructor(public service: TimesService) { }

  ngOnInit(): void {
    this.times = this.service.times;
  }

  ngOnDestroy() {
    //if(this.times) this.times.unsubscribe();
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
