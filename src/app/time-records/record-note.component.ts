import { EventEmitter, Input, Output } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';
import { Note } from '../types/note';

@Component({
  selector: 'record-note',
  templateUrl: './record-note.component.html',
  styleUrls: ['./record-note.component.scss'],
})
export class RecordNoteComponent implements OnInit {

  @Input()
  note: Note;
  @Output()
  onRemove: EventEmitter<Note> = new EventEmitter();
  @Output()
  onTextChange: EventEmitter<string> = new EventEmitter();
  text = new FormControl('', { updateOn: 'blur' });
  private textSubscription: Subscription;

  constructor() {
  }

  ngOnInit() {
    this.text.patchValue(this.note.value || '');
    this.textSubscription = this.text.valueChanges
      .pipe(
        debounceTime(200),
        filter(Boolean),
      )
      .subscribe(value => this.onTextChange.next(value as string));
  }

  ngOnDestroy(): void {
    console.log('destroy');
    if (this.textSubscription) this.textSubscription.unsubscribe();
  }

  remove() {
    this.onRemove.next(this.note);
  }
}
