import { Component } from '@angular/core';

@Component({
  selector: 'app-attendance-permission',
  templateUrl: './attendance-permission.component.html',
  styleUrls: ['./attendance-permission.component.scss']
})
export class AttendancePermissionComponent {
  editFlag:boolean=false;
  editId:any;
}
