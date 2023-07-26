import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VendorMasterComponent } from './vendor-master.component';

const routes: Routes = [{ path: '', component: VendorMasterComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VendorMasterRoutingModule { }
