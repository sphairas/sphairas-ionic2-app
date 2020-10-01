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
import { TagsService } from '../services/tags.service';
import { PhotoService } from '../services/photo.service';

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
  allHints: Tag[];

  gradeForm = new FormGroup({
    present: new FormControl(true),
    excuse: new FormControl(false),
    grade: new FormControl()
  });

  separatorKeysCodes: number[] = [ENTER] //, COMMA];
  tagsControl = new FormControl();
  filteredHints: Observable<Tag[]>;

  @ViewChild('tagsInput', null) tagsInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto', null) matAutocomplete: MatAutocomplete;

  constructor(private activatedRoute: ActivatedRoute, private router: Router, private service: RecordsService, private conventionsService: ConventionsService, private tagsService: TagsService, private photoService: PhotoService) {
    this.grades = this.conventionsService.grades();
    this.allHints = this.tagsService.userTags('student-record');

    this.filteredHints = this.tagsControl.valueChanges.pipe(
      startWith(null),
      map((t: string | null) => t ? this.filter(t) : this.allHints.slice()));
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
      .then(res => this._doc_rev = res.rev)
      .catch(e => console.log(e));
  }

  onAddTag(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim()) {
      let tag: Tag = { value: "tagged:" + Date.now(), label: value.trim() };
      //this.tags.push(tag);
      this.service.addStudentTag(this.tid, this.sid, tag)
        //.then(res => this._doc_rev = res.rev)
        .catch(e => console.log(e));
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
    this.tagsControl.setValue(null);
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    let selected: Tag = event.option.value;
    if (selected) {
      let tag: Tag = { value: selected.value };
      //this.tags.push(tag);
      this.service.addStudentTag(this.tid, this.sid, tag)
        //.then(res => this._doc_rev = res.rev)
        .catch(e => console.log(e));
    }
    this.tagsInput.nativeElement.value = '';
    this.tagsControl.setValue(null);
  }

  labelForTag(tag: Tag): string {
    return tag ? tag.label : '';
  }

  private filter(value: any): Tag[] {
    let v = (value instanceof String) ? value.toLowerCase() : '';
    return this.allHints.filter(h => h.label.toLowerCase().indexOf(v) === 0);
  }

  onRemoveTag(tag: Tag): void {
    this.service.removeStudentTag(this.tid, this.sid, tag.value)
      .catch(e => console.log(e));
  }

  addTextNote() {
    let note: Note = { id: "annotated:" + Date.now(), type: 'text', value: '' };
    this.service.addStudentNote(this.tid, this.sid, note)
      .catch(e => console.log(e));
  }

  updateTextNote(note: Note, value: string) {
    this.service.updateStudentNote(this.tid, this.sid, note.id, value)
      .then(res => { if (res.ok) this._doc_rev = res.rev })
      .catch(e => console.log(e));
  }

  addVoiceNote() {

  }

  addImageNote() {
    this.photoService.takeNew()
      .then(res => {
        let note: Note = { id: "annotated:" + Date.now(), type: 'image', value: res };
        this.service.addStudentNote(this.tid, this.sid, note)
          .catch(e => console.log(e));
      })
      .catch(e => console.log(e));
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
