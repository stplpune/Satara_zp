import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OfficerVisitReportComponent } from './officer-visit-report.component';

const routes: Routes = [{ path: '', component: OfficerVisitReportComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OfficerVisitReportRoutingModule { }
