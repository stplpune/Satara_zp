import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CctvLocationRegistrationRoutingModule } from './cctv-location-registration-routing.module';
import { CctvLocationRegistrationComponent } from './cctv-location-registration.component';


@NgModule({
  declarations: [
    CctvLocationRegistrationComponent
  ],
  imports: [
    CommonModule,
    CctvLocationRegistrationRoutingModule
  ]
})
export class CctvLocationRegistrationModule { }
