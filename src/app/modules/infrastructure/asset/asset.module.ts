import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AssetRoutingModule } from './asset-routing.module';
import { AssetComponent } from './asset.component';


@NgModule({
  declarations: [
    AssetComponent
  ],
  imports: [
    CommonModule,
    AssetRoutingModule
  ]
})
export class AssetModule { }
