import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CriteriaWiseQuestionRoutingModule } from './criteria-wise-question-routing.module';
import { CriteriaWiseQuestionComponent } from './criteria-wise-question.component';
import { AddCriteriaWiseQuestionComponent } from './add-criteria-wise-question/add-criteria-wise-question.component';


@NgModule({
  declarations: [
    CriteriaWiseQuestionComponent,
    AddCriteriaWiseQuestionComponent
  ],
  imports: [
    CommonModule,
    CriteriaWiseQuestionRoutingModule
  ]
})
export class CriteriaWiseQuestionModule { }
