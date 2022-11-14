import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfileRoutingModule } from './profile-routing.module';
import { ProfilePageComponent } from './profile.page/profile.page.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    ProfilePageComponent,
  ],
  imports: [
    CommonModule,
    ProfileRoutingModule,
    SharedModule,
  ]
})
export class ProfileModule { }
