import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Dashboard2DashboardDetailRoutingModule } from './dashboard2-dashboard-detail-routing.module';
import { Dashboard2DashboardDetailComponent } from './dashboard2-dashboard-detail.component';


@NgModule({
  declarations: [
    Dashboard2DashboardDetailComponent
  ],
  imports: [
    CommonModule,
    Dashboard2DashboardDetailRoutingModule
  ]
})
export class Dashboard2DashboardDetailModule { }
