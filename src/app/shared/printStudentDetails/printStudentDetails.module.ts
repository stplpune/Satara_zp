import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from 'src/app/core/core.module';
import { PrintStudentDetailsComponent } from './printStudentDetails.component';
import { PrintStudentDetailsRoutingModule } from './printStudentDetails-routing.module';
import { NgApexchartsModule } from 'ng-apexcharts';
import { MatCardModule } from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    PrintStudentDetailsComponent
  ],
  imports: [
    CommonModule,
    PrintStudentDetailsRoutingModule,
    CoreModule,
    NgApexchartsModule,
    MatCardModule,
    MatButtonModule,
    TranslateModule,
  ]
})
export class PrintStudentDetailsModule { }
