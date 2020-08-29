import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { MomentModule } from 'ngx-moment';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';
import { PipesModule } from '../pipes/pipes.module';
import { RecordPage } from './record.page';
import { TimesPage } from './times.page';


@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ExploreContainerComponentModule,
    RouterModule.forChild([
      {
        path: '',
        component: TimesPage
      },
      {
        path: ':time',
        component: RecordPage
      },
      {
        path: ':time/:student',
        loadChildren: () =>
          import('../student-record/student-record-routing.module').then(m => m.StudentRecordPageRoutingModule)
      }
    ]),
    PipesModule,
    MomentModule,
    // StudentRecordPageRoutingModule
  ],
  declarations: [TimesPage, RecordPage]
})
export class TimesPageModule { }
