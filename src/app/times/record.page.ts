import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RecordsService } from '../records.service';
import { TimesService } from '../times.service';
import { StudentRecordItem } from '../student-records.item';
import { Time } from '../time';
import { Observable } from 'rxjs';
import { map, filter, take, flatMap, tap, debounceTime } from 'rxjs/operators';
import { List } from 'immutable';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-record',
  templateUrl: './record.page.html',
  styleUrls: ['./record.page.scss'],
})
export class RecordPage implements OnInit {

  time: Observable<Time>;
  items: Observable<List<StudentRecordItem>>;
  summary = new FormControl('');

  constructor(private activatedRoute: ActivatedRoute, private router: Router, private timesService: TimesService, private service: RecordsService) { }

  ngOnInit() {
    let id = this.activatedRoute.snapshot.paramMap.get('time');
    this.time = <Observable<Time>>this.timesService.times
      .pipe(
        map(l => l.find(t => t.id === id)),
        filter(Boolean),
        // distinctUntilChanged(),
        take(1),
        tap(t => this.summary.patchValue(t.text))
      );
    this.items = this.service.get(id)
      .pipe(
        filter(x => x !== undefined),
        flatMap(sr => sr.items)
      );
    this.summary.valueChanges
      .pipe(
        debounceTime(200),
        filter(Boolean)
      )
      .subscribe(value => {
        //console.log("Value entered: " + value);
        this.timesService.setTimeText(id, value)
          .catch(e => {
            // this._text = this._lastText;
            console.log(e);
          });
      });
  }

  onSelect(item: StudentRecordItem, index: number): void {
    this.time.subscribe(value => this.router.navigate(['/tabs/times/' + value.id + '/' + item.student]));
  }

}
