import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AttendanceApprovalComponent } from './attendance-approval.component';

const routes: Routes = [{ path: '', component: AttendanceApprovalComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AttendanceApprovalRoutingModule { }
