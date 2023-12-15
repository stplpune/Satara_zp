import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BiometricDeviceRegistrationRoutingModule } from './biometric-device-registration-routing.module';
import { BiometricDeviceRegistrationComponent } from './biometric-device-registration.component';
import { CdkDropList, CdkDrag } from '@angular/cdk/drag-drop';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { GlobalDialogComponent } from 'src/app/shared/components/global-dialog/global-dialog.component';
import { PageStatisticsComponent } from 'src/app/shared/components/page-statistics/page-statistics.component';
import { TableComponent } from 'src/app/shared/components/table/table.component';
import { AddBiometricDeviceRegistrationComponent } from './add-biometric-device-registration/add-biometric-device-registration.component';


@NgModule({
  declarations: [
    BiometricDeviceRegistrationComponent,
    AddBiometricDeviceRegistrationComponent
  ],
  imports: [
    CommonModule,
    BiometricDeviceRegistrationRoutingModule,
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
    MatTableModule,
    TableComponent,
    MatTooltipModule,
    MatChipsModule,
    CdkDropList,
    CdkDrag,
    MatCheckboxModule
  ]
})
export class BiometricDeviceRegistrationModule { }
