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
import { ProjectHeaderComponent } from './project/project-header/project-header.component';
import { BoardComponent } from './project/board/board.component';
import { ProjectsSectionComponent } from './project/projects-section/projects-section.component';
import { TaskComponent } from './project/task/task.component';
import { DataService } from '../services/data.service';


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
    ProjectHeaderComponent,
    ProjectsSectionComponent,
    TaskComponent,
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
    ProjectHeaderComponent,
    ProjectsSectionComponent,
    TaskComponent,
    BoardComponent,
  ],
  providers: [
    DataService,
  ],
})
export class SharedModule { }
