import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShareEventForAndroidRoutingModule } from './share-event-for-android-routing.module';
import { ShareEventForAndroidComponent } from './share-event-for-android.component';
import { MatCardModule } from '@angular/material/card';


@NgModule({
  declarations: [
    ShareEventForAndroidComponent
  ],
  imports: [
    CommonModule,
    ShareEventForAndroidRoutingModule,
    MatCardModule
  ]
})
export class ShareEventForAndroidModule { }
