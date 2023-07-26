import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StoreMasterRoutingModule } from './store-master-routing.module';
import { StoreMasterComponent } from './store-master.component';


@NgModule({
  declarations: [
    StoreMasterComponent
  ],
  imports: [
    CommonModule,
    StoreMasterRoutingModule
  ]
})
export class StoreMasterModule { }
