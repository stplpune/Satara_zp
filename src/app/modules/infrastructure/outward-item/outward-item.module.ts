import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OutwardItemRoutingModule } from './outward-item-routing.module';
import { OutwardItemComponent } from './outward-item.component';


@NgModule({
  declarations: [
    OutwardItemComponent,
  ],
  imports: [
    CommonModule,
    OutwardItemRoutingModule
  ]
})
export class OutwardItemModule { }
