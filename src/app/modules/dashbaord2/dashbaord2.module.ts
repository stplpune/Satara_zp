import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Dashbaord2RoutingModule } from './dashbaord2-routing.module';
import { Dashbaord2Component } from './dashbaord2.component';
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
import { DashboardRoutingModule } from '../dashboard/dashboard-routing.module';
import { MatSelectFilterModule } from 'mat-select-filter';


@NgModule({
  declarations: [
    Dashbaord2Component
  ],
  imports: [
    CommonModule,
    Dashbaord2RoutingModule,
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
    MatSelectFilterModule
  ]
})
export class Dashbaord2Module { }
