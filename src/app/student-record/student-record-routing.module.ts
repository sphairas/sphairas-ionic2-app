import { NgModule } from '@angular/core';
import { Routes, RouterModule, ExtraOptions } from '@angular/router';
import { StudentRecordPage } from './student-record.page';
import { StudentRecordPageModule } from './student-record.module';

const routes: Routes = [
  {
    path: '', 
    component: StudentRecordPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes),StudentRecordPageModule],
  exports: [RouterModule],
})
export class StudentRecordPageRoutingModule {}
