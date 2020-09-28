import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { StudentRecordPage } from './student-record.page';
import { PipesModule } from '../pipes/pipes.module';
import { RouterModule } from '@angular/router';
import { RecordsPage } from './records.page';
import { MatIconModule } from '@angular/material/icon';

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
    MatIconModule
  ],
  declarations: [StudentRecordPage, RecordsPage]
})
export class TimeRecordsModule {}
