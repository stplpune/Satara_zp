import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AssessmentConfigurationRoutingModule } from './assessment-configuration-routing.module';
import { AssessmentConfigurationComponent } from './assessment-configuration.component';
import { AddAssessmentConfigurationComponent } from './add-assessment-configuration/add-assessment-configuration.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { TranslateModule } from '@ngx-translate/core';
import { GlobalDialogComponent } from 'src/app/shared/components/global-dialog/global-dialog.component';
import { PageStatisticsComponent } from 'src/app/shared/components/page-statistics/page-statistics.component';
import { TableComponent } from 'src/app/shared/components/table/table.component';
import { MatTooltipModule } from '@angular/material/tooltip';


@NgModule({
  declarations: [
    AssessmentConfigurationComponent,
    AddAssessmentConfigurationComponent
  ],
  imports: [
    CommonModule,
    AssessmentConfigurationRoutingModule,
    MatDialogModule,
    MatSelectModule,
    MatCardModule,
    MatFormFieldModule,
    MatPaginatorModule,
    MatMenuModule,
    MatButtonModule,
    MatInputModule, 
    ReactiveFormsModule,
    GlobalDialogComponent,
    TableComponent,
    PageStatisticsComponent,
    TranslateModule,
    ReactiveFormsModule,
    FormsModule,
    MatIconModule,
    MatTableModule,
    TableComponent,
    MatTooltipModule
  ]
})
export class AssessmentConfigurationModule { }
