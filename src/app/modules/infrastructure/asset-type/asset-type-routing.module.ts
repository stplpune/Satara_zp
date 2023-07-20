import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AssetTypeComponent } from './asset-type.component';

const routes: Routes = [{ path: '', component: AssetTypeComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssetTypeRoutingModule { }
