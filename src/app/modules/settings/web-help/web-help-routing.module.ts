import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WebHelpComponent } from './web-help.component';

const routes: Routes = [{ path: '', component: WebHelpComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WebHelpRoutingModule { }
