import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Dashboard3RoutingModule } from './dashboard3-routing.module';
import { Dashboard3Component } from './dashboard3.component';
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
import { MatSelectFilterModule } from 'mat-select-filter';
import { NgApexchartsModule } from 'ng-apexcharts';
import { DashboardRoutingModule } from '../dashboard/dashboard-routing.module';
import { TableComponent } from 'src/app/shared/components/table/table.component';


@NgModule({
  declarations: [
    Dashboard3Component
  ],
  imports: [
    CommonModule,
    Dashboard3RoutingModule,
    FormsModule,
    TableComponent,
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
    MatSelectFilterModule
  ]
})
export class Dashboard3Module { }
