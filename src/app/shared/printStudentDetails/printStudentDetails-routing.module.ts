import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PrintStudentDetailsComponent } from './printStudentDetails.component';

const routes: Routes = [ { path: '', component: PrintStudentDetailsComponent }]
  

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
export class PrintStudentDetailsRoutingModule { }
