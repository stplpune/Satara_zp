import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AddTestRoutingModule } from './add-test-routing.module';
import { AddTestComponent } from './add-test.component';


@NgModule({
  declarations: [
    AddTestComponent
  ],
  imports: [
    CommonModule,
    AddTestRoutingModule
  ]
})
export class AddTestModule { }
