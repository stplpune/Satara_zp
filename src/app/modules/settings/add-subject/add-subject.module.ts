import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AddSubjectRoutingModule } from './add-subject-routing.module';
import { AddSubjectComponent } from './add-subject.component';


@NgModule({
  declarations: [
    AddSubjectComponent
  ],
  imports: [
    CommonModule,
    AddSubjectRoutingModule
  ]
})
export class AddSubjectModule { }
