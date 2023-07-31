import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TasksheetReportsComponent } from './tasksheet-reports.component';

const routes: Routes = [{ path: '', component: TasksheetReportsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TasksheetReportsRoutingModule { }
