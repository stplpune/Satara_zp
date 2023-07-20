import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DocDownloadForAndroidRoutingModule } from './doc-download-for-android-routing.module';
import { DocDownloadForAndroidComponent } from './doc-download-for-android.component';
import { BrowserModule } from '@angular/platform-browser';


@NgModule({
  declarations: [
    DocDownloadForAndroidComponent
  ],
  imports: [
    CommonModule,
    BrowserModule ,
    DocDownloadForAndroidRoutingModule
  ]
})
export class DocDownloadForAndroidModule { }
