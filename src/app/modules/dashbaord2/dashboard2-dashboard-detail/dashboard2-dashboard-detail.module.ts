import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Dashboard2DashboardDetailRoutingModule } from './dashboard2-dashboard-detail-routing.module';
import { Dashboard2DashboardDetailComponent } from './dashboard2-dashboard-detail.component';
import { TableComponent } from 'src/app/shared/components/table/table.component';


@NgModule({
  declarations: [
    Dashboard2DashboardDetailComponent,
    
  ],
  imports: [
    CommonModule,
    Dashboard2DashboardDetailRoutingModule,
    TableComponent
  ]
})
export class Dashboard2DashboardDetailModule { }
