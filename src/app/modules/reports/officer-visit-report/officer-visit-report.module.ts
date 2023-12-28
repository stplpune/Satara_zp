import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OfficerVisitReportRoutingModule } from './officer-visit-report-routing.module';
import { OfficerVisitReportComponent } from './officer-visit-report.component';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';

@NgModule({
  declarations: [
    OfficerVisitReportComponent
  ],
  imports: [
    CommonModule,
    OfficerVisitReportRoutingModule,
    MatIconModule,
    TranslateModule,
    MatCardModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule
  ]
})
export class OfficerVisitReportModule { }
