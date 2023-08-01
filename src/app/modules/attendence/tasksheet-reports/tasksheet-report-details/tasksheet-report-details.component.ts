import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-tasksheet-report-details',
  standalone: true,
  imports: [ 
    CommonModule,
    MatSelectModule,
    MatCardModule,
    MatFormFieldModule,
    MatPaginatorModule,
    MatMenuModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    TranslateModule,
    MatTooltipModule,
    MatTableModule,
  ],
  templateUrl: './tasksheet-report-details.component.html',
  styleUrls: ['./tasksheet-report-details.component.scss']
})
export class TasksheetReportDetailsComponent {
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol','Absent','Remark'];
  dataSource = ELEMENT_DATA;
  viewStatus='Table';

}
export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
  Absent:any;
  Remark:any;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: '0',Absent:'0',Remark:''},
  {position: 2, name: 'Hydrogen', weight: 1.0079, symbol: '2',Absent:'5',Remark:''},
  {position: 3, name: 'Hydrogen', weight: 1.0079, symbol: '1',Absent:'3',Remark:''},
  {position: 4, name: 'Hydrogen', weight: 1.0079, symbol: '5',Absent:'4',Remark:''},
  
];