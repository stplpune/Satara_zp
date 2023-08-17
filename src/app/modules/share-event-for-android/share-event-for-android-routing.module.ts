import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ShareEventForAndroidComponent } from './share-event-for-android.component';

const routes: Routes = [{ path: '', component: ShareEventForAndroidComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ShareEventForAndroidRoutingModule { }
