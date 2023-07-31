import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TasksheetComponent } from './tasksheet.component';

const routes: Routes = [{ path: '', component: TasksheetComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TasksheetRoutingModule { }
