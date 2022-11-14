import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from "@angular/router";

import { LandingRoutingModule } from './landing-routing.module';
import { LandingPageComponent } from './landing.page/landing.page.component';


@NgModule({
  declarations: [
    LandingPageComponent,
  ],
  imports: [
    CommonModule,
    LandingRoutingModule,
    RouterModule,
  ]
})
export class LandingModule { }
