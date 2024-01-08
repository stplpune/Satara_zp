import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PrintPiDetailsRoutingModule } from './print-pi-details-routing.module';
import { PrintPiDetailsComponent } from './print-pi-details.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { NgApexchartsModule } from 'ng-apexcharts';


@NgModule({
  declarations: [
    PrintPiDetailsComponent
  ],
  imports: [
    CommonModule,
    PrintPiDetailsRoutingModule,
    MatCardModule,
    MatButtonModule,
    TranslateModule,
    NgApexchartsModule
  ]
})
export class PrintPiDetailsModule { }
