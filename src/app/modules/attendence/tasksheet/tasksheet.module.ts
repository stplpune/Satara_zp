import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TasksheetRoutingModule } from './tasksheet-routing.module';
import { TasksheetComponent } from './tasksheet.component';
import { AddTasksheetComponent } from './add-tasksheet/add-tasksheet.component';


@NgModule({
  declarations: [
    TasksheetComponent,
    AddTasksheetComponent
  ],
  imports: [
    CommonModule,
    TasksheetRoutingModule
  ]
})
export class TasksheetModule { }
