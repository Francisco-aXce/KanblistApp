import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from 'src/app/shared/global/layout/layout.component';
import { LoginPageComponent } from './login.page/login.page.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'login',
        component: LoginPageComponent
      },
      // {
      //   path: 'register',
      //   component: RegisterPageComponent
      // },
      {
        path: '**',
        redirectTo: 'login',
        pathMatch: 'full',
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
