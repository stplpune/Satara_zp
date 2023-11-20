import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AssessmentConfigurationRoutingModule } from './assessment-configuration-routing.module';
import { AssessmentConfigurationComponent } from './assessment-configuration.component';
import { AddAssessmentConfigurationComponent } from './add-assessment-configuration/add-assessment-configuration.component';


@NgModule({
  declarations: [
    AssessmentConfigurationComponent,
    AddAssessmentConfigurationComponent
  ],
  imports: [
    CommonModule,
    AssessmentConfigurationRoutingModule
  ]
})
export class AssessmentConfigurationModule { }
