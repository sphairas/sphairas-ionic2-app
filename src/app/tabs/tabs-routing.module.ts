import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { StudentRecordPageRoutingModule } from '../student-record/student-record-routing.module';
import { TimesPageModule } from '../times/times.module';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'times',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../times/times.module').then(m => m.TimesPageModule)
          },
          {
            path: 'student-record',
            loadChildren: () =>
              import('../student-record/student-record-routing.module').then(m => m.StudentRecordPageRoutingModule)
            // loadChildren: '../student-record/student-record-routing.module#StudentRecordPageRoutingModule' 
          },
          {
            path: ':time',
            loadChildren: '../times/times.module#TimesPageModule'
          }
        ]
      },
      {
        path: 'tab2',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../tab2/tab2.module').then(m => m.Tab2PageModule)
          }
        ]
      },
      {
        path: 'tab3',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../tab3/tab3.module').then(m => m.Tab3PageModule)
          }
        ]
      },
      {
        path: '',
        redirectTo: '/tabs/times',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/times',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes), TimesPageModule, StudentRecordPageRoutingModule],
  exports: [RouterModule]
})
export class TabsPageRoutingModule { }
