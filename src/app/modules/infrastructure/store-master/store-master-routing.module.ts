import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StoreMasterComponent } from './store-master.component';

const routes: Routes = [{ path: '', component: StoreMasterComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StoreMasterRoutingModule { }
