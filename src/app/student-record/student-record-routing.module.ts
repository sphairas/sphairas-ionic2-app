import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StudentRecordPage } from './student-record.page';
import { StudentRecordTimeResolverService, StudentRecordItemResolverService } from './student-record.resolver.services';
import { StudentRecordPageModule } from './student-record.module';

const routes: Routes = [
  {
    path: ':time/:student', 
    component: StudentRecordPage,
    resolve: {
      time: StudentRecordTimeResolverService,
      item: StudentRecordItemResolverService
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes),StudentRecordPageModule],
  exports: [RouterModule],
})
export class StudentRecordPageRoutingModule {}
