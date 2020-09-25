import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { MomentModule } from 'ngx-moment';
import { PipesModule } from '../pipes/pipes.module';
import { TimesPage } from './times.page';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: TimesPage
      },
      {
        path: ':time',
        loadChildren: () =>
          import('../time-records/time-records.module').then(m => m.TimeRecordsModule)
      }
    ]),
    PipesModule,
    MomentModule,
    // StudentRecordPageRoutingModule
  ],
  declarations: [TimesPage]
})
export class TimesPageModule { }
