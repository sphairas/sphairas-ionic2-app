import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { StudentRecordItem } from '../types/student-record-item';
import { Observable, Subject } from 'rxjs';
import { filter, map, shareReplay, startWith, tap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { RecordsService } from '../records.service';
import { Grade } from '../types/grade';
import { TimeDoc } from '../types/time';
import { FormControl, FormGroup } from '@angular/forms';
import { ConventionsService } from '../conventions.service';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { Tag } from '../types/tag';
import { Note } from '../types/note';

@Component({
  selector: 'app-student-record',
  templateUrl: './student-record.page.html',
  styleUrls: ['./student-record.page.scss'],
})
export class StudentRecordPage implements OnInit { //, OnChanges

  private tid: string; //Time ID
  private sid: string; //Student ID
  _time: Subject<TimeDoc> = new Subject();
  _record: Observable<StudentRecordItem>;
  nextStudent: string;
  _doc_rev: string;

  grades: Grade[];

  gradeForm = new FormGroup({
    present: new FormControl(true),
    excuse: new FormControl(false),
    grade: new FormControl()
  });

  separatorKeysCodes: number[] = [ENTER] //, COMMA];
  tagsControl = new FormControl();
  tags: Tag[] = [];
  allHints: Tag[] = [
    {
      id: "mitwirkung#ohne.hausaufgaben",
      label: "Ohne Hausaufgaben"
    },
    {
      id: "vorgaben#hausaufgaben.unvollstaendig",
      label: "Hausaufgaben unvollständig"
    },
    {
      id: "mitwirkung#verspaetet",
      label: "Verspätet"
    }
  ];
  filteredHints: Observable<Tag[]>;

  @ViewChild('tagsInput', null) fruitInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto', null) matAutocomplete: MatAutocomplete;

  constructor(private activatedRoute: ActivatedRoute, private router: Router, private service: RecordsService, private conventionsService: ConventionsService) {
    this.grades = this.conventionsService.grades();

    this.filteredHints = this.tagsControl.valueChanges.pipe(
      startWith(null),
      map((fruit: string | null) => fruit ? this.filter(fruit) : this.allHints.slice()));
  }

  ngOnInit() {
    this.tid = this.activatedRoute.snapshot.paramMap.get('time');
    this.sid = this.activatedRoute.snapshot.paramMap.get('student');
    this._record = this.service.timeRecords(this.tid)
      .pipe(
        filter(t => !this._doc_rev || this._doc_rev !== t.rev),
        tap(t => this._time.next(t)),
        map(t => {
          let i = t.records.findIndex(r => r.student === this.sid)
          let ret = t.records[i];
          if (i + 1 < t.records.length) this.nextStudent = t.records[i + 1].student;
          return ret;
        }),
        tap(i => { if (i) this.gradeForm.patchValue(i) }),
        shareReplay()
      );
  }

  onSubmitGrade() {
    //this is called once with null value when the component is initialized
    let val = this.gradeForm.value as { grade: string; present: boolean; excuse: boolean; };
    let g: string = StudentRecordItem.evaluate(val);
    if (g) this.service.setStudentGrade(this.tid, this.sid, g)
      .catch(e => console.log(e));
  }

  onAddTag(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim()) {
      let tag: Tag = { id: "tagged:" + Date.now(), label: value.trim() };
      //this.tags.push(tag);
      this.service.addStudentTag(this.tid, this.sid, tag)
        .catch(e => console.log(e));
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
    this.tagsControl.setValue(null);
  }

  onRemoveTag(tag: Tag): void {
    const index = this.tags.indexOf(tag);

    if (index >= 0) {
      //this.tags.splice(index, 1);
      this.service.removeStudentTag(this.tid, this.sid, tag.id)
        .catch(e => console.log(e));
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    // this.fruits.push(event.option.viewValue);
    // this.fruitInput.nativeElement.value = '';
    // this.fruitCtrl.setValue(null);
  }

  private filter(value: string): Tag[] {
    let v = value.toLowerCase();
    return this.allHints.filter(fruit => fruit.label.toLowerCase().indexOf(v) === 0);
  }

  addTextNote() {
    let note: Note = { id: "annotated:" + Date.now(), type: 'text', value: '' };
    this.service.addStudentNote(this.tid, this.sid, note)
      .then(res => this._doc_rev = res.rev)
      .catch(e => console.log(e));
  }

  updateTextNote(note: Note, value: string) {
    this.service.updateStudentNote(this.tid, this.sid, note.id, value)
      .then(res => { if (res.ok) this._doc_rev = res.rev })
      .catch(e => console.log(e));
  }

  // addVoiceNote() {

  // }

  addImageNote() {

  }

  removeNote(note: Note) {
    this.service.removeStudentNote(this.tid, this.sid, note.id)
      .catch(e => console.log(e));
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
