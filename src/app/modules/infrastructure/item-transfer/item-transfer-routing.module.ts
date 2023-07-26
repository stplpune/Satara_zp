import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ItemTransferComponent } from './item-transfer.component';

const routes: Routes = [{ path: '', component: ItemTransferComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ItemTransferRoutingModule { }
