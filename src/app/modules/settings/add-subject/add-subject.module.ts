import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AddSubjectRoutingModule } from './add-subject-routing.module';
import { AddSubjectComponent } from './add-subject.component';
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
import { TranslateModule } from '@ngx-translate/core';
import { GlobalDialogComponent } from 'src/app/shared/components/global-dialog/global-dialog.component';
import { PageStatisticsComponent } from 'src/app/shared/components/page-statistics/page-statistics.component';
import { TableComponent } from 'src/app/shared/components/table/table.component';
import {MatTableModule} from '@angular/material/table';


@NgModule({
  declarations: [
    AddSubjectComponent
  ],
  imports: [
    CommonModule,
    AddSubjectRoutingModule,
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
    MatTableModule
  ]
})
export class AddSubjectModule { }
