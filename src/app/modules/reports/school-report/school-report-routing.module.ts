import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SchoolReportComponent } from './school-report.component';

const routes: Routes = [{ path: '', component: SchoolReportComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SchoolReportRoutingModule { }
