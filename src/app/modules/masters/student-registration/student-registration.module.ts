import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StudentRegistrationRoutingModule } from './student-registration-routing.module';
// import { AddUpdateStudentRegistrationComponent } from './add-update-student-registration/add-update-student-registration.component';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import { StudentRegistrationComponent } from './student-registration.component';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import {MatMenuModule} from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginatorModule } from '@angular/material/paginator';
import { GlobalDialogComponent } from 'src/app/shared/components/global-dialog/global-dialog.component';
import { TableComponent } from 'src/app/shared/components/table/table.component';
import { PageStatisticsComponent } from 'src/app/shared/components/page-statistics/page-statistics.component';
import { TranslateModule } from '@ngx-translate/core';
import { GridViewComponent } from 'src/app/shared/components/grid-view/grid-view.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { AddUpdateStudentComponent } from './add-update-student/add-update-student/add-update-student.component';
import { AddCastComponent } from './add-cast/add-cast.component';


@NgModule({
  declarations: [
    // AddUpdateStudentRegistrationComponent,
    StudentRegistrationComponent,
    AddUpdateStudentComponent,
    AddCastComponent
  ],
  imports: [
    CommonModule,
    StudentRegistrationRoutingModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatMenuModule,
    MatIconModule,
    ReactiveFormsModule,
    FormsModule,
    MatPaginatorModule,
    GlobalDialogComponent,
    TableComponent,
    PageStatisticsComponent,
    TranslateModule,
    GridViewComponent,
    MatTooltipModule,
    MatTableModule,
    MatCheckboxModule,
    MatDialogModule,
 
  ]
})
export class StudentRegistrationModule {
  
 }
