import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { MomentModule } from 'ngx-moment';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';
import { PipesModule } from '../pipes/pipes.module';
import { RecordPage } from './record.page';
import { RecordsResolverService, TimeResolverService } from './record.resolver.services';
import { TimesPage } from './times.page';
import { StudentRecordPageRoutingModule } from '../student-record/student-record-routing.module';


@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    RouterModule.forChild([
      { 
        path: '', 
        component: TimesPage 
      },
      {   
        path: ':time',
        component: RecordPage,
        resolve: {
          time: TimeResolverService,
          records: RecordsResolverService
        }
      }
    ]),
    PipesModule,
    MomentModule,
    // StudentRecordPageRoutingModule
  ],
  declarations: [TimesPage, RecordPage]
})
export class TimesPageModule { }
