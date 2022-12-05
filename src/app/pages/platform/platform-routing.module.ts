import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from 'src/app/shared/global/layout/layout.component';
import { PlatformPageComponent } from './platform.page/platform.page.component';
import { ProjectPageComponent } from './project.page/project.page.component';

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
        component: ProjectPageComponent,
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlatformRoutingModule { }
