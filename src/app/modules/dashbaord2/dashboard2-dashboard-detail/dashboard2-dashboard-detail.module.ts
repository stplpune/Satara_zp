import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Dashboard2DashboardDetailRoutingModule } from './dashboard2-dashboard-detail-routing.module';
import { Dashboard2DashboardDetailComponent } from './dashboard2-dashboard-detail.component';
import { TableComponent } from 'src/app/shared/components/table/table.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTableModule } from '@angular/material/table';
import { TranslateModule } from '@ngx-translate/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { DashboardRoutingModule } from '../../dashboard/dashboard-routing.module';


@NgModule({
  declarations: [
    Dashboard2DashboardDetailComponent,
    
  ],
  imports: [
    CommonModule,
    Dashboard2DashboardDetailRoutingModule,
    TableComponent,
    FormsModule,
    ReactiveFormsModule,
    DashboardRoutingModule,
    MatSelectModule,
    MatCardModule,
    NgApexchartsModule,
    TranslateModule,
    MatTableModule,
    MatCheckboxModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatRadioModule,
    MatFormFieldModule,
    MatInputModule,
  ]
})
export class Dashboard2DashboardDetailModule { }
