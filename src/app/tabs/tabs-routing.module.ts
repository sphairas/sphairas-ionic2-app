import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

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
        ]
      },
      {
        path: 'lessons',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../lessons/lessons.module').then(m => m.LessonsPageModule)
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
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule { }
