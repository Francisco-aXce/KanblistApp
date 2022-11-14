import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrivateSharedModule } from 'src/app/shared/private-shared.module';
import { SharedModule } from 'src/app/shared/shared.module';

import { PlatformRoutingModule } from './platform-routing.module';
import { PlatformPageComponent } from './platform.page/platform.page.component';


@NgModule({
  declarations: [
    PlatformPageComponent
  ],
  imports: [
    CommonModule,
    PlatformRoutingModule,
    PrivateSharedModule,
    SharedModule,
  ]
})
export class PlatformModule { }
