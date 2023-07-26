import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VendorMasterRoutingModule } from './vendor-master-routing.module';
import { VendorMasterComponent } from './vendor-master.component';


@NgModule({
  declarations: [
    VendorMasterComponent
  ],
  imports: [
    CommonModule,
    VendorMasterRoutingModule
  ]
})
export class VendorMasterModule { }
