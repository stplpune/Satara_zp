import { Component } from '@angular/core';
import { AddTasksheetComponent } from './add-tasksheet/add-tasksheet.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-tasksheet',
  templateUrl: './tasksheet.component.html',
  styleUrls: ['./tasksheet.component.scss']
})
export class TasksheetComponent {
  [x: string]: any;
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol','Attendence','Remark','Action'];
  dataSource = ELEMENT_DATA;
  viewStatus='Table';
  constructor(public dialog: MatDialog) {}


  foods: Food[] = [
    {value: 'steak-0', viewValue: 'July-2023'},
    {value: 'pizza-1', viewValue: 'Aug-2023'},
    {value: 'tacos-2', viewValue: 'Sept-2023'},
  ]

  openDialog() {
    this['dialog'].open(AddTasksheetComponent, {
      width: '500px',
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
  symbol: string;
  Attendence:any;
  Remark:any;
  Action:any;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H',Attendence:'',Remark:'',Action:'',},
  {position: 2, name: 'Hydrogen', weight: 1.0079, symbol: 'H',Attendence:'',Remark:'',Action:'',},
  {position:31, name: 'Hydrogen', weight: 1.0079, symbol: 'H',Attendence:'',Remark:'',Action:'',},
  
];