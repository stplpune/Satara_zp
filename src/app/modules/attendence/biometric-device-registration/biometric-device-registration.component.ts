import { Component } from '@angular/core';
import { AddBiometricDeviceRegistrationComponent } from './add-biometric-device-registration/add-biometric-device-registration.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-biometric-device-registration',
  templateUrl: './biometric-device-registration.component.html',
  styleUrls: ['./biometric-device-registration.component.scss']
})
export class BiometricDeviceRegistrationComponent {
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol', 'IPAddress', 'DeviceDirection'];
  dataSource = ELEMENT_DATA;
  constructor(public dialog: MatDialog) { }

  openDialog() {
    const dialogRef = this.dialog.open(AddBiometricDeviceRegistrationComponent, {
      width: '600px',
      disableClose: true,
      autoFocus: false,
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }
  getTableData() {
    throw new Error('Method not implemented.');
  }
}

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
  IPAddress: number;
  DeviceDirection: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  { position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H', IPAddress: 101120, DeviceDirection: 'top-right' },
  { position: 2, name: 'Hydrogen', weight: 1.0079, symbol: 'H', IPAddress: 101120, DeviceDirection: 'top-right' },
  { position: 3, name: 'Hydrogen', weight: 1.0079, symbol: 'H', IPAddress: 101120, DeviceDirection: 'top-right' },
  { position: 4, name: 'Hydrogen', weight: 1.0079, symbol: 'H', IPAddress: 101120, DeviceDirection: 'top-right' },
  { position: 5, name: 'Hydrogen', weight: 1.0079, symbol: 'H', IPAddress: 101120, DeviceDirection: 'top-right' },
];

