import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Dashboard2DashboardDetailComponent } from './dashboard2-dashboard-detail.component';

const routes: Routes = [{ path: '', component: Dashboard2DashboardDetailComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class Dashboard2DashboardDetailRoutingModule { }
