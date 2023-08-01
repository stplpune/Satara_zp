import { Component } from '@angular/core';
import { AddHoildayMasterComponent } from './add-hoilday-master/add-hoilday-master.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-hoilday-master',
  templateUrl: './hoilday-master.component.html',
  styleUrls: ['./hoilday-master.component.scss']
})
export class HoildayMasterComponent {
  displayedColumns: string[] = ['position', 'name', 'weight','Action'];
  dataSource = ELEMENT_DATA;
  viewStatus='Table';
  constructor(public dialog: MatDialog) {}


  foods: Food[] = [
    {value: 'steak-0', viewValue: 'July-2023'},
    {value: 'pizza-1', viewValue: 'Aug-2023'},
    {value: 'tacos-2', viewValue: 'Sept-2023'},
  ]

  openDialog() {
    this['dialog'].open(AddHoildayMasterComponent, {
      width: '400px',
    });
  }
}

interface Food {
  value: string;
  viewValue: string;
}
export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  Action:any;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: 'Hydrogen', weight: 1.0079,Action:'',},
  {position: 2, name: 'Hydrogen', weight: 1.0079,Action:'',},
  {position: 3, name: 'Hydrogen', weight: 1.0079,Action:'',},
  
  
];