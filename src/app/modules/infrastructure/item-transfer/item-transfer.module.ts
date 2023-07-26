import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ItemTransferRoutingModule } from './item-transfer-routing.module';
import { ItemTransferComponent } from './item-transfer.component';


@NgModule({
  declarations: [
    ItemTransferComponent
  ],
  imports: [
    CommonModule,
    ItemTransferRoutingModule
  ]
})
export class ItemTransferModule { }
