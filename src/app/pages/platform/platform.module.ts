import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrivateSharedModule } from 'src/app/shared/private-shared.module';
import { SharedModule } from 'src/app/shared/shared.module';

import { PlatformRoutingModule } from './platform-routing.module';
import { PlatformPageComponent } from './platform.page/platform.page.component';
import { GoalPageComponent } from './goal.page/goal.page.component';
import { GoalsPageComponent } from './goals.page/goals.page.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgbDropdownModule, NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { QuillModule } from 'ngx-quill';


@NgModule({
  declarations: [
    PlatformPageComponent,
    GoalPageComponent,
    GoalsPageComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PlatformRoutingModule,
    PrivateSharedModule,
    SharedModule,

    NgbDropdownModule,
    NgbTypeaheadModule,
    FormsModule,
    QuillModule.forRoot(),
  ]
})
export class PlatformModule { }
