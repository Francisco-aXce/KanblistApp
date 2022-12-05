import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from "@angular/router";
import { ReactiveFormsModule } from '@angular/forms';

import { TakeNWordPipe } from '../pipes/take-n-word.pipe';

import { LayoutComponent } from './global/layout/layout.component';
import { PublicProfileComponent } from './auth/public-profile/public-profile.component';
import { PrivateProfileComponent } from './auth/private-profile/private-profile.component';
import { NavbarComponent } from './global/navbar/navbar.component';
import { LoginComponent } from './auth/login/login.component';
import { ProjectCardComponent } from './project/project-card/project-card.component';
import { RegisterComponent } from './auth/register/register.component';
import { ProjectsDropdownComponent } from './project/projects-dropdown/projects-dropdown.component';
import { ProjectHeaderComponent } from './project/project-header/project-header.component';
import { BoardComponent } from './project/board/board.component';


@NgModule({
  declarations: [
    TakeNWordPipe,

    NavbarComponent,
    LayoutComponent,
    PublicProfileComponent,
    PrivateProfileComponent,
    LoginComponent,
    RegisterComponent,
    ProjectCardComponent,
    ProjectsDropdownComponent,
    ProjectHeaderComponent,
    BoardComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
  ],
  exports: [
    TakeNWordPipe,

    PublicProfileComponent,
    LoginComponent,
    RegisterComponent,
    ProjectCardComponent,
    NavbarComponent,
    ProjectsDropdownComponent,
    ProjectHeaderComponent,
    BoardComponent,
  ]
})
export class SharedModule { }
