import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from "@angular/router";
import { ReactiveFormsModule } from '@angular/forms';

import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';


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
import { UserInfoComponent } from './global/user-info/user-info.component';


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
    UserInfoComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    NgbDropdownModule,
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
    UserInfoComponent,
  ],
  providers: [
    DataService,
  ],
})
export class SharedModule { }
