import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Dashboard3Component } from './dashboard3.component';

const routes: Routes = [{ path: '', component: Dashboard3Component }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class Dashboard3RoutingModule { }
