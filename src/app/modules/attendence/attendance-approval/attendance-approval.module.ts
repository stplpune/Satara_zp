import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AttendanceApprovalRoutingModule } from './attendance-approval-routing.module';
import { AttendanceApprovalComponent } from './attendance-approval.component';
import { AttendancePermissionComponent } from './attendance-permission/attendance-permission.component';


@NgModule({
  declarations: [
    AttendanceApprovalComponent,
    AttendancePermissionComponent
  ],
  imports: [
    CommonModule,
    AttendanceApprovalRoutingModule
  ]
})
export class AttendanceApprovalModule { }
