import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SchoolReportRoutingModule } from './school-report-routing.module';
import { SchoolReportComponent } from './school-report.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TableComponent } from 'src/app/shared/components/table/table.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatMenuModule } from '@angular/material/menu';
import { DashPipe } from 'src/app/core/pipes/dash.pipe';
import { NumberTransformPipe } from 'src/app/core/pipes/number-tranform.pipe';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { HorizontalScrollDirective } from 'src/app/core/directives/horizontal-scroll.directive';


@NgModule({
  declarations: [
    SchoolReportComponent
  ],
  imports: [
    CommonModule,
    SchoolReportRoutingModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    FormsModule,
    TranslateModule,
    TableComponent,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatMenuModule,
    DashPipe,
    NumberTransformPipe,
    MatCheckboxModule,
    MatTooltipModule,
    TranslateModule,
    MatIconModule,
    HorizontalScrollDirective

  ]
})
export class SchoolReportModule { }
