import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AttendancePermissionComponent } from './attendance-permission/attendance-permission.component';

@Component({
  selector: 'app-attendance-approval',
  templateUrl: './attendance-approval.component.html',
  styleUrls: ['./attendance-approval.component.scss']
})
export class AttendanceApprovalComponent {
  viewStatus = 'Table';

  constructor(public dialog: MatDialog) {}

  openDialog() {
    const dialogRef = this.dialog.open(AttendancePermissionComponent, {
      width: '400px',
      disableClose: true,
      autoFocus: false
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }
}
