import { Component, OnInit } from '@angular/core';
import { StudentRecordItem } from '../student-records.item';
import { Observable } from 'rxjs';
import { RecordNote } from '../times/recordNote';
import { map, filter, take, flatMap, tap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { RecordsService, grades } from '../records.service';
import { Grade } from '../grade';
import { Time } from '../time';
import { TimesService } from '../times.service';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-student-record',
  templateUrl: './student-record.page.html',
  styleUrls: ['./student-record.page.scss'],
})
export class StudentRecordPage implements OnInit { //, OnChanges

  private tid: string; //Time ID
  private sid: string; //Student ID
  time: Observable<Time>;
  record: Observable<StudentRecordItem>;

  gradeForm = new FormGroup({
    present: new FormControl(true),
    excuse: new FormControl(false),
    grade: new FormControl()
  });

  constructor(private activatedRoute: ActivatedRoute, private router: Router, private service: RecordsService, private timesService: TimesService) {
  }

  get grades(): Grade[] {
    return grades;
  }

  ngOnInit() {
    this.tid = this.activatedRoute.snapshot.paramMap.get('time');
    this.sid = this.activatedRoute.snapshot.paramMap.get('student');
    this.time = <Observable<Time>>this.timesService.times
      .pipe(
        map(l => l.find(t => t.id === this.tid)),
        filter(Boolean),
        // distinctUntilChanged(),
        take(1)
      );
    this.record = <Observable<StudentRecordItem>>this.service.get(this.tid)
      .pipe(
        flatMap(sr => sr.items),
        map(l => l.find(t => t.student === this.sid)),
        filter(Boolean),
        take(1),
        tap(i => this.gradeForm.patchValue(i))
      );
  }

  onSubmitGrade() {
    let val = this.gradeForm.value as { grade: string; present: boolean; excuse: boolean; };
    let g: string = StudentRecordItem.evaluate(val);
    this.service.setGrade(this.tid, this.sid, g)
      .catch(e => {
        console.log(e);
      });
  }

  addNote() {
    //this.record.notes.push(r);
  }

  next() {
    this.record.subscribe(value => {
      let next = value.nextStudent;
      if (next) {
        this.router.navigate(['/tabs/times/' + this.tid + '/' + next]);
      } else {
        this.router.navigate(['/tabs/times/' + this.tid]);
      }
    });
  }

  times() {
    this.router.navigate(['/tabs/times']);
  }
}
