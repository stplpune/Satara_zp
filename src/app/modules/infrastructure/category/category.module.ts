import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryRoutingModule } from './category-routing.module';
import { CategoryComponent } from './category.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { AutofocusDirective } from 'src/app/core/directives/autofocus.directive';
import { GlobalDialogComponent } from 'src/app/shared/components/global-dialog/global-dialog.component';
import { GridViewComponent } from 'src/app/shared/components/grid-view/grid-view.component';
import { PageStatisticsComponent } from 'src/app/shared/components/page-statistics/page-statistics.component';
import { TableComponent } from 'src/app/shared/components/table/table.component';
import { MatTableModule } from '@angular/material/table';
import { AddCategoryComponent } from './add-category/add-category.component';


@NgModule({
  declarations: [
    CategoryComponent,
    AddCategoryComponent
  ],
  imports: [
    CommonModule,
    CategoryRoutingModule,
    MatDialogModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatMenuModule,
    ReactiveFormsModule,
    TableComponent,
    PageStatisticsComponent,
    GlobalDialogComponent,
    TranslateModule,
    AutofocusDirective,
    GridViewComponent,
    MatTooltipModule,
    MatTableModule
  ]
})
export class CategoryModule { }
