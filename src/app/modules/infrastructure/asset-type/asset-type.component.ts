import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddAssetTypeComponent } from './add-asset-type/add-asset-type.component';

@Component({
  selector: 'app-asset-type',
  templateUrl: './asset-type.component.html',
  styleUrls: ['./asset-type.component.scss']
})
export class AssetTypeComponent {
  viewStatus='Table';
  displayedColumns: string[] = ['position', 'name', 'SubCategory','AssetType','weight', 'symbol'];
  dataSource = ELEMENT_DATA;

  constructor(public dialog: MatDialog) {}

  openDialog() {
    const dialogRef = this.dialog.open(AddAssetTypeComponent,{
      width: '400px',
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
  weight: any;
  symbol: any;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: 'Hydrogen', SubCategory:'Table', AssetType:'Wooden',weight: 1.0079, symbol: 'H'},
  {position: 2, name: 'Hydrogen', SubCategory:'Table', AssetType:'Wooden',weight: 1.0079, symbol: 'H'},
  {position: 3, name: 'Hydrogen', SubCategory:'Table', AssetType:'Wooden',weight: 1.0079, symbol: 'H'},
  {position: 4, name: 'Hydrogen', SubCategory:'Table', AssetType:'Wooden',weight: 1.0079, symbol: 'H'},
];
