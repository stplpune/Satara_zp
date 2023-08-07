import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddCctvLocationComponent } from './add-cctv-location/add-cctv-location.component';

@Component({
  selector: 'app-cctv-location-registration',
  templateUrl: './cctv-location-registration.component.html',
  styleUrls: ['./cctv-location-registration.component.scss']
})
export class CctvLocationRegistrationComponent {
  viewStatus = 'Table';
  constructor(public dialog: MatDialog) {}

  openDialog() {
    const dialogRef = this.dialog.open(AddCctvLocationComponent,{
      width: '500px',
      disableClose: true,
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }
}
