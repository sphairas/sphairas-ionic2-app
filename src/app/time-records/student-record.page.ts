import { Component, OnInit } from '@angular/core';
import { StudentRecordItem } from '../student-record-item';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { grades, RecordsService } from '../records.service';
import { Grade } from '../grade';
import { Time } from '../time';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-student-record',
  templateUrl: './student-record.page.html',
  styleUrls: ['./student-record.page.scss'],
})
export class StudentRecordPage implements OnInit { //, OnChanges

  private tid: string; //Time ID
  private sid: string; //Student ID
  time: Time;
  record: Observable<StudentRecordItem>;
  nextStudent: string;

  gradeForm = new FormGroup({
    present: new FormControl(true),
    excuse: new FormControl(false),
    grade: new FormControl()
  });

  constructor(private activatedRoute: ActivatedRoute, private router: Router, private service: RecordsService) {
  }

  get grades(): Grade[] {
    return grades;
  }

  ngOnInit() {
    this.tid = this.activatedRoute.snapshot.paramMap.get('time');
    this.sid = this.activatedRoute.snapshot.paramMap.get('student');
    this.record = this.service.timeRecord(this.tid)
      .pipe(
        take(1),
        tap(t => this.time = t),
        map(t => {
          let i = t.records.findIndex(r => r.student === this.sid)
          let ret = t.records[i];
          if (i + 1 < t.records.length) this.nextStudent = t.records[i + 1].student;
          return ret;
        }),
        tap(i => { if (i) this.gradeForm.patchValue(i) })
      );

    // this.time = <Observable<Time>>this.timesService.times
    //   .pipe(
    //     map(l => l.find(t => t.id === this.tid)),
    //     filter(Boolean),
    //     // distinctUntilChanged(),
    //     take(1)
    //   );
    // this.record = <Observable<StudentRecordItem>>this.service.get(this.tid)
    //   .pipe(
    //     flatMap(sr => sr.items),
    //     map(l => l.find(t => t.student === this.sid)),
    //     filter(Boolean),
    //     take(1),
    //     tap(i => this.gradeForm.patchValue(i))
    //   );
  }

  onSubmitGrade() {
    //this is called once with null value when the component is initialized
    let val = this.gradeForm.value as { grade: string; present: boolean; excuse: boolean; };
    let g: string = StudentRecordItem.evaluate(val);
    if (g) this.service.setStudentGrade(this.tid, this.sid, g)
      .catch(e => console.log(e));
  }

  addNote() {
    //this.record.notes.push(r);
  }

  next() {
    if (this.nextStudent) {
      this.router.navigate(['/tabs/times/' + this.tid + '/' + this.nextStudent]);
    } else {
      this.router.navigate(['/tabs/times/' + this.tid]);
    }
  }

  times() {
    this.router.navigate(['/tabs/times']);
  }
}
