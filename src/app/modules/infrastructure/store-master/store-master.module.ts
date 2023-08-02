import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreMasterRoutingModule } from './store-master-routing.module';
import { StoreMasterComponent } from './store-master.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { AutofocusDirective } from 'src/app/core/directives/autofocus.directive';
import { GlobalDialogComponent } from 'src/app/shared/components/global-dialog/global-dialog.component';
import { GridViewComponent } from 'src/app/shared/components/grid-view/grid-view.component';
import { PageStatisticsComponent } from 'src/app/shared/components/page-statistics/page-statistics.component';
import { TableComponent } from 'src/app/shared/components/table/table.component';
import { ViewStockDetailsComponent } from './view-stock-details/view-stock-details.component';


@NgModule({
  declarations: [
    StoreMasterComponent,
    ViewStockDetailsComponent
  ],
  imports: [
    CommonModule,
    StoreMasterRoutingModule,
    MatDialogModule,
    MatSelectModule,
    MatCardModule,
    MatFormFieldModule,
    MatPaginatorModule,
    MatMenuModule,
    MatButtonModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    ReactiveFormsModule,
    FormsModule,
    GlobalDialogComponent,
    TableComponent,
    PageStatisticsComponent,
    AutofocusDirective,
    TranslateModule,
    GridViewComponent,
    MatTooltipModule
  ]
})
export class StoreMasterModule { }
