import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from "@angular/router";
import { DataService } from '../services/data.service';

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    RouterModule,
  ],
  exports: [
  ],
  providers: [
    DataService
  ]
})
export class PrivateSharedModule { }
