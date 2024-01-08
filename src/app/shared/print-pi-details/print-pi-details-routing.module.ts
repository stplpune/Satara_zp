import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PrintPiDetailsComponent } from './print-pi-details.component';

const routes: Routes = [{ path: '', component: PrintPiDetailsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PrintPiDetailsRoutingModule { }
