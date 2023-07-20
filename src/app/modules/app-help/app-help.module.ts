import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppHelpRoutingModule } from './app-help-routing.module';
import { AppHelpComponent } from './app-help.component';


@NgModule({
  declarations: [
    AppHelpComponent
  ],
  imports: [
    CommonModule,
    AppHelpRoutingModule
  ]
})
export class AppHelpModule { }
