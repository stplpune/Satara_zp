import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { DownloadPdfExcelService } from 'src/app/core/services/download-pdf-excel.service';
import { ErrorsService } from 'src/app/core/services/errors.service';

@Component({
  selector: 'app-doc-download-for-android',
  templateUrl: './doc-download-for-android.component.html',
  styleUrls: ['./doc-download-for-android.component.scss']
})
export class DocDownloadForAndroidComponent {
  data: any = new Array();
  tableDataArray: any;
  displayedColumnsEng = new Array();
  displayedheadersEnglish = new Array();
  displayedColumnMarathi = new Array();
  displayedheadersMarathi = new Array();
  totalCount: number = 0;

  constructor(private router: Router,
    private apiService: ApiService,
    private downloadFileService: DownloadPdfExcelService,
    public commonMethods: CommonMethodsService,
    private error: ErrorsService
    
    ){     
    let queryparams = this.router.url.split('/')[2];
    let params: any = queryparams.split('&');
    this.data = params    
   }

  ngOnInit(){
    this.searchAssessMent()
  }

  searchAssessMent(){
    let reportStrStudent = `?EducationYearId=${this.data[0]}&TalukaId=${this.data[1]}&CenterId=${this.data[2]}&VillageId=${this.data[3]}&SchoolId=${this.data[4]}&GroupId=${this.data[5]}&StandardId=${this.data[6]}&SubjectId=${this.data[7]}&ExamTypeId=${this.data[8]}&FromDate=${this.data[9]}&ToDate=${this.data[10]}&pageno=${1}&RowCount=${0}&lan=${this.data[13]}`;
    let reportStrOfficer = `?EducationYearId=${this.data[0]}&TalukaId=${this.data[1]}&CenterId=${this.data[2]}&VillageId=${this.data[3]}&SchoolId=${this.data[4]}&GroupId=${this.data[5]}&StandardId=${this.data[6]}&SubjectId=${this.data[7]}&ExamTypeId=${this.data[8]}&FromDate=${this.data[9]}&ToDate=${this.data[10]}&pageno=${1}&RowCount=${0}&IsInspection=${this.data[11]}&Teacher_OfficeId=${this.data[12]}&lan=${this.data[13]}`;
      
      let StudentAPI = (this.data[5] <= 3) ? 'Download_AssessmentReport' : 'Download_AssReport_ClassWise_Student' //groupId <= 3 then basewisereport
      let OfficerAPI = (this.data[5] <= 3) ? 'Download_AssessmentReport_Officer' : 'Download_AssReport_ClassWise_Officer'

      let StudentApiUrl = 'zp-satara/assessment-report/'+ StudentAPI + reportStrStudent
      let officerWiseApiUrl = 'zp-satara/assessment-report/' + OfficerAPI + reportStrOfficer 

      this.apiService.setHttp('GET', this.data[11] == 1 ? officerWiseApiUrl : StudentApiUrl , false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => {
          if (res.statusCode == "200") {
             this.tableDataArray = res.responseData.responseData2;
              let officeteacherEng = (this.data[11] == 1) ? 'Officer Name ' : 'Teacher Name'
              let officeteacherMar = (this.data[11] == 1) ? 'अधिकाऱ्याचे नाव' : 'शिक्षकाचे नाव'
              this.displayedColumnsEng = ['srNo','district', 'taluka', 'center','schoolCode', 'schoolName', 'fullName','examNo', 'studentGender','standard', 'examType', 'assessmentDate',  'management_desc', 'teacherName'];
              this.displayedheadersEnglish = ['Sr.No.','District','Taluka','Center','School Code', 'School Name','Full Name', 'Exam No', 'Student Gender','Standard', 'ExamType', 'Assessment Date',  'Management Desc', officeteacherEng];
              
              this.displayedColumnMarathi = ['srNo','m_District', 'm_Taluka', 'm_Center','schoolCode', 'm_SchoolName','m_FullName','examNo', 'm_StudentGender','m_Standard', 'm_ExamType', 'assessmentDate', 'm_Management_desc', 'teacherName'];
              this.displayedheadersMarathi =['अनुक्रमांक','जिल्हा','तालुका', 'केंद्र','शाळेचा कोड', 'शाळेचे नाव','पूर्ण नाव','न.चा.क्र.','लिंग','इयत्ता', 'परीक्षेचा प्रकार', 'मूल्यांकन तारीख', 'व्यवस्थापन', officeteacherMar];
                  for(var i = 0; i < res?.responseData?.responseData1?.length; i++){
                    let qid = (this.data?.[5] <= 3) ? (res?.responseData?.responseData1[i].qid): (res?.responseData?.responseData1[i].qId)
                    this.displayedColumnsEng.push(qid);
                    this.displayedheadersEnglish.push(res?.responseData?.responseData1[i].qName);
                    this.displayedColumnMarathi.push(qid);
                    this.displayedheadersMarathi.push(res?.responseData?.responseData1[i].qName);
                  }
                  this.totalCount = res.responseData.responseData3[0].totalCount;
              // this.tableDatasize = res.responseData.responseData3[0].totalCount;
              this.downloadExcel(res.responseData.responseData2);
          }
          else {            
            this.tableDataArray = [];
            this.totalCount = 0;            
            // this.totalCount == 0 ? this.commonMethods.showPopup(this.data[13] =='EN' ? 'No Record Found' : 'रेकॉर्ड उपलब्ध नाही', 1) : '';
            this.displayedColumnsEng =[];
            this.displayedheadersEnglish =[];
            this.displayedColumnMarathi =[];
            this.displayedheadersMarathi = [];
          }
        },
        error: (error: any) => {
          this.error.handelError(error.status);
        },
  
      });
  }

  downloadExcel(data: any){
    let sheetNameEng;
    if(this.data[11] == 1){ //officer report
      sheetNameEng = this.data[13] == 'EN' ? 'Officer Report': 'अधिकारी अहवाल'
    }else{ //teacher student report
      sheetNameEng = this.data[13] == 'EN' ? 'Student Report': 'विद्यार्थी अहवाल'
    }

    let baseLineLabel = (this.data[13] == 'EN') ? 'Base Line Assessment report': 'बेस लाइन मूल्यांकन अहवाल'
    let classWiseLabel = (this.data[13] == 'EN') ? 'Class Wise Assessment report': 'इयत्ता निहाय मूल्यांकन अहवाल'
    let nameArr = [{
      'sheet_name': sheetNameEng ,
      'excel_name': sheetNameEng,
      'title': this.data[5] <= 3 ? baseLineLabel: classWiseLabel
    }];
    this.downloadFileService.generateExcel(this.data[13] == 'EN'  ? this.displayedheadersEnglish: this.displayedheadersMarathi, this.data[13] == 'EN' ? this.displayedColumnsEng : this.displayedColumnMarathi, data, nameArr);
  }


}
