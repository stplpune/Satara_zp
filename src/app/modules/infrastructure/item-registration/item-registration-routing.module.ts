import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ItemRegistrationComponent } from './item-registration.component';

const routes: Routes = [{ path: '', component: ItemRegistrationComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ItemRegistrationRoutingModule { }
