import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HoildayMasterComponent } from './hoilday-master.component';

const routes: Routes = [{ path: '', component: HoildayMasterComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HoildayMasterRoutingModule { }
