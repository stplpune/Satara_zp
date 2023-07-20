import { Component } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { MasterService } from 'src/app/core/services/master.service';
import { WebStorageService } from 'src/app/core/services/web-storage.service';
import { NgxSpinnerService } from 'ngx-spinner';
// import { DatePipe } from '@angular/common';
import { DownloadPdfExcelService } from 'src/app/core/services/download-pdf-excel.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-student-report',
  templateUrl: './student-report.component.html',
  styleUrls: ['./student-report.component.scss']
})
export class StudentReportComponent {
  studentReportForm!: FormGroup;
  districtArr = new Array();
  talukaArr = new Array();
  centerArr = new Array();
  villageArr = new Array();
  schoolArr = new Array();
  standardArr = new Array();
  academicYearsArr = new Array();
  examTypeArr = new Array();
  AssessmentTypeArr = new Array();
  languageFlag: any;
  groupByClassArray = new Array();
  totalCount: number = 0;
  pageNumber: number = 1;
  tableDataArray = new Array();
  tableDatasize!: Number;
  // displayedColumnsEng = new Array();
  // displayedColumnMarathi = new Array();
  // displayedheadersEnglish = new Array();
  // displayedheadersMarathi = new Array();
  $districts?: Observable<any>;
  pageUrl: any;
  sheetNameEng: any;
  excelNameEng: any;
  sheetNameMar: any;
  excelNameMar: any;
  allStdClassWise: any; //  for std dropdown classwise 
  subjectArr: any // for subject array when its classwise 
  classGroupID = 4;
  subjectData: any;
  objeHedaer: any;
  newheaderArray = new Array();
  showTable:boolean=false;
  // displayedheadersEnglish = ['district','m_District', 'taluka', 'm_Taluka', 'center', 'm_Center','schoolCode', 'schoolName', 'm_SchoolName', 'fullName','m_FullName','districtId', 'centerId','schoolId','studentId','standardId', 'assessmentDate', 'studentGender','m_StudentGender', 'management_desc', 'm_Management_desc','q1511'];
  // displayedheadersMarathi = ['srNo','qName', 'assessmentDate', 'taluka', 'center', 'fullName','management_desc', 'schoolName', 'studentGender'];
  displayedheadersEnglish = ['Sr.No.', 'District', 'Taluka', 'Center', 'School Code', 'School Name', 'Full Name', 'Student Gender', 'Standard', 'Exam Type', 'Assessment Date', 'Management Desc'];
  displayedheadersMarathi = ['अनुक्रमांक', 'जिल्हा', 'तालुका', 'केंद्र', 'शाळेचा कोड', 'शाळेचे नाव', 'पूर्ण नाव', 'लिंग', 'इयत्ता', 'परीक्षेचा प्रकार', 'मूल्यांकन तारीख', 'व्यवस्थापन'];
  displayedColumnsEng = ['srNo', 'district', 'taluka', 'center', 'schoolCode', 'schoolName', 'fullName', 'studentGender', 'standard', 'examType', 'assessmentDate', 'management_desc', 'teacherName'];
  displayedColumnMarathi = ['srNo', 'm_District', 'm_Taluka', 'm_Center', 'schoolCode', 'm_SchoolName', 'm_FullName', 'm_StudentGender', 'm_Standard', 'm_ExamType', 'assessmentDate', 'm_Management_desc', 'teacherName'];
  tableData: any;
  campaignOne = new FormGroup({
    start: new FormControl(new Date(year, month)),
    end: new FormControl(new Date(year, month)),
  });
  campaignTwo = new FormGroup({
    start: new FormControl(new Date(year, month)),
    end: new FormControl(new Date(year, month)),
  });

  maxDate = new Date();
  studentCount : any;

  constructor(private fb: FormBuilder,
    private masterService: MasterService,
    public  webService: WebStorageService,
    private errors: ErrorsService,
    private commonMethods: CommonMethodsService,
    private apiService: ApiService,
    private ngxSpinner: NgxSpinnerService,
    private downloadFileService: DownloadPdfExcelService,
    private router: Router,
    private datepipe: DatePipe
  ) { }

  ngOnInit() {
    this.webService.langNameOnChange.subscribe(lang => {
      this.languageFlag = lang;
      this.languageChange();
    });
    this.pageUrl = this.router.url;
    this.formData();
    this.getDistrict();
    this.getExamType();
    this.geAssessmentType();
    this.getAcademicYears();
    this.getAllgroupClassDrop();
    this.getStandard();
    this.searchAssessMent();    
  }

  languageChange() {
    // this.displayedColumns = ['srNo', this.languageFlag == 'English' ? 'schoolName' : 'm_SchoolName', this.languageFlag == 'English' ? 'district' : 'm_District', this.languageFlag == 'English' ? 'taluka' : 'm_Taluka', this.languageFlag == 'English' ? 'center' : 'm_Center', this.languageFlag == 'English' ? 'village' : 'm_Village'];
    this.tableData = {
      pageNumber: this.pageNumber,
      img: '', blink: '', badge: '', isBlock: '', pagintion: true,
      displayedColumns: this.languageFlag == 'English' ? this.displayedColumnsEng : this.displayedColumnMarathi,
      tableData: this.tableDataArray,
      tableSize: this.tableDatasize,
      tableHeaders: this.languageFlag == 'English' ? this.displayedheadersEnglish : this.displayedheadersMarathi
    };
    // this.apiService.tableData.next(this.tableData);
  }

  formData() {
    this.studentReportForm = this.fb.group({
      educationYearId: [0],
      districtId: [0],
      talukaId: [0],
      centerId: [0],
      villageId: [0],
      AssessmentTypeId: [2],
      schoolId: [0],
      start: [(new Date(new Date().setDate(today.getDate() - 30)))],
      end: [new Date()],
      groupId: [1],
      standardId: [1],
      subjectId: [0],
      examTypeId: [0],
    });
  }

  getDistrict() {
    // this.districtArr = [];
    // this.masterService.getAllDistrict('').subscribe({
    //   next: (res: any) => {
    //     if (res.statusCode == 200) {
    //       this.districtArr = res.responseData;
    //       this.studentReportForm.controls['districtId'].setValue(1);
    //       this.getTaluka();
    //     } else {
    //       this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
    //       this.districtArr = [];
    //     }
    //   },
    //   error: ((err: any) => { this.errors.handelError(err.statusCode || err.status) })
    // });

    this.$districts = this.masterService.getAlllDistrict();
    this.studentReportForm.controls['districtId'].setValue(1);
    this.getTaluka();
  }


  getTaluka() {
    this.talukaArr = [];
    this.masterService.getAllTaluka('').subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.talukaArr.push({ "id": 0, "taluka": "All taluka", "m_Taluka": "सर्व तालुके" }, ...res.responseData);
          this.studentReportForm.controls['talukaId'].setValue(0);
        } else {
          this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
          this.talukaArr = [];
        }
      },
      error: ((err: any) => { this.errors.handelError(err.statusCode || err.status) })
    });
  }

  getAllCenter() {
    this.centerArr = [];
    let id = this.studentReportForm.value.talukaId;
    if (id != 0) {
      this.masterService.getAllCenter('', id).subscribe({
        next: (res: any) => {
          if (res.statusCode == 200) {
            this.centerArr.push({ "id": 0, "center": "All center", "m_Center": "सर्व केंद्र" }, ...res.responseData);
            this.studentReportForm.controls['centerId'].setValue(0);
          } else {
            this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
            this.centerArr = [];
          }
        },
        error: ((err: any) => { this.errors.handelError(err.statusCode || err.status) })
      });
    }
  }

  getVillage() {
    this.villageArr = [];
    let Tid = this.studentReportForm.value.talukaId;
    // let Cid = 0;
    if (Tid != 0) {
      this.masterService.getAllVillage('', Tid).subscribe({
        next: (res: any) => {
          if (res.statusCode == 200) {
            this.villageArr.push({ "id": 0, "village": "All village", "m_Village": "सर्व गाव" }, ...res.responseData);
            this.studentReportForm.controls['villageId'].setValue(0);
          } else {
            this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
            this.villageArr = [];
          }
        },
        error: ((err: any) => { this.errors.handelError(err.statusCode || err.status) })
      });
    }
  }

  getAllSchoolsByCenterId() {
    this.schoolArr = [];
    let Tid = this.studentReportForm.value.talukaId
    let Cid = this.studentReportForm.value.centerId || 0;
    let Vid = 0;
    this.masterService.getAllSchoolByCriteria('', Tid, Vid, Cid).subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.schoolArr.push({ "id": 0, "schoolName": "All school", "m_SchoolName": "सर्व शाळा" }, ...res.responseData);
          this.studentReportForm.controls['schoolId'].setValue(0);
        } else {
          this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
          this.schoolArr = [];
        }
      },
      error: ((err: any) => { this.errors.handelError(err.statusCode || err.status) })
    });
  }

  getAllgroupClassDrop() {
    let formData = this.studentReportForm.value;
    this.apiService.setHttp('GET', 'zp-satara/Dashboard/GetDashboardCount_V2?TalukaId=' + (formData?.talukaId || 0) + '&CenterId=' + (formData?.centerId || 0) + '&SchoolId=' + (formData?.schoolId || 0), false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {          
          this.groupByClassArray = res.responseData.responseData2;
          this.groupByClassArray.splice(0, 1);
          this.getStandard();
        } else {
          this.groupByClassArray = [];
        }
      },
      error: (err: any) => { this.errors.handelError(err.statusCode); }
    });
  }

  getStandard() {
    this.standardArr = [];
    // let schoolId = this.studentReportForm.value.schoolId
    let groupId = this.studentReportForm.value.groupId
    this.masterService.getAllStandard(0, groupId || 0, '').subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.standardArr.push({ "id": 0, "standard": "All standard", "m_Standard": "सर्व इयत्ता" }, ...res.responseData);
          this.studentReportForm.controls['standardId'].setValue(0);
          this.studentReportForm.value.AssessmentTypeId == 2 ? this.getClassWiseSubject() : '';
        } else {
          this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
          this.standardArr = [];
        }
      },
      error: ((err: any) => { this.errors.handelError(err.statusCode || err.status) })
    });
  }

  getClassWiseSubject() {
    this.subjectArr = [];
    this.masterService.getClassWiseSubject(this.languageFlag).subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          // this.subjectArr.push({ "id": 0, "subjectName": "All", "m_SubjectName": "सर्व" }, ...res.responseData.responseData2);
          this.subjectArr = (res.responseData.responseData2);
          this.studentReportForm.controls['subjectId'].setValue(this.subjectArr[0].id);
        } else {
          this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
          this.subjectArr = [];
        }
      },
      error: ((err: any) => { this.errors.handelError(err.statusCode) })
    });
  }

  getAcademicYears() {
    this.academicYearsArr = [];
    this.masterService.getAcademicYears('').subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          // this.academicYearsArr = res.responseData;
          this.academicYearsArr.push({"id": 0,
          "educationYearId": 0,
          "eductionYear": "All Year",
          "eductionYear_M": "सर्व वर्ष",
          "startDate": "2022-07-01T00:00:00",
          "endDate": "2023-03-31T00:00:00",
          "isCurrent": true,
          "isDeleted": false,
          "timestamp": "0001-01-01T00:00:00"}, ...res.responseData)
        } else {
          this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
          this.academicYearsArr = [];
        }
      },
      error: ((err: any) => { this.errors.handelError(err.statusCode || err.status) })
    });
  }

  getExamType() {
    this.examTypeArr = [];
    this.masterService.getExamType('').subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.examTypeArr = res.responseData;
          this.examTypeArr = [{ "id": 0, "examType": "All", "m_ExamType": "सर्व" }].concat(res.responseData);
          this.examTypeArr.sort((a, b) => a.id - b.id);

        } else {
          this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
          this.examTypeArr = [];
        }
      },
      error: ((err: any) => { this.errors.handelError(err.statusCode || err.status) })
    });
  }

  geAssessmentType() {
    this.AssessmentTypeArr = [];
    this.masterService.getAssementType('').subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.AssessmentTypeArr = res.responseData;
          this.GetAllStandardClassWise();
        } else {
          this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
          this.AssessmentTypeArr = [];
        }
      },
      error: ((err: any) => { this.errors.handelError(err.statusCode || err.status) })
    });
  }

  GetAllStandardClassWise() {
    this.masterService.GetAllStandardClassWise('').subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.allStdClassWise = res.responseData;
          this.studentReportForm.controls['standardId'].setValue(1);
        } else {
          this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
          this.AssessmentTypeArr = [];
        }
      },
      error: ((err: any) => { this.errors.handelError(err.statusCode || err.status) })
    });
  }

  onchangeStandardClasWise() {
    this.studentReportForm.value.standardId;
    let standRow = this.allStdClassWise.find((x: any) => (x.id == this.studentReportForm.value.standardId));
    this.classGroupID = standRow.groupId;
  }

  onchangeAssesType() {
    this.studentReportForm.value.AssessmentTypeId == 2 ? (this.GetAllStandardClassWise(), this.getClassWiseSubject()) : this.getAllgroupClassDrop();
  }

  searchAssessMent(flag?: string){
    // this.tableDataArray =[];
    this.tableData.tableData = []
    let subjectId = this.studentReportForm.value.AssessmentTypeId == 1 ? 0 : this.studentReportForm.value.subjectId
    let start = this.datepipe.transform(this.studentReportForm.value.start, 'yyyy-MM-dd');
    let end = this.datepipe.transform(this.studentReportForm.value.end, 'yyyy-MM-dd')
    let groupId = (this.studentReportForm.value.AssessmentTypeId == 1) ? this.studentReportForm.value.groupId : this.classGroupID;
    this.ngxSpinner.show();
    this.pageNumber = flag == 'filter' ? 1 : this.pageNumber;
    // let str = `?EducationYearId=${this.studentReportForm.value.educationYearId}&TalukaId=${this.studentReportForm.value.talukaId}&CenterId=${this.studentReportForm.value.centerId}&VillageId=${this.studentReportForm.value.villageId}&SchoolId=${this.studentReportForm.value.schoolId}&GroupId=${this.studentReportForm.value.groupId}&StandardId=${this.studentReportForm.value.standardId}&SubjectId=${this.studentReportForm.value.subjectId}&ExamTypeId=${this.studentReportForm.value.examTypeId}&FromDate=${'2021-01-01'}&ToDate=${'2023-10-01'}&PageNo=${1}&RowCount=${10}&lan=${this.webService.languageFlag}`;

    let reportStrStudent = `?EducationYearId=${this.studentReportForm.value.educationYearId}&TalukaId=${this.studentReportForm.value.talukaId}&CenterId=${this.studentReportForm.value.centerId}&VillageId=${this.studentReportForm.value.villageId}&SchoolId=${this.studentReportForm.value.schoolId}&GroupId=${groupId}&StandardId=${this.studentReportForm.value.standardId}&SubjectId=${subjectId}&ExamTypeId=${this.studentReportForm.value.examTypeId}&FromDate=${start}&ToDate=${end?end:this.datepipe.transform(new Date(), 'yyyy-MM-dd')}&pageno=${1}&RowCount=${0}&lan=${this.webService.languageFlag}`;
    let strStudent = `?EducationYearId=${this.studentReportForm.value.educationYearId}&TalukaId=${this.studentReportForm.value.talukaId}&CenterId=${this.studentReportForm.value.centerId}&VillageId=${this.studentReportForm.value.villageId}&SchoolId=${this.studentReportForm.value.schoolId}&GroupId=${groupId}&StandardId=${this.studentReportForm.value.standardId}&SubjectId=${subjectId}&ExamTypeId=${this.studentReportForm.value.examTypeId}&FromDate=${start}&ToDate=${end?end:this.datepipe.transform(new Date(), 'yyyy-MM-dd')}&PageNo=${this.pageNumber}&RowCount=${10}&lan=${this.webService.languageFlag}`;

    let reportStrOfficer = `?EducationYearId=${this.studentReportForm.value.educationYearId}&TalukaId=${this.studentReportForm.value.talukaId}&CenterId=${this.studentReportForm.value.centerId}&VillageId=${this.studentReportForm.value.villageId}&SchoolId=${this.studentReportForm.value.schoolId}&GroupId=${groupId}&StandardId=${this.studentReportForm.value.standardId}&SubjectId=${subjectId}&ExamTypeId=${this.studentReportForm.value.examTypeId}&FromDate=${start}&ToDate=${end?end:this.datepipe.transform(new Date(), 'yyyy-MM-dd')}&pageno=${1}&RowCount=${0}&IsInspection=${1}&Teacher_OfficeId=${0}&lan=${this.webService.languageFlag}`;
    let strOfficer = `?EducationYearId=${this.studentReportForm.value.educationYearId}&TalukaId=${this.studentReportForm.value.talukaId}&CenterId=${this.studentReportForm.value.centerId}&VillageId=${this.studentReportForm.value.villageId}&SchoolId=${this.studentReportForm.value.schoolId}&GroupId=${groupId}&StandardId=${this.studentReportForm.value.standardId}&SubjectId=${subjectId}&ExamTypeId=${this.studentReportForm.value.examTypeId}&FromDate=${start}&ToDate=${end?end:this.datepipe.transform(new Date(), 'yyyy-MM-dd')}&PageNo=${this.pageNumber}&RowCount=${10}&IsInspection=${1}&Teacher_OfficeId=${0}&lan=${this.webService.languageFlag}`;

    // let ClassWiseOfficerReportStr = `?EducationYearId=${this.studentReportForm.value.educationYearId}&TalukaId=${this.studentReportForm.value.talukaId}&CenterId=${this.studentReportForm.value.centerId}&VillageId=${this.studentReportForm.value.villageId}&SchoolId=${this.studentReportForm.value.schoolId}&GroupId=${groupId}&StandardId=${this.studentReportForm.value.standardId}&SubjectId=${this.studentReportForm.value.subjectId}&ExamTypeId=${this.studentReportForm.value.examTypeId}&FromDate=${start}&ToDate=${end}&pageno=${1}&RowCount=${0}&lan=${this.webService.languageFlag}`;
    // let classWiseStrOfficer = `?EducationYearId=${this.studentReportForm.value.educationYearId}&TalukaId=${this.studentReportForm.value.talukaId}&CenterId=${this.studentReportForm.value.centerId}&VillageId=${this.studentReportForm.value.villageId}&SchoolId=${this.studentReportForm.value.schoolId}&GroupId=${groupId}&StandardId=${this.studentReportForm.value.standardId}&SubjectId=${this.studentReportForm.value.subjectId}&ExamTypeId=${this.studentReportForm.value.examTypeId}&FromDate=${start}&ToDate=${end}&PageNo=${this.pageNumber}&RowCount=${10}&lan=${this.webService.languageFlag}`;

    // let reportStrOfficer = this.studentReportForm.value.AssessmentTypeId == 1 ? baseWiseOfficerReportPara : ClassWiseOfficerReportStr;
    // let strOfficer = this.studentReportForm.value.AssessmentTypeId == 1 ? baseWiseOfficerstrPara : classWiseStrOfficer;

    let StudentAPI = (this.studentReportForm.value.AssessmentTypeId == 1) ? 'Download_AssessmentReport' : 'Download_AssReport_ClassWise_Student'
    let OfficerAPI = (this.studentReportForm.value.AssessmentTypeId == 1) ? 'Download_AssessmentReport_Officer_V2' : 'Download_AssReport_ClassWise_Officer'

    let baseWiseStudentApiUrl = 'zp-satara/assessment-report/' + StudentAPI + (flag == 'pdfFlag' ? reportStrStudent : strStudent)
    let basewiseofficerApiUrl = 'zp-satara/assessment-report/' + OfficerAPI + (flag == 'pdfFlag' ? reportStrOfficer : strOfficer)

    this.apiService.setHttp('GET', this.pageUrl == '/officer-report' ? basewiseofficerApiUrl : baseWiseStudentApiUrl, false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.ngxSpinner.hide();
          this.showTable=true;
          // return
          flag != 'pdfFlag' ? this.tableDataArray = res.responseData.responseData2 : this.tableDataArray = this.tableDataArray;
          let officeteacherEng = this.pageUrl == '/officer-report' ? 'Officer Name ' : 'Teacher Name'
          let officeteacherMar = this.pageUrl == '/officer-report' ? 'अधिकाऱ्याचे नाव' : 'शिक्षकाचे नाव'
          this.displayedColumnsEng = ['srNo', 'district', 'taluka', 'center', 'schoolCode', 'schoolName', 'fullName','examNo', 'studentGender', 'standard', 'examType', 'assessmentDate', 'management_desc', 'teacherName'];
          // this.displayedheadersEnglish = this.displayedheadersMarathi.concat(officeteacherEng);//['Sr.No.', 'District', 'Taluka', 'Center', 'School Code', 'School Name', 'Full Name', 'Student Gender', 'Standard', 'ExamType', 'Assessment Date', 'Management Desc', officeteacherEng];
          this.displayedheadersEnglish = ['Sr.No.', 'District', 'Taluka', 'Center', 'School Code', 'School Name', 'Full Name', 'Exam No.', 'Student Gender', 'Standard', 'Exam Type', 'Assessment Date', 'Management Desc', officeteacherEng];

          this.displayedColumnMarathi = ['srNo', 'm_District', 'm_Taluka', 'm_Center', 'schoolCode', 'm_SchoolName', 'm_FullName','examNo', 'm_StudentGender', 'm_Standard', 'm_ExamType', 'assessmentDate', 'm_Management_desc', 'teacherName'];
          // this.displayedheadersMarathi =  this.displayedheadersMarathi.concat(officeteacherMar);   //['अनुक्रमांक', 'जिल्हा', 'तालुका', 'केंद्र', 'शाळेचा कोड', 'शाळेचे नाव', 'पूर्ण नाव', 'लिंग', 'इयत्ता', 'परीक्षेचा प्रकार', 'मूल्यांकन तारीख', 'व्यवस्थापन', officeteacherMar];
          this.displayedheadersMarathi =  ['अनुक्रमांक', 'जिल्हा', 'तालुका', 'केंद्र', 'शाळेचा कोड', 'शाळेचे नाव', 'पूर्ण नाव','न.चा.क्र.', 'लिंग', 'इयत्ता', 'परीक्षेचा प्रकार', 'मूल्यांकन तारीख', 'व्यवस्थापन', officeteacherMar];

          for (var i = 0; i < res?.responseData?.responseData1?.length; i++) {
            let qid = (this.studentReportForm.value.AssessmentTypeId == 1) ? (res?.responseData?.responseData1[i].qid) : (res?.responseData?.responseData1[i].qId)
            this.displayedColumnsEng.push(qid);
            this.displayedheadersEnglish.push(res?.responseData?.responseData1[i].qName);
            this.displayedColumnMarathi.push(qid);
            this.displayedheadersMarathi.push(res?.responseData?.responseData1[i].qName);
          }
          res.responseData.responseData3 != null ? this.totalCount = res.responseData.responseData3[0].totalCount : '';
          res.responseData.responseData3 != null ? this.tableDatasize = res.responseData.responseData3[0].totalCount : '';
          this.studentCount = res.responseData.responseData5[0];
          
          // let data: [] = flag == 'pdfFlag' ? res.responseData.responseData2 : [];
          flag == 'pdfFlag' ? (this.downloadExcel(res.responseData.responseData2)) : '';

          // sorting parent header name 
          
          if (this.studentReportForm.value.AssessmentTypeId == 1) {
            this.subjectData = [];
            this.newheaderArray = [];  
            this.subjectData.push(
              { subjectId: 122, subjectName: "Student Details", m_SubjectName: "विद्यार्थी तपशील", count: 14 });
            this.subjectData.push(...res.responseData.responseData4);

            for (let i = 0; i < this.subjectData.length; i++) {
              this.newheaderArray.push(this.subjectData[i].subjectName);
            }
          }
          else if(this.studentReportForm.value.AssessmentTypeId == 2){
            this.subjectData = [];
            this.newheaderArray = [];  
            this.subjectData =  [{ subjectId: 122, subjectName: "Student Details", m_SubjectName: "विद्यार्थी तपशील", count: 22 }]
            this.newheaderArray = ['Student Details']
          }
        }
        else {
          this.ngxSpinner.hide();
          this.tableDataArray = [];
          this.tableDatasize = 0;
          this.tableDatasize == 0 && flag == 'pdfFlag' ? this.commonMethods.showPopup(this.webService.languageFlag == 'EN' ? 'No Record Found' : 'रेकॉर्ड उपलब्ध नाही', 1) : '';
          if (this.studentReportForm.value.AssessmentTypeId == 1) {
            this.subjectData = [];
            this.newheaderArray = [];  
            this.subjectData.push(
              { subjectId: 122, subjectName: "Student Details", m_SubjectName: "विद्यार्थी तपशील", count: 14 });
            this.subjectData.push(...res.responseData.responseData4);

            for (let i = 0; i < this.subjectData.length; i++) {
              this.newheaderArray.push(this.subjectData[i].subjectName);
            }
          }
          else if(this.studentReportForm.value.AssessmentTypeId == 2){
            this.subjectData = [];
            this.newheaderArray = [];  
            this.subjectData =  [{ subjectId: 122, subjectName: "Student Details", m_SubjectName: "विद्यार्थी तपशील", count: 24 }]
            this.newheaderArray = ['Student Details']
          }

          // this.displayedColumnsEng = [];
          // this.displayedheadersEnglish = [];
          // this.displayedColumnMarathi = [];
          // this.displayedheadersMarathi = [];

        }
        this.languageChange();
      },
       error: ((err: any) => { this.commonMethods.checkEmptyData(err.statusText) == false ? this.errors.handelError(err.statusCode) : this.commonMethods.showPopup(err.statusText, 1); })
    });
  }

  action(obj: any) {
    this.pageNumber = obj.pageIndex + 1;
    this.searchAssessMent();
  }

  downloadExcel(data?: any) {    
    
    if (this.pageUrl == '/officer-report') {
      this.sheetNameEng = 'Officer Report'
      this.sheetNameMar = 'अधिकारी अहवाल'
    }
    else if (this.pageUrl == '/student-report') {
      this.sheetNameEng = 'Student Report'
      this.sheetNameMar = 'विद्यार्थी अहवाल'
    }

    let baseLineLabel = this.languageFlag == 'English' ? 'Base Level Assessment Report' : 'मूलभूत स्तर मूल्यांकन अहवाल'
    let classWiseLabel = this.languageFlag == 'English' ? 'Class Wise Assessment Report' : 'वर्ग निहाय मूल्यांकन अहवाल'
    let En = this.languageFlag == 'English';
    // for filter in download excel sheet 
    let village = this.villageArr.length ? this.villageArr.find((x:any)=>{if(x.id == this.studentReportForm.value.villageId){ return x} }) : { "id": 0, "village": "All village", "m_Village": "सर्व गाव" };
    let schoolList = this.schoolArr.length ? this.schoolArr.find((x:any)=>{if(x.id == this.studentReportForm.value.schoolId){return x}}) : { "id": 0, "schoolName": "All school", "m_SchoolName": "सर्व शाळा" };
    let assessmentType = this.AssessmentTypeArr.find((x:any)=>{if(x.id == this.studentReportForm.value.AssessmentTypeId){return x}})    
    // show only base assessmnet 
    let groupClass = (this.studentReportForm.value.AssessmentTypeId == 1) ? this.groupByClassArray.find((x:any)=>{if(x.groupId == this.studentReportForm.value.groupId){return x} }): ''
    let Subjects = (this.studentReportForm.value.AssessmentTypeId == 2) ? this.subjectArr.find((x:any)=>{if(x.id == this.studentReportForm.value.subjectId){return x}}): ''
    let AcademicyearList = this.academicYearsArr.find((x: any)=> {if(x.id === this.studentReportForm.value.educationYearId){return x}});
    // if classwise then show std and sub  otherwise group and std 
    let class_filter  = `${ En ? 'Standard: '+ data[0].standard+', ' : 'इयत्ता:'+ data[0].m_Standard+', ' } ${ En ? 'Subject: '+ Subjects.subjectName+', ': 'विषय: '+ Subjects.m_SubjectName+', '}`;
    let Base_filter  = `${ En ? 'Group of Class : '+ groupClass.groupClass+', ': 'वर्ग गट: ' +   groupClass.m_GroupClass+', ' } ${ En ? 'Standard: '+ data[0].standard+', ' : 'इयत्ता: '+ data[0].m_Standard+', ' }`;
    let FrmDate = this.datepipe.transform(this.studentReportForm.value.start, 'dd/MM/yyyy');
    let endDate = this.studentReportForm.value.end ? this.datepipe.transform(this.studentReportForm.value.end, 'dd/MM/yyyy'): this.datepipe.transform(new Date(), 'dd/MM/yyyy');
    let talukaEng = this.studentReportForm.value.talukaId > 0 ? data[0].taluka : 'All Taluka'
    let talukaMar = this.studentReportForm.value.talukaId > 0 ? data[0].m_Taluka : 'सर्व तालुके'
    let kendraEng = this.studentReportForm.value.centerId > 0 ? data[0].taluka : 'All Center'
    let kendraMar = this.studentReportForm.value.centerId > 0 ? data[0].m_Taluka : 'सर्व केंद्र'
    let para = `${En ? 'District: ' + data[0].district+', ' : 'जिल्हा: '+ data[0].m_District+', ' } ${En ? 'Taluka: '+ talukaEng +', ': 'तालुका: '+talukaMar+', '}  ${En ? 'Center: '+ kendraEng+', ': 'केंद्र: '+ kendraMar+', '}  ${En ? 'Village: ' + village?.village+', ' : 'गाव: '+ village?.m_Village+', ' }  ${En ? 'School Name: '+ schoolList.schoolName+', ': 'शाळेचे नाव: '+ schoolList.m_SchoolName+', '} ${En ? 'Assessment Type: '+ assessmentType.assessmentType+', ' : 'मूल्यांकन प्रकार: '+ assessmentType.m_AssessmentType+', '} ${this.studentReportForm.value.AssessmentTypeId == 1 ? Base_filter+', ' : class_filter+', '} ${En ?'Exam Type: ' +data[0].examType+', ' : 'परीक्षेचा प्रकार: '+data[0].m_ExamType+', '} ${En ?'Academic Year: ' +AcademicyearList.eductionYear+'\n'+' ' : 'शैक्षणिक वर्ष: '+AcademicyearList.eductionYear_M+'\n'}${En ? 'Date: '+FrmDate+' - ' +endDate : 'तारीख:'+ FrmDate+' - ' +endDate }`;
 // done filter in download excel sheet 
    let nameArr = [{
      'sheet_name': this.languageFlag == 'English' ? this.sheetNameEng : this.sheetNameMar,
      'excel_name': this.languageFlag == 'English' ? this.sheetNameEng : this.sheetNameMar,
      'title': this.studentReportForm.value.AssessmentTypeId == 1 ? baseLineLabel : classWiseLabel,
      'ExcelParameter': para,
      'district' : this.languageFlag == 'English' ? data[0].district : data[0].m_District,
      'taluka' : this.languageFlag == 'English' ? talukaEng : talukaMar,
      'center' : this.languageFlag == 'English' ? kendraEng : kendraMar,
      'village' : this.languageFlag == 'English' ? village?.village : village?.m_Village,
      'schoolName' : this.languageFlag == 'English' ? schoolList.schoolName : schoolList.m_SchoolName,
      'assessmentType' : this.languageFlag == 'English' ? assessmentType.assessmentType : assessmentType.m_AssessmentType,
      'examType' : this.languageFlag == 'English' ? data[0].examType : data[0].m_ExamType,
      'academicYear' : this.languageFlag == 'English' ? AcademicyearList.eductionYear : AcademicyearList.eductionYear_M,
      'date' : FrmDate+' - ' +endDate,
      'studentCount' : this.studentCount,
      'languageFlag' : this.languageFlag,
      'standard' : this.studentReportForm.value.standardId ? this.languageFlag == 'English' ? data[0].standard : data[0].m_Standard : '',
      'subject' : this.languageFlag == 'English' ? Subjects.subjectName : Subjects.m_SubjectName,
      'groupOfClass' : this.languageFlag == 'English' ? groupClass.groupClass : groupClass.m_GroupClass
    }];
    this.downloadFileService.generateExcel(this.languageFlag == 'English' ? this.displayedheadersEnglish : this.displayedheadersMarathi, this.languageFlag == 'English' ? this.displayedColumnsEng : this.displayedColumnMarathi, data, nameArr);
  }

  clearDropdown(name: any) {
    if (name == 'talukaId'){
      this.studentReportForm.controls['centerId'].setValue(0);
      this.studentReportForm.controls['schoolId'].setValue(0);
      this.studentReportForm.controls['standardId'].setValue(0);
      this.studentReportForm.controls['villageId'].setValue(0);
      this.schoolArr = [];
      // this.standardArr = [];
      this.villageArr = [];
      // this.groupByClassArray = [];
      // this.AssessmentTypeArr = [];
    } else if (name == 'centerId'){
      this.studentReportForm.controls['schoolId'].setValue(0);
      // this.studentReportForm.controls['standardId'].setValue(0);
      this.standardArr = [];
    } else if (name == 'schoolId') {
      this.studentReportForm.controls['groupId'].setValue(0);
      // this.studentReportForm.controls['standardId'].setValue(0);
    }
  }


  clearForm(){
    this.formData();
    this.studentReportForm.controls['districtId'].setValue(1);
    this.searchAssessMent();
  }



}
const today = new Date();
const month = today.getMonth();
const year = today.getFullYear();


