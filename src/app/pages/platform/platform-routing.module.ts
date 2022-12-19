import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from 'src/app/shared/global/layout/layout.component';
import { GoalsPageComponent } from './goals.page/goals.page.component';
import { PlatformPageComponent } from './platform.page/platform.page.component';
import { GoalPageComponent } from './goal.page/goal.page.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        component: PlatformPageComponent,
      },
      {
        path: ':projectId',
        component: GoalsPageComponent,
      },
      {
        path: ':projectId/:goalId',
        component: GoalPageComponent,
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlatformRoutingModule { }
