import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentRecordItem } from '../types/student-record-item';
import { Observable, Subscription } from 'rxjs';
import { filter, tap, debounceTime, shareReplay } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { RecordsService } from '../records.service';
import { TimeRecords } from '../time-records';
import { ConventionsService } from '../conventions.service';

@Component({
  selector: 'app-record',
  templateUrl: './records.page.html',
  styleUrls: ['./records.page.scss'],
})
export class RecordsPage implements OnInit {

  _time: Observable<TimeRecords>;
  summary = new FormControl('');
  private summerySubscription: Subscription;
  private id : string;

  constructor(private activatedRoute: ActivatedRoute, private router: Router, private service: RecordsService, public conventionsService: ConventionsService) { }

  ngOnInit(): void {
    this.id = this.activatedRoute.snapshot.paramMap.get('time');
    this._time = this.service.timeRecords(this.id)
      .pipe(
        tap(t => { if (t.journal) this.summary.patchValue(t.journal.text) }),
        shareReplay()
      );

    this.summerySubscription = this.summary.valueChanges
      .pipe(
        debounceTime(200),
        filter(Boolean)
      )
      .subscribe(value => {
        //console.log("Value entered: " + value);
        this.service.setTimeJournalText(this.id, value)
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
    if (this.id) this.router.navigate(['/tabs/times/' + this.id + '/' + item.student]);
  }

}
