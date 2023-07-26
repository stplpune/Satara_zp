import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ItemRegistrationRoutingModule } from './item-registration-routing.module';
import { ItemRegistrationComponent } from './item-registration.component';


@NgModule({
  declarations: [
    ItemRegistrationComponent
  ],
  imports: [
    CommonModule,
    ItemRegistrationRoutingModule
  ]
})
export class ItemRegistrationModule { }
