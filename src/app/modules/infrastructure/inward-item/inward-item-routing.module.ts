import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InwardItemComponent } from './inward-item.component';

const routes: Routes = [{ path: '', component: InwardItemComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InwardItemRoutingModule { }
