import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Dashbaord2Component } from './dashbaord2.component';

const routes: Routes = [{ path: '', component: Dashbaord2Component }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class Dashbaord2RoutingModule { }
