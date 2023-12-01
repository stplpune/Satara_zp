import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CriteriaWiseQuestionComponent } from './criteria-wise-question.component';

const routes: Routes = [{ path: '', component: CriteriaWiseQuestionComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CriteriaWiseQuestionRoutingModule { }
