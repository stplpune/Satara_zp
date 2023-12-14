import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BiometricDeviceRegistrationRoutingModule } from './biometric-device-registration-routing.module';
import { BiometricDeviceRegistrationComponent } from './biometric-device-registration.component';


@NgModule({
  declarations: [
    BiometricDeviceRegistrationComponent
  ],
  imports: [
    CommonModule,
    BiometricDeviceRegistrationRoutingModule
  ]
})
export class BiometricDeviceRegistrationModule { }
