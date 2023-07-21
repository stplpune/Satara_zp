import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddAssetComponent } from './add-asset/add-asset.component';

@Component({
  selector: 'app-asset',
  templateUrl: './asset.component.html',
  styleUrls: ['./asset.component.scss']
})
export class AssetComponent {
  viewStatus='Table';
  displayedColumns: string[] = ['position', 'name', 'SubCategory','AssetType','Quantity','Description','Date','Addedby','symbol'];
  dataSource = ELEMENT_DATA;

  constructor(public dialog: MatDialog) {}

  openDialog() {
    const dialogRef = this.dialog.open(AddAssetComponent,{
      width: '500px',
      disableClose: true,
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }
}

export interface PeriodicElement {
  name: string;
  position: any;
  SubCategory:any;
  AssetType:any;
  Quantity:any;
  Description:any;
  Date:any;
  Addedby:any;
  symbol: any;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: 'Hydrogen', SubCategory:'Table', AssetType:'Wooden',Quantity: 1.0079, Description: 'H',Date:'13/07/2023',Addedby:'Yuvraj Shinde',symbol:'',},
  {position: 2, name: 'Hydrogen', SubCategory:'Table', AssetType:'Wooden',Quantity: 1.0079, Description: 'H',Date:'14/08/2023',Addedby:'Yuvraj Shinde',symbol:'',},
  {position: 3, name: 'Hydrogen', SubCategory:'Table', AssetType:'Wooden',Quantity: 1.0079, Description: 'H',Date:'13/07/2023',Addedby:'Yuvraj Shinde',symbol:'',},
  {position: 4, name: 'Hydrogen', SubCategory:'Table', AssetType:'Wooden',Quantity: 1.0079, Description: 'H',Date:'14/08/2023',Addedby:'Yuvraj Shinde',symbol:'',},
];
