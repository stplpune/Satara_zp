import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExpenseGuard } from 'src/app/core/guards/expense.guard';
import { SecureComponent } from './secure.component';

const routes: Routes = [
  { path: '', component: SecureComponent },
  { path: 'print-student-details', loadChildren: () => import('../../shared/printStudentDetails/printStudentDetails.module').then(m => m.PrintStudentDetailsModule)},
  { path: 'dashboard', loadChildren: () => import('../../modules/dashboard/dashboard.module').then(m => m.DashboardModule), canActivate: [ExpenseGuard], data: { breadcrumb: [{ title: 'Dashboard', m_title: 'डॅशबोर्ड', active: true }] } },
  { path: 'designation-registration', loadChildren: () => import('../../modules/masters/designation-master/designation-master.module').then(m => m.DesignationMasterModule), canActivate: [ExpenseGuard], data: { breadcrumb: [{ title: 'Designation Registration', m_title: 'पदनाम नोंदणी', active: true }] } },
  { path: 'other-registration', loadChildren: () => import('../../modules/masters/agency-registration/agency-registration.module').then(m => m.AgencyRegistrationModule), canActivate: [ExpenseGuard], data: { breadcrumb: [{ title: 'Other Registration', m_title: 'इतर नोंदणी ', active: true }] } },
  { path: 'school-registration', loadChildren: () => import('../../modules/masters/school-registration/school-registration.module').then(m => m.SchoolRegistrationModule), canActivate: [ExpenseGuard], data: { breadcrumb: [{ title: 'School Registration', m_title: 'शाळा नोंदणी', active: true }] } },
  { path: 'student-registration', loadChildren: () => import('../../modules/masters/student-registration/student-registration.module').then(m => m.StudentRegistrationModule), canActivate: [ExpenseGuard], data: { breadcrumb: [{ title: 'Student Registration',m_title: 'विद्यार्थी नोंदणी', active: true }] } },
  // { path: 'student-details', loadChildren: () => import('../../modules/masters/student-registration/student-details/student-details.module').then(m => m.StudentDetailsModule) },
  { path: 'teacher-registration', loadChildren: () => import('../../modules/masters/teacher-registration/teacher-registration.module').then(m => m.TeacherRegistrationModule), canActivate: [ExpenseGuard], data: { breadcrumb: [{ title: 'Teacher Registration',m_title: 'शिक्षक नोंदणी', active: true }] } },
  { path: 'office-user-registration', loadChildren: () => import('../../modules/masters/office-users/office-users.module').then(m => m.OfficeUsersModule), canActivate: [ExpenseGuard], data: { breadcrumb: [{ title: 'Office User Registration',m_title: 'ऑफिस वापरकर्ते नोंदणी', active: true }] } },
  { path: 'page-right-access', loadChildren: () => import('../../modules/settings/page-right-access/page-right-access.module').then(m => m.PageRightAccessModule), canActivate: [ExpenseGuard], data: { breadcrumb: [{ title: 'Page Right Access',m_title: 'पृष्ठ अधिकार', active: true }] } },
  { path: 'help-access', loadChildren: ()=> import('../../modules/settings/web-help/web-help.module').then(m=>m.WebHelpModule), canActivate:[ExpenseGuard], data: { breadcrumb: [{ title: 'Help', m_title: 'मदत', active: true }]}},
  { path: 'dashboard-student-details', loadChildren: () => import('../../modules/dashboard/dashboard-student-details/dashboard-student-details.module').then(m => m.DashboardStudentDetailsModule), data: { breadcrumb: [{ title: 'Dashboard Student Details',m_title: 'डॅशबोर्ड विद्यार्थी तपशील', active: true }] }  }  ,
  { path: 'student-report', loadChildren: () => import('../../modules/reports/student-report/student-report.module').then(m => m.StudentReportModule), canActivate: [ExpenseGuard], data: { breadcrumb: [{ title: 'Student Report', m_title: 'विद्यार्थी अहवाल', active: true }] } },
  { path: 'officer-report', loadChildren: () => import('../../modules/reports/student-report/student-report.module').then(m => m.StudentReportModule), canActivate: [ExpenseGuard], data: { breadcrumb: [{ title: 'Officer Report', m_title: 'अधिकारी अहवाल', active: true }] } },
  { path: 'school-report', loadChildren: () => import('../../modules/reports/school-report/school-report.module').then(m => m.SchoolReportModule), canActivate: [ExpenseGuard], data: { breadcrumb: [{ title: 'School Report', m_title: 'शाळेचा अहवाल', active: true }] } },

]
  

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
export class SecureRoutingModule { }
