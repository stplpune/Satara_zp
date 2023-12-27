import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OfficerVisitReportRoutingModule } from './officer-visit-report-routing.module';
import { OfficerVisitReportComponent } from './officer-visit-report.component';


@NgModule({
  declarations: [
    OfficerVisitReportComponent
  ],
  imports: [
    CommonModule,
    OfficerVisitReportRoutingModule
  ]
})
export class OfficerVisitReportModule { }
