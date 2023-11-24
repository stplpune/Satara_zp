import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Dashbaord2RoutingModule } from './dashbaord2-routing.module';
import { Dashbaord2Component } from './dashbaord2.component';


@NgModule({
  declarations: [
    Dashbaord2Component
  ],
  imports: [
    CommonModule,
    Dashbaord2RoutingModule
  ]
})
export class Dashbaord2Module { }
