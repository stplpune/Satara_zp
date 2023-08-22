import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { CheckLoggedInGuard } from './core/guards/check-logged-in.guard';
import { PublicComponent } from './layouts/public/public.component';
import { SecureComponent } from './layouts/secure/secure.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '', canActivate: [CheckLoggedInGuard], component: PublicComponent,loadChildren: () => import('./layouts/public/public.module').then(m => m.PublicModule) },
  {
    path: '',
    canActivate: [AuthGuard],
    component: SecureComponent,
    loadChildren: () => import('./layouts/secure/secure.module').then(m => m.SecureModule) 
  },
  { path: 'login', loadChildren: () => import('./modules/login/login.module').then(m => m.LoginModule), data: { breadcrumb: [{ title: 'Login',m_title: 'Login', active: true }] } },
  { path: 'forgot-password', loadChildren: () => import('./modules/forgot-password/forgot-password.module').then(m => m.ForgotPasswordModule), data: { breadcrumb: [{ title: 'Forgot Password',m_title: 'Forgot Password', active: true }] } },
  { path: 'privacy-policy', loadChildren: () => import('./modules/privacy-policy/privacy-policy.module').then(m => m.PrivacyPolicyModule) },
  { path: 'app-help', loadChildren: () => import('./modules/app-help/app-help.module').then(m => m.AppHelpModule) },
  // { path: 'doc-download-for-android/:ed', loadChildren: () => import('./modules/doc-download-for-android/doc-download-for-android.module').then(m => m.DocDownloadForAndroidModule) },
  { path: 'doc-download-for-android/:id', loadChildren: () => import('./modules/doc-download-for-android/doc-download-for-android-routing.module').then(m => m.DocDownloadForAndroidRoutingModule) },
  { path: 'school-report', loadChildren: () => import('./modules/reports/school-report/school-report.module').then(m => m.SchoolReportModule) },
  { path: 'share/:id', loadChildren: () => import('./modules/share-event-for-android/share-event-for-android.module').then(m => m.ShareEventForAndroidModule) },
  
 
  
  
  // { path: 'web-help', loadChildren: () => import('./modules/settings/web-help/web-help.module').then(m => m.WebHelpModule) },


  { path: '**', loadChildren: () => import('./modules/error/error.module').then(m => m.ErrorModule)}

]
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
