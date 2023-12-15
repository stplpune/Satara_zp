import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BiometricDeviceRegistrationComponent } from './biometric-device-registration.component';

const routes: Routes = [{ path: '', component: BiometricDeviceRegistrationComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BiometricDeviceRegistrationRoutingModule { }
