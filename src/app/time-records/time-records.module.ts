import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { StudentRecordPage } from './student-record.page';
import { PipesModule } from '../pipes/pipes.module';
import { RouterModule } from '@angular/router';
import { RecordsPage } from './records.page';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { RecordNoteComponent } from './record-note.component';
import { MomentModule } from 'ngx-moment';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: RecordsPage
      },
      {
        path: ':student',
        component: StudentRecordPage
      }
    ]),
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    PipesModule,
    MatIconModule,
    MatFormFieldModule,
    MatChipsModule,
    MatAutocompleteModule,
    MomentModule
  ],
  declarations: [
    StudentRecordPage, 
    RecordsPage,
    RecordNoteComponent
  ]
})
export class TimeRecordsModule {}
