import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StudentReportComponent } from './student-report.component';

const routes: Routes = [{ path: '', component: StudentReportComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StudentReportRoutingModule { }
