import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShareEventForAndroidRoutingModule } from './share-event-for-android-routing.module';
import { ShareEventForAndroidComponent } from './share-event-for-android.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';


@NgModule({
  declarations: [
    ShareEventForAndroidComponent
  ],
  imports: [
    CommonModule,
    ShareEventForAndroidRoutingModule,
    MatCardModule,
    MatIconModule
  ]
})
export class ShareEventForAndroidModule { }
