import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AssetTypeRoutingModule } from './asset-type-routing.module';
import { AssetTypeComponent } from './asset-type.component';
import { AddAssetTypeComponent } from './add-asset-type/add-asset-type.component';


@NgModule({
  declarations: [
    AssetTypeComponent,
    AddAssetTypeComponent
  ],
  imports: [
    CommonModule,
    AssetTypeRoutingModule
  ]
})
export class AssetTypeModule { }
