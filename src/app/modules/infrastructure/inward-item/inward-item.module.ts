import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InwardItemRoutingModule } from './inward-item-routing.module';
import { InwardItemComponent } from './inward-item.component';


@NgModule({
  declarations: [
    InwardItemComponent
  ],
  imports: [
    CommonModule,
    InwardItemRoutingModule
  ]
})
export class InwardItemModule { }
