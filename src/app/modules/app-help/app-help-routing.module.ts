import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppHelpComponent } from './app-help.component';

const routes: Routes = [{ path: '', component: AppHelpComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppHelpRoutingModule { }
