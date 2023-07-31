import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TasksheetReportsRoutingModule } from './tasksheet-reports-routing.module';
import { TasksheetReportsComponent } from './tasksheet-reports.component';


@NgModule({
  declarations: [
    TasksheetReportsComponent
  ],
  imports: [
    CommonModule,
    TasksheetReportsRoutingModule
  ]
})
export class TasksheetReportsModule { }
