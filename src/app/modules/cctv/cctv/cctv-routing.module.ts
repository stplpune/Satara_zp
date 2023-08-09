import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CctvComponent } from './cctv.component';

const routes: Routes = [{ path: '', component: CctvComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CctvRoutingModule { }
