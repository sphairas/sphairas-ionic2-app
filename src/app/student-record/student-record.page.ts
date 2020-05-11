import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { StudentRecordItem } from '../student-records.item';
import { Subject } from 'rxjs';
import { RecordNote } from '../times/recordNote';
import { debounceTime } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { RecordsService, grades } from '../records.service';
import { Grade } from '../grade';
import { Time } from '../time';

@Component({
  selector: 'app-student-record',
  templateUrl: './student-record.page.html',
  styleUrls: ['./student-record.page.scss'],
})
export class StudentRecordPage implements OnInit { //, OnChanges

  time: Time;
  record: StudentRecordItem;
  beforeAbsent: string;
  lastNote: string;
  observeNote: Subject<any>;
  hints: string[] = [];

  constructor(private activatedRoute: ActivatedRoute, private router: Router, private service: RecordsService) {
  }

  ngOnInit() {
    this.time = this.activatedRoute.snapshot.data.time;
    this.record = this.activatedRoute.snapshot.data.item;

    this.observeNote = new Subject<any>();
    this.observeNote
      .pipe(debounceTime(200))
      .subscribe(value => {

        /*                 this.dbservice.setNote(this.record.time.id, this.record.stundent, value).then(response => {
                          if (response.ok === true)
                              this.lastNote = value;
                          //            else console.log('Updated ' + this.record.time.id);
                      }).catch(err => {
                          this.record.note = this.lastNote;
                          console.log("eingabefehler");
                      }); */
      });
  }

  get grades(): Grade[] {
    return grades;
  }

  get grade(): string {
    if (this.record.grade) return this.record.grade;
    else return 'x';
  }

  @Input('grade')
  set grade(value: string) {
    this.setGrade(value);
  }

  get present(): boolean {
    return true; //!(this.record.grade === 'f' || this.record.grade === 'e');
  }

  @Input('present')
  set present(value: boolean) {
    if (!value) {
      if (this.present) this.beforeAbsent = this.record.grade;
      this.setGrade('f');
    } else {
      if (this.beforeAbsent) {
        this.setGrade(this.beforeAbsent);
      } else {
        this.setGrade('x');
      }
    }
  }

  get excuse(): boolean {
    return this.record.grade === 'e';
  }

  @Input('excuse')
  set excuse(value: boolean) {
    if (value) {
      this.setGrade('e');
    } else {
      this.setGrade('f');
    }
  }

  get note(): string {
    return this.record.note;
  }

  @Input('note')
  set note(value: string) {
    this.record.note = value.trim();
    this.observeNote.next(value.trim());
  }

  /*     isShowNoteEditor(): boolean {
        return this.showNoteEditor || (this.note != null && this.note.trim() !== "");
    } */

  addNote() {
    let r: RecordNote = new RecordNote(this.service, this.record, "");
    this.record.notes.push(r);
  }

  private setGrade(value: string): void {
    let before: string = this.record.grade;
    this.record.grade = value;
    this.service.setGrade(this.time.id, this.record.student, value)
      .then(response => {
        if (!response.ok)
          this.record.grade = before;
        else this.record.grade = value;
      }).catch(err => {
        this.record.grade = before;
        console.log(err);
      });
  }

  ionViewDidEnter() {
    //        console.log("rrrr");
  }

  // ngOnChanges(changes: SimpleChanges): void {
  //   console.log("change");
  //   //        for (let propName in changes) {
  //   //            let chng = changes[propName];
  //   //            let cur = JSON.stringify(chng.currentValue);
  //   //            let prev = JSON.stringify(chng.previousValue);
  //   //            console.log(propName + ' : ' + chng.currentValue);
  //   //        }
  // }

  next() {
    let next = this.record.nextStudent;
    if (next) {
      this.router.navigate(['../' + next], { relativeTo: this.activatedRoute });
    } else {
      this.router.navigate(['../../'], { relativeTo: this.activatedRoute });
    }
  }

  times() {
    this.router.navigate(['../../'], { relativeTo: this.activatedRoute });
  }
}
