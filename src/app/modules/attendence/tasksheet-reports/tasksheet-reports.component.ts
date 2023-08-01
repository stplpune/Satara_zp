import { Component } from '@angular/core';

@Component({
  selector: 'app-tasksheet-reports',
  templateUrl: './tasksheet-reports.component.html',
  styleUrls: ['./tasksheet-reports.component.scss']
})
export class TasksheetReportsComponent {
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol','Absent','Action'];
  dataSource = ELEMENT_DATA;
  viewStatus='Table';
}
export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
  Absent:any;
  Action:any;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: '0',Absent:'0',Action:''},
  {position: 2, name: 'Hydrogen', weight: 1.0079, symbol: '2',Absent:'5',Action:''},
  {position: 3, name: 'Hydrogen', weight: 1.0079, symbol: '1',Absent:'3',Action:''},
  {position: 4, name: 'Hydrogen', weight: 1.0079, symbol: '5',Absent:'4',Action:''},
  
];