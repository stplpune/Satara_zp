import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Dashboard3RoutingModule } from './dashboard3-routing.module';
import { Dashboard3Component } from './dashboard3.component';


@NgModule({
  declarations: [
    Dashboard3Component
  ],
  imports: [
    CommonModule,
    Dashboard3RoutingModule
  ]
})
export class Dashboard3Module { }
