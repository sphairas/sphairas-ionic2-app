import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentRecordItem } from '../types/student-record-item';
import { Time } from '../types/time';
import { Observable, Subscription } from 'rxjs';
import { map, filter, take, tap, debounceTime } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { RecordsService } from '../records.service';

@Component({
  selector: 'app-record',
  templateUrl: './records.page.html',
  styleUrls: ['./records.page.scss'],
})
export class RecordsPage implements OnInit {

  time: Time;
  items: Observable<StudentRecordItem[]>;
  summary = new FormControl('');
  summerySubscription: Subscription;

  constructor(private activatedRoute: ActivatedRoute, private router: Router, private service: RecordsService) { }

  ngOnInit(): void {
    let id = this.activatedRoute.snapshot.paramMap.get('time');
    this.items = this.service.timeRecord(id)
      .pipe(
        take(1),
        tap(t => this.time = t),
        tap(t => { if (t.journal) this.summary.patchValue(t.journal.text) }),
        map(t => t.records.sort((s1, s2) => s1.name.localeCompare(s2.name)))
      );


    // this.timesService.times
    //   .pipe(
    //     map(l => l.find(t => t.id === id)),
    //     filter(Boolean),
    //     // distinctUntilChanged(),
    //     take(1),
    //     tap(t => this.summary.patchValue(t.text))
    //   );
    // this.items = this.service.get(id)
    //   .pipe(
    //     filter(x => x !== undefined),
    //     flatMap(sr => sr.items)
    //   );


    this.summerySubscription = this.summary.valueChanges
      .pipe(
        debounceTime(200),
        filter(Boolean)
      )
      .subscribe(value => {
        //console.log("Value entered: " + value);
        this.service.setTimeJournalText(id, value)
          .catch(e => {
            // this._text = this._lastText;
            console.log(e);
          });
      });
  }

  ngOnDestroy(): void {
    if (this.summerySubscription) this.summerySubscription.unsubscribe();
  }

  onSelect(item: StudentRecordItem): void {
    if (this.time) this.router.navigate(['/tabs/times/' + this.time.id + '/' + item.student]);
  }

}
