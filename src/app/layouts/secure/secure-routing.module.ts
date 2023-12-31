import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExpenseGuard } from 'src/app/core/guards/expense.guard';
import { SecureComponent } from './secure.component';
import { AddUpdateStudentComponent } from 'src/app/modules/masters/student-registration/add-update-student/add-update-student/add-update-student.component';
import { AddSchoolProfileComponent } from 'src/app/modules/masters/school-registration/add-school-profile/add-school-profile.component';
import { TasksheetReportDetailsComponent } from 'src/app/modules/attendence/tasksheet-reports/tasksheet-report-details/tasksheet-report-details.component';
import { ViewStockDetailsComponent } from 'src/app/modules/infrastructure/store-master/view-stock-details/view-stock-details.component';
import { LiveStreamingComponent } from 'src/app/modules/cctv/cctv/live-streaming/live-streaming.component';
import { Dashboard2DashboardDetailComponent } from 'src/app/modules/dashbaord2/dashboard2-dashboard-detail/dashboard2-dashboard-detail.component';

const routes: Routes = [
  { path: '', component: SecureComponent },
  { path: 'print-student-details', loadChildren: () => import('../../shared/printStudentDetails/printStudentDetails.module').then(m => m.PrintStudentDetailsModule)},
  { path: 'print-pi-details', loadChildren: () => import('../../shared/print-pi-details/print-pi-details.module').then(m => m.PrintPiDetailsModule) },
  { path: 'dashboard', loadChildren: () => import('../../modules/dashboard/dashboard.module').then(m => m.DashboardModule), canActivate: [ExpenseGuard], data: { breadcrumb: [{ title: 'Dashboard', m_title: 'डॅशबोर्ड', active: true }] } },
  { path: 'designation-registration', loadChildren: () => import('../../modules/masters/designation-master/designation-master.module').then(m => m.DesignationMasterModule), canActivate: [ExpenseGuard], data: { breadcrumb: [{ title: 'Designation Registration', m_title: 'पदनाम नोंदणी', active: true }] } },
  { path: 'other-registration', loadChildren: () => import('../../modules/masters/agency-registration/agency-registration.module').then(m => m.AgencyRegistrationModule), canActivate: [ExpenseGuard], data: { breadcrumb: [{ title: 'Other Registration', m_title: 'इतर नोंदणी ', active: true }] } },
  { path: 'school-registration', loadChildren: () => import('../../modules/masters/school-registration/school-registration.module').then(m => m.SchoolRegistrationModule), canActivate: [ExpenseGuard], data: { breadcrumb: [{ title: 'School Registration', m_title: 'शाळा नोंदणी', active: true }] } },
  { path: 'student-registration', loadChildren: () => import('../../modules/masters/student-registration/student-registration.module').then(m => m.StudentRegistrationModule), canActivate: [ExpenseGuard], data: { breadcrumb: [{ title: 'Student Registration',m_title: 'विद्यार्थी नोंदणी', active: true }] } },
  { path: 'add-student', component:AddUpdateStudentComponent , data: { breadcrumb: [{ title: 'Add Student',m_title: 'विद्यार्थी नोंदणी', active: true }] } },
  { path: 'view-stock-details', component: ViewStockDetailsComponent, data: { breadcrumb: [{ title: 'view-stock-detail ',m_title: 'स्टॉक-तपशील', active: true }] } },
  { path: 'view-profile-school', component:AddSchoolProfileComponent , data: { breadcrumb: [{ title: 'view-profie',m_title: 'प्रोफाइल पहा', active: true }] } },
  { path: 'teacher-tasksheet', component:TasksheetReportDetailsComponent, data:{ breadcrumb: [{ title: 'view-tasksheet-report',m_title: 'कार्यपत्रक-अहवाल पहा', active: true }] }},
  { path: 'teacher-registration', loadChildren: () => import('../../modules/masters/teacher-registration/teacher-registration.module').then(m => m.TeacherRegistrationModule), canActivate: [ExpenseGuard], data: { breadcrumb: [{ title: 'Teacher Registration',m_title: 'शिक्षक नोंदणी', active: true }] } },
  { path: 'office-user-registration', loadChildren: () => import('../../modules/masters/office-users/office-users.module').then(m => m.OfficeUsersModule), canActivate: [ExpenseGuard], data: { breadcrumb: [{ title: 'Office User Registration',m_title: 'ऑफिस वापरकर्ते नोंदणी', active: true }] } },
  { path: 'page-right-access', loadChildren: () => import('../../modules/settings/page-right-access/page-right-access.module').then(m => m.PageRightAccessModule), canActivate: [ExpenseGuard], data: { breadcrumb: [{ title: 'Page Right Access',m_title: 'पृष्ठ अधिकार', active: true }] } },
  { path: 'help-access', loadChildren: ()=> import('../../modules/settings/web-help/web-help.module').then(m=>m.WebHelpModule), canActivate:[ExpenseGuard], data: { breadcrumb: [{ title: 'Help', m_title: 'मदत', active: true }]}},
  { path: 'dashboard-student-details', loadChildren: () => import('../../modules/dashboard/dashboard-student-details/dashboard-student-details.module').then(m => m.DashboardStudentDetailsModule), data: { breadcrumb: [{ title: 'Dashboard Student Details',m_title: 'डॅशबोर्ड विद्यार्थी तपशील', active: true }] }  }  ,
  { path: 'student-report', loadChildren: () => import('../../modules/reports/student-report/student-report.module').then(m => m.StudentReportModule), canActivate: [ExpenseGuard], data: { breadcrumb: [{ title: 'Student Report', m_title: 'विद्यार्थी अहवाल', active: true }] } },
  { path: 'officer-report', loadChildren: () => import('../../modules/reports/student-report/student-report.module').then(m => m.StudentReportModule), canActivate: [ExpenseGuard], data: { breadcrumb: [{ title: 'Officer Report', m_title: 'अधिकारी अहवाल', active: true }] } },
  { path: 'school-report', loadChildren: () => import('../../modules/reports/school-report/school-report.module').then(m => m.SchoolReportModule), canActivate: [ExpenseGuard], data: { breadcrumb: [{ title: 'School Report', m_title: 'शाळेचा अहवाल', active: true }] } },
  { path: 'officer-visit-report', loadChildren: () => import('../../modules/reports/officer-visit-report/officer-visit-report.module').then(m => m.OfficerVisitReportModule), canActivate: [ExpenseGuard], data: { breadcrumb: [{ title: 'Officer Visit Report', m_title: 'अधिकारी भेट अहवाल', active: true }] } },
  { path: 'teacher-report', loadChildren: () => import('../../modules/reports/teacher-report/teacher-report.module').then(m => m.TeacherReportModule), canActivate: [ExpenseGuard], data: { breadcrumb: [{ title: 'Teacher Report', m_title: 'शिक्षक अहवाल', active: true }]} },
  { path: 'dashboard2', loadChildren: () => import('../../modules/dashbaord2/dashbaord2.module').then(m => m.Dashbaord2Module),canActivate: [ExpenseGuard], data: { breadcrumb: [{ title: 'Dashboard-2', m_title: 'डॅशबोर्ड-2', active: true }] }  },
  { path: 'dashboard-student-data', loadChildren: () => import('../../modules/dashbaord2/dashboard2-dashboard-detail/dashboard2-dashboard-detail.module').then(m => m.Dashboard2DashboardDetailModule), data: { breadcrumb: [{ title: 'Dashboard Student Data',m_title: 'डॅशबोर्ड विद्यार्थी तपशील', active: true }] }  }  ,
  { path: 'dashboard3', loadChildren: () => import('../../modules/dashboard3/dashboard3.module').then(m => m.Dashboard3Module),canActivate: [ExpenseGuard], data: { breadcrumb: [{ title: 'Dashboard-3', m_title: 'डॅशबोर्ड-3', active: true }] }   },
  //------infrastructure-routing--------//

  { path: 'category', loadChildren: () => import('../../modules/infrastructure/category/category.module').then(m => m.CategoryModule), canActivate: [ExpenseGuard], data: { breadcrumb: [{ title: 'Category', m_title: 'विभाग', active: true }] }},
  { path: 'sub-category', loadChildren: () => import('../../modules/infrastructure/sub-category/sub-category.module').then(m => m.SubCategoryModule), canActivate: [ExpenseGuard], data: { breadcrumb: [{ title: 'Sub Category', m_title: 'उप-विभाग', active: true }] } },
  { path: 'asset-type', loadChildren: () => import('../../modules/infrastructure/asset-type/asset-type.module').then(m => m.AssetTypeModule), canActivate: [ExpenseGuard], data: { breadcrumb: [{ title: 'Asset Type', m_title: 'मालमत्ता प्रकार', active: true }] } },
  { path: 'asset', loadChildren: () => import('../../modules/infrastructure/asset/asset.module').then(m => m.AssetModule), canActivate: [ExpenseGuard], data: { breadcrumb: [{ title: 'Asset', m_title: 'मालमत्ता', active: true }] } },
  { path: 'inward-item', loadChildren: () => import('../../modules/infrastructure/inward-item/inward-item.module').then(m => m.InwardItemModule), canActivate: [ExpenseGuard], data: { breadcrumb: [{ title: 'Inward Item', m_title: 'आवक वस्तू', active: true }] } },
  { path: 'store-stock-report', loadChildren: () => import('../../modules/infrastructure/store-master/store-master.module').then(m => m.StoreMasterModule), canActivate: [ExpenseGuard], data: { breadcrumb: [{ title: 'Store Master', m_title: 'स्टोअर मास्टर', active: true }] } },
  { path: 'item', loadChildren: () => import('../../modules/infrastructure/item-registration/item-registration.module').then(m => m.ItemRegistrationModule), canActivate: [ExpenseGuard], data: { breadcrumb: [{ title: 'Item Registration', m_title: 'वस्तू नोंदणी', active: true }] } },
  { path: 'outward-item', loadChildren: () => import('../../modules/infrastructure/outward-item/outward-item.module').then(m => m.OutwardItemModule), canActivate: [ExpenseGuard], data: { breadcrumb: [{ title: 'Outward Item', m_title: 'जावक वस्तू', active: true }] } },

   //------attendence-routing--------//

  { path: 'tasksheet', loadChildren: () => import('../../modules/attendence/tasksheet/tasksheet.module').then(m => m.TasksheetModule), canActivate: [ExpenseGuard], data: { breadcrumb: [{ title: 'Tasksheet', m_title: 'टास्कशीट', active: true }] }  },
  { path: 'attendance-approval', loadChildren: () => import('../../modules/attendence/attendance-approval/attendance-approval.module').then(m => m.AttendanceApprovalModule) },
  { path: 'attendance-report', loadChildren: () => import('../../modules/attendence/tasksheet-reports/tasksheet-reports.module').then(m => m.TasksheetReportsModule), canActivate: [ExpenseGuard], data: { breadcrumb: [{ title: 'Tasksheet Report', m_title: 'टास्कशीट अहवाल', active: true }] } },
  { path: 'holiday-master', loadChildren: () => import('../../modules/attendence/hoilday-master/hoilday-master.module').then(m => m.HoildayMasterModule), canActivate: [ExpenseGuard], data: { breadcrumb: [{ title: 'Hoilday Master', m_title: 'हॉलिडे मास्टर', active: true }] }  },
  { path: 'cctv-location-registration', loadChildren: () => import('../../modules/cctv/cctv-location-registration/cctv-location-registration.module').then(m => m.CctvLocationRegistrationModule) ,canActivate: [ExpenseGuard], data: { breadcrumb: [{ title: 'CCTV Location Registration', m_title: 'CCTV स्थान नोंदणी', active: true }]}},
  { path: 'cctv', loadChildren: () => import('../../modules/cctv/cctv/cctv.module').then(m => m.CctvModule),canActivate: [ExpenseGuard], data: { breadcrumb: [{ title: 'CCTV', m_title: 'CCTV स्थान', active: true }] }   },
  { path: 'biometric-device-registration', loadChildren: () => import('../../modules/attendence/biometric-device-registration/biometric-device-registration.module').then(m => m.BiometricDeviceRegistrationModule),canActivate: [ExpenseGuard], data: { breadcrumb: [{ title: 'Biometric Device Registration', m_title: 'बायोमेट्रिक उपकरण नोंदणी', active: true }]}  },
  
  //------setting-routing--------//

  { path: 'assessment-subject', loadChildren: () => import('../../modules/settings/add-subject/add-subject.module').then(m => m.AddSubjectModule),canActivate: [ExpenseGuard], data: { breadcrumb: [{ title: 'Assessment Subject', m_title: 'मूल्यांकन विषय', active: true }] }    },
  { path: 'exam-master', loadChildren: () => import('../../modules/settings/add-test/add-test.module').then(m => m.AddTestModule), canActivate: [ExpenseGuard], data: { breadcrumb: [{ title: 'Exam Master', m_title: 'परीक्षा मास्टर', active: true }] }    },
  { path: 'assessment-configuration', loadChildren: () => import('../../modules/settings/assessment-configuration/assessment-configuration.module').then(m => m.AssessmentConfigurationModule),canActivate: [ExpenseGuard], data: { breadcrumb: [{ title: 'Assessment Configuration', m_title: 'मूल्यांकन निकष', active: true }]}},
  { path: 'criteria-wise-question', loadChildren: () => import('../../modules/settings/criteria-wise-question/criteria-wise-question.module').then(m => m.CriteriaWiseQuestionModule),canActivate: [ExpenseGuard], data: { breadcrumb: [{ title: 'Criteria Wise Question', m_title: 'निकषा नुसार प्रश्न', active: true }]} },
  { path: 'cctv-streaming', component:LiveStreamingComponent , data: { breadcrumb: [{ title: 'cctv',m_title: 'cctv-प्रवाह', active: true }] } },
  { path: 'student-report-card', component:Dashboard2DashboardDetailComponent , data: { breadcrumb: [{ title: 'student-report-card',m_title: 'विद्यार्थी-रिपोर्ट कार्ड', active: true }] } },
]
  

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
export class SecureRoutingModule { }
