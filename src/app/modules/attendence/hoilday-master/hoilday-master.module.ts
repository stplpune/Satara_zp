import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HoildayMasterRoutingModule } from './hoilday-master-routing.module';
import { HoildayMasterComponent } from './hoilday-master.component';
import { AddHoildayMasterComponent } from './add-hoilday-master/add-hoilday-master.component';


@NgModule({
  declarations: [
    HoildayMasterComponent,
    AddHoildayMasterComponent
  ],
  imports: [
    CommonModule,
    HoildayMasterRoutingModule
  ]
})
export class HoildayMasterModule { }
