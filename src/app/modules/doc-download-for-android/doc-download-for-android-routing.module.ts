import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DocDownloadForAndroidComponent } from './doc-download-for-android.component';

const routes: Routes = [{ path: '', component: DocDownloadForAndroidComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DocDownloadForAndroidRoutingModule { }
