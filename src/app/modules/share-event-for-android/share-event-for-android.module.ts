import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ShareEventForAndroidRoutingModule } from './share-event-for-android-routing.module';
import { ShareEventForAndroidComponent } from './share-event-for-android.component';


@NgModule({
  declarations: [
    ShareEventForAndroidComponent
  ],
  imports: [
    CommonModule,
    ShareEventForAndroidRoutingModule
  ]
})
export class ShareEventForAndroidModule { }
