import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AssessmentConfigurationComponent } from './assessment-configuration.component';

const routes: Routes = [{ path: '', component: AssessmentConfigurationComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssessmentConfigurationRoutingModule { }
