import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PublicComponent } from './public.component';

const routes: Routes = [
  { path: '', component: PublicComponent },
  { path: 'home', loadChildren: () => import('../../modules/home/home.module').then(m => m.HomeModule) },
  { path: 'about-us', loadChildren: () => import('../../modules/about/about.module').then(m => m.AboutModule) },
  { path: 'contact-us', loadChildren: () => import('../../modules/contact-us/contact-us.module').then(m => m.ContactUsModule) },
  { path: 'help', loadChildren: () => import('../../modules/app-help/app-help.module').then(m => m.AppHelpModule) },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicRoutingModule { }
