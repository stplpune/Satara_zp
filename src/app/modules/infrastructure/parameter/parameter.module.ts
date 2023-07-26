import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ParameterRoutingModule } from './parameter-routing.module';
import { ParameterComponent } from './parameter.component';


@NgModule({
  declarations: [
    ParameterComponent
  ],
  imports: [
    CommonModule,
    ParameterRoutingModule
  ]
})
export class ParameterModule { }
