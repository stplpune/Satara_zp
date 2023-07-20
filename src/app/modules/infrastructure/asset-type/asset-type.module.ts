import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AssetTypeRoutingModule } from './asset-type-routing.module';
import { AssetTypeComponent } from './asset-type.component';


@NgModule({
  declarations: [
    AssetTypeComponent
  ],
  imports: [
    CommonModule,
    AssetTypeRoutingModule
  ]
})
export class AssetTypeModule { }
