import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CctvRoutingModule } from './cctv-routing.module';
import { CctvComponent } from './cctv.component';


@NgModule({
  declarations: [
    CctvComponent
  ],
  imports: [
    CommonModule,
    CctvRoutingModule
  ]
})
export class CctvModule { }
