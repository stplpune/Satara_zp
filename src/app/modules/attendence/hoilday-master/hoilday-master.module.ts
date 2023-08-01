import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HoildayMasterRoutingModule } from './hoilday-master-routing.module';
import { HoildayMasterComponent } from './hoilday-master.component';
import { AddHoildayMasterComponent } from './add-hoilday-master/add-hoilday-master.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { GlobalDialogComponent } from 'src/app/shared/components/global-dialog/global-dialog.component';
import { GlobalImgComponent } from 'src/app/shared/components/global-img/global-img.component';
import { GridViewComponent } from 'src/app/shared/components/grid-view/grid-view.component';
import { PageStatisticsComponent } from 'src/app/shared/components/page-statistics/page-statistics.component';
import { TableComponent } from 'src/app/shared/components/table/table.component';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';


@NgModule({
  declarations: [
    HoildayMasterComponent,
    AddHoildayMasterComponent
  ],
  imports: [
    CommonModule,
    HoildayMasterRoutingModule,
    MatDialogModule,
    MatSelectModule,
    MatCardModule,
    MatFormFieldModule,
    MatPaginatorModule,
    MatMenuModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    ReactiveFormsModule,
    GlobalDialogComponent,
    TableComponent,
    PageStatisticsComponent,
    GlobalImgComponent,
    TranslateModule,
    GridViewComponent,
    MatTooltipModule,
    MatTableModule,
    MatRadioModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ]
})
export class HoildayMasterModule { }
