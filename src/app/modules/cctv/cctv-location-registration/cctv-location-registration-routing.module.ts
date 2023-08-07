import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CctvLocationRegistrationComponent } from './cctv-location-registration.component';

const routes: Routes = [{ path: '', component: CctvLocationRegistrationComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CctvLocationRegistrationRoutingModule { }
