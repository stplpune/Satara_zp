import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TeacherReportRoutingModule } from './teacher-report-routing.module';
import { TeacherReportComponent } from './teacher-report.component';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatNativeDateModule } from '@angular/material/core';
import { TableComponent } from 'src/app/shared/components/table/table.component';

@NgModule({
  declarations: [
    TeacherReportComponent
  ],
  imports: [
    CommonModule,
    TeacherReportRoutingModule,
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
    MatTooltipModule,
    TableComponent
  ]
})
export class TeacherReportModule { }
