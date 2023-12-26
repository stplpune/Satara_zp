import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable } from 'rxjs';
import { AesencryptDecryptService } from 'src/app/core/services/aesencrypt-decrypt.service';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { DownloadPdfExcelService } from 'src/app/core/services/download-pdf-excel.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { MasterService } from 'src/app/core/services/master.service';
import { WebStorageService } from 'src/app/core/services/web-storage.service';

@Component({
  selector: 'app-school-report',
  templateUrl: './school-report.component.html',
  styleUrls: ['./school-report.component.scss']
})
export class SchoolReportComponent { 
  schoolReportForm!: FormGroup;
  $districts?: Observable<any>;
  stateArr = new Array();
  districtArr = new Array();
  talukaArr = new Array();
  centerArr = new Array();
  villageArr = new Array();
  schoolArr = new Array();
  standardArr = new Array();
  academicYearsArr = new Array();
  examTypeArr = new Array();
  // AssessmentTypeArr = new Array();
  allStdClassWise = new Array();
  languageFlag: any;
  pageNumber: number = 1;
  tableDataArray = new Array();
  tableDatasize!: Number;
  tableData: any;
  totalCount: number = 0;
  displayedheaders = ['Sr.No.','Taluka', 'Center', 'School Name', 'Standard', 'Assessed ClassWise Student Count', 'Total Student Count'];
  displayedheadersMarathi = ['अनुक्रमांक', 'तालुका', 'केंद्र', 'शाळेचे नाव', 'इयत्ता','मूल्यांकन वर्गनिहाय विद्यार्थी संख्या','एकूण विद्यार्थी संख्या' ];
  displayedColumns = new Array();
  highLightFlag: boolean =true;
  resultDownloadArr = new Array();
  dashBordObj:any;
  dashBordFilterFlag!:boolean;
  loginData = this.webService.getLoggedInLocalstorageData();
  maxDate = new Date();
  evaluatorDataArray = new Array();
  subjectArray = new Array();
  
  constructor(private fb: FormBuilder,
    private masterService: MasterService,
    private errors: ErrorsService,
    private commonMethods: CommonMethodsService,
    public  webService: WebStorageService,
    private apiService: ApiService,
    public datepipe: DatePipe,
    private downloadFileService: DownloadPdfExcelService,
    private activatedRoute :ActivatedRoute,
    private ngxSpinner : NgxSpinnerService,
    private encDec: AesencryptDecryptService){
    let studentObj: any;
    let decryptData:any
    this.activatedRoute.queryParams.subscribe((queryParams: any) => { studentObj = queryParams['id'] });
    decryptData = this.encDec.decrypt(`${decodeURIComponent(studentObj)}`);
    this.dashBordObj = decryptData.split('.');
    this.dashBordObj.length > 1 ?this.dashBordFilterFlag = true:this.dashBordFilterFlag = false; 
    }

  ngOnInit(){
    this.webService.langNameOnChange.subscribe(lang => {
      this.languageFlag = lang;
      this.getTableTranslatedData();
    });
    this.schoofilterData();
    this.getState();
    this.getExamType();
    this.getEvaluator();
    this.getSubject();
    // this.geAssessmentType();
    this.getAcademicYears();
    setTimeout(() => {
      this.searchAssessMent();
    }, 1000);
  }

  schoofilterData(){
    this.schoolReportForm = this.fb.group({
      educationYearId: [this.dashBordFilterFlag ? Number(this.dashBordObj[6]) : 0],
      stateId: [this.dashBordFilterFlag ? Number(this.dashBordObj[0]):0],
      districtId: [this.dashBordFilterFlag ? Number(this.dashBordObj[1]):0],
      talukaId: [this.dashBordFilterFlag ? Number(this.dashBordObj[2]):0],
      centerId: [this.dashBordFilterFlag ? Number(this.dashBordObj[3]):0],
      villageId: [this.dashBordFilterFlag ? Number(this.dashBordObj[4]):0],
      schoolId: [this.dashBordFilterFlag ? Number(this.dashBordObj[5]):0],
      fromDate: [(new Date(new Date().setDate(new Date().getDate() - 30)))],
      toDate: [new Date()],
      standardId: [0],
      examTypeId: [0],
      IsInspection: [''],
      evaluatorId: [0],
      subjectId: [0]
    });

  }
  get f(){return this.schoolReportForm.controls}

  getState(){
    this.stateArr = [];
    this.masterService.getAllState('').subscribe({
      next: (res: any) => {
        if(res.statusCode == "200"){
          this.stateArr.push({"id": 0, "state": "All", "m_State": "सर्व"}, ...res.responseData);
          this.loginData ? (this.schoolReportForm.controls['stateId'].setValue(this.loginData.stateId), this.getDistrict()) : this.schoolReportForm.controls['stateId'].setValue(0);
        }
        else{
          this.stateArr = [];
        }
      }
    });
  }

  getDistrict(){
    // this.$districts = this.masterService.getAlllDistrict();
    // this.f['districtId'].setValue(1);
    // this.getTaluka();
    let stateId: any = this.schoolReportForm.value.stateId;
    if(stateId > 0){
      this.masterService.getAllDistrict('', stateId).subscribe({
        next: (res: any) => {
          if (res.statusCode == "200") {
            this.districtArr.push({"id": 0, "district": "All", "m_District": "सर्व"}, ...res.responseData);
            this.loginData ? (this.schoolReportForm.controls['districtId'].setValue(this.loginData.districtId), this.getTaluka()) : this.schoolReportForm.controls['districtId'].setValue(0);
          }
          else {
            this.districtArr = [];
          }
        },
      });
    }
    else{
      this.districtArr = [];
    }
  }

  getTaluka(){
    this.talukaArr = [];
    let districtId: any = this.schoolReportForm.value.districtId;
    this.masterService.getAllTaluka('', districtId).subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.talukaArr.push({ "id": 0, "taluka": "All", "m_Taluka": "सर्व" }, ...res.responseData);
          this.loginData ? (this.schoolReportForm.controls['talukaId'].setValue(this.loginData?.talukaId), this.getAllCenter()): this.schoolReportForm.controls['talukaId'].setValue(0);
          // let talukaObj = this.talukaArr.filter((res:any)=>{return res.id == Number(this.dashBordObj[3]) });         
          // this.dashBordFilterFlag ? (this.f['talukaId'].setValue(talukaObj[0].id),this.getAllCenter()): this.loginData?.talukaId ? (this.f['talukaId'].setValue(this.loginData?.talukaId), this.getAllCenter()) : this.f['talukaId'].setValue(0);
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
    let talukaid = this.schoolReportForm.value.talukaId;
    if (talukaid != 0) {
      this.masterService.getAllCenter('', talukaid).subscribe({
        next: (res: any) => {
          if (res.statusCode == 200) {
            this.centerArr.push({ "id": 0, "center": "All", "m_Center": "सर्व" }, ...res.responseData);           
            // this.dashBordFilterFlag ? (this.f['centerId'].setValue(Number(this.dashBordObj[1])),this.getVillageDrop()):this.loginData?.centerId ? (this.f['centerId'].setValue(this.loginData?.centerId), this.getVillageDrop()) : this.f['centerId'].setValue(0);
            this.loginData ? (this.schoolReportForm.controls['centerId'].setValue(this.loginData?.centerId), this.getVillageDrop()): this.schoolReportForm.controls['centerId'].setValue(0);
          } else {
            this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
            this.centerArr = [];
          }
        },
        error: ((err: any) => { this.errors.handelError(err.statusCode || err.status) })
      });
    }
  }

  getVillageDrop(){
    this.villageArr = [];
    let Cid = this.schoolReportForm.value.centerId;
    // let Cid = 0;
    if (Cid != 0) {
      this.masterService.getAllVillage('', Cid).subscribe({
        next: (res: any) => {
          if (res.statusCode == 200) {
            this.villageArr.push({ "id": 0, "village": "All", "m_Village": "सर्व" }, ...res.responseData);
            // this.dashBordFilterFlag ? (this.f['villageId'].setValue(Number(this.dashBordObj[4])),this.getAllSchoolsByCenterId()):this.loginData?.villageId ? (this.f['villageId'].setValue(this.loginData?.villageId), this.getAllSchoolsByCenterId()) : this.f['villageId'].setValue(0);
            this.loginData ? (this.schoolReportForm.controls['villageId'].setValue(this.loginData?.villageId), this.getAllSchoolsByCenterId()): this.schoolReportForm.controls['villageId'].setValue(0);
          } else {
            this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
            this.villageArr = [];
          }
        },
      });
    }

  }

  getAllSchoolsByCenterId() {
    this.schoolArr = [];
    let Tid = this.schoolReportForm.value.talukaId || 0;
    let Cid = this.schoolReportForm.value.centerId || 0;
    let Vid = this.schoolReportForm.value.villageId || 0;
    if(Vid > 0){
      this.masterService.getAllSchoolByCriteria('', Tid, Vid, Cid).subscribe({
        next: (res: any) => {
          if (res.statusCode == 200) {
            this.schoolArr.push({ "id": 0, "schoolName": "All", "m_SchoolName": "सर्व" }, ...res.responseData);
            // this.schoolReportForm.controls['schoolId'].setValue(0);
            // let schoolObj = this.schoolArr.filter((res:any)=>{return res.id == Number(this.dashBordObj[2]) });
            // this.dashBordFilterFlag ? (this.f['schoolId'].setValue(Number(this.dashBordObj[2]))):this.loginData?.schoolId ? (this.f['schoolId'].setValue(this.loginData?.schoolId)) : this.f['schoolId'].setValue(0);
            this.loginData ? (this.schoolReportForm.controls['schoolId'].setValue(this.loginData?.schoolId)): this.schoolReportForm.controls['schoolId'].setValue(0);
          } else {
            this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
            this.schoolArr = [];
          }
        },
        error: ((err: any) => { this.errors.handelError(err.statusCode || err.status) })
      });
    }
  }

  getStandard() {
    this.standardArr = [];
    let schId = this.schoolReportForm.value.schoolId;
    this.masterService.GetStandardBySchool(schId, '').subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.standardArr.push({ "id": 0, "standard": "All", "m_Standard": "सर्व" }, ...res.responseData);
          this.f['standardId'].setValue(0);
        } else {
          this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
          this.standardArr = [];
        }
      },
      // error: ((err: any) => { this.errors.handelError(err.statusCode || err.status) })
    });
  }

  getEvaluator() {
    this.apiService.setHttp('get', 'zp-satara/master/GetAllEvaluator?flag_lang=' + this.languageFlag, false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == '200') {
          this.evaluatorDataArray = [{ "id": 0, "evaluator": "All", "m_Evaluator": "सर्व" },...res.responseData];
          // this.getSchoolwiseBarDetails();
         // this.getAllTeacherOfficerByEvaluatorId()
        } else {
          this.evaluatorDataArray = [];
        }
      },
      error: (() => { this.evaluatorDataArray = []; })
    });
  }

  getSubject() {
    this.masterService.getAllSubject(this.languageFlag).subscribe({
      next: (res: any) => {
        if (res.statusCode == '200') {
          this.subjectArray = [{ id: 0, subject: "All", m_Subject: "सर्व" }, ...res.responseData];
        }
      },
      error: (() => {
        this.subjectArray = [];
      })
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
          let academicYearObj = this.academicYearsArr.filter((res:any)=>{return res.id == Number(this.dashBordObj[0]) });
            this.dashBordFilterFlag ? this.f['educationYearId'].setValue(academicYearObj[0].id):this.f['educationYearId'].setValue(0); 
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

  // geAssessmentType() {
  //   this.AssessmentTypeArr = [];
  //   this.masterService.getAssementType('').subscribe({
  //     next: (res: any) => {
  //       if (res.statusCode == 200) {
  //         this.AssessmentTypeArr = res.responseData;
  //       } else {
  //         this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
  //         this.AssessmentTypeArr = [];
  //       }
  //     },
  //     error: ((err: any) => { this.errors.handelError(err.statusCode || err.status) })
  //   });
  // }

  clearDropdown(flag?: string) {
    switch (flag) {
      case 'stateId':
        this.f['districtId'].setValue(0);
        this.f['talukaId'].setValue(0);
        this.f['centerId'].setValue(0);
        this.f['villageId'].setValue(0)
        this.f['schoolId'].setValue(0);
        this.f['standardId'].setValue(0);
        this.talukaArr = [];
        this.centerArr = [];
        this.villageArr = [];
        this.schoolArr = [];
        this.standardArr = [];
        break;
        case 'districtId':
          this.f['talukaId'].setValue(0);
          this.f['centerId'].setValue(0);
          this.f['villageId'].setValue(0)
          this.f['schoolId'].setValue(0);
          this.f['standardId'].setValue(0);
          this.centerArr = [];
          this.villageArr = [];
          this.schoolArr = [];
          this.standardArr = [];
          break;
      case 'talukaId':
        this.f['centerId'].setValue(0);
        this.f['villageId'].setValue(0)
        this.f['schoolId'].setValue(0);
        this.f['standardId'].setValue(0);
        this.villageArr = [];
        this.schoolArr = [];
        this.standardArr = [];
        break;

      case 'centerId':
        this.f['villageId'].setValue(0);
        this.f['schoolId'].setValue(0);
        this.f['standardId'].setValue(0);
        this.schoolArr = [];
        this.standardArr = [];
        break;

      case 'villageId':
      this.f['schoolId'].setValue(0);
      this.f['standardId'].setValue(0);
      this.standardArr = [];
        break;

      case 'schoolId':
        this.f['standardId'].setValue(0);
        break
    }
    
  }

  searchAssessMent(flag? : any){
    this.ngxSpinner.show();
    let formData = this.schoolReportForm.value;
    let fromDate = this.datepipe.transform(formData.fromDate, 'yyyy-MM-dd')
    let toDate = this.datepipe.transform(formData.toDate, 'yyyy-MM-dd')
    let reportStr = `StateId=${formData?.stateId || 0}&DistrictId=${formData?.districtId || 0}&TalukaId=${formData?.talukaId || 0}&CenterId=${formData?.centerId || 0}&VilllageId=${formData?.villageId || 0}&SchoolId=${formData?.schoolId || 0}&StandardId=${formData?.standardId || 0}&SubjectId=${formData?.subjectId || 0}&FromDate=${fromDate}&ToDate=${toDate}&EvaluatorId=${formData?.evaluatorId || 0}&ExamTypeId=${formData?.examTypeId || 0}&EducationYearId=${formData?.educationYearId || 0}&PageNo=${1}&RowCount=0&lan=${this.languageFlag}`;
    this.pageNumber =  flag == 'filter'? 1 :this.pageNumber;
    let str = `StateId=${formData?.stateId || 0}&DistrictId=${formData?.districtId || 0}&TalukaId=${formData?.talukaId || 0}&CenterId=${formData?.centerId || 0}&VilllageId=${formData.villageId || 0}&SchoolId=${formData.schoolId || 0}&StandardId=${formData.standardId || 0}&SubjectId=${formData?.subjectId || 0}&FromDate=${fromDate}&ToDate=${toDate}&EvaluatorId=${formData?.evaluatorId || 0}&ExamTypeId=${formData?.examTypeId || 0}&EducationYearId=${formData?.educationYearId || 0}&PageNo=${this.pageNumber}&RowCount=10&lan=${this.languageFlag}`;
    this.apiService.setHttp('GET', 'zp-satara/assessment-report/Download_AssessmentReport_SchoolWise?' + (flag == 'pdfFlag' ? reportStr : str), false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.ngxSpinner.hide();
          flag != 'pdfFlag' ? this.tableDataArray = res.responseData.responseData1 : this.tableDataArray = this.tableDataArray;
          this.tableDatasize = res.responseData.responseData2[0].totalCount;
          
          this.totalCount = res.responseData.responseData2.totalCount;
          this.resultDownloadArr = [];
          let data: [] = res.responseData.responseData1;
          flag == 'pdfFlag' ? this.downloadPdf(data) : '';
        } else {
          this.ngxSpinner.hide();
          this.tableDataArray = [];
          this.tableDatasize = 0;
          this.tableDatasize == 0 && flag == 'pdfFlag' ? this.commonMethods.showPopup('No Record Found', 1) : '';
        }
        this.getTableTranslatedData();
      },
      error: ((err: any) => { this.errors.handelError(err) })
    });

  
  
  }

  getTableTranslatedData(){
    this.highLightFlag=true;
    this.displayedColumns = ['srNo', 'taluka' ,'center','schoolName','standard','assClassWiseStudentCount','totalStudentCount'];
    // this.displayedColumns = ['srNo', this.languageFlag == 'English' ? 'taluka' : 'm_Taluka', this.languageFlag == 'English' ?'center':'m_Center', this.languageFlag == 'English' ?'schoolName':'m_SchoolName',this.languageFlag == 'English' ?'standard':'m_Standard','assBaseLevelStudentCount','assClassWiseStudentCount','totalStudentCount'];
      this.tableData = {
        pageNumber: this.pageNumber,
        img: '', blink: '', badge: '', isBlock: '', pagintion: true,
        displayedColumns: this.displayedColumns, 
        tableData: this.tableDataArray,
        tableSize: this.tableDatasize,
        tableHeaders: this.languageFlag == 'English' ? this.displayedheaders : this.displayedheadersMarathi,
      };
      this.highLightFlag?this.tableData.highlightedrow=true:this.tableData.highlightedrow=false,
    this.apiService.tableData.next(this.tableData);
  }

  clearForm(){
    this.schoofilterData();
    this.getState();
    this.getEvaluator();
    this.getSubject();
    this.searchAssessMent();

  }

  childCompInfo(obj: any) {    
        this.pageNumber = obj.pageIndex + 1;
    this.searchAssessMent();

    // switch (obj.label) {
    //   case 'Pagination':
    //     this.pageNumber = obj.pageNumber;       
    //     this.searchAssessMent();
    //     break;
    

}

downloadPdf(data?: any){
  let talukaEng = this.schoolReportForm.value.talukaId > 0 ? data[0].taluka : 'All Taluka'
  let talukaMar = this.schoolReportForm.value.talukaId > 0 ? data[0].m_Taluka : 'सर्व तालुके'
  let kendraEng = this.schoolReportForm.value.centerId > 0 ? data[0].center : 'All Center'
  let kendraMar = this.schoolReportForm.value.centerId > 0 ? data[0].m_Center : 'सर्व केंद्र'

let nameArr = [{
  sheet_name: this.languageFlag == 'English'? 'Schoolwise Report' : 'शाळानिहाय अहवाल',
    'excel_name': this.languageFlag == 'English'? 'Schoolwise Report' : 'शाळानिहाय अहवाल',
    'title': this.languageFlag == 'English'? 'Schoolwise Report' : 'शाळानिहाय अहवाल',
    'taluka' : this.languageFlag == 'English' ? talukaEng : talukaMar,
    'center' : this.languageFlag == 'English' ? kendraEng : kendraMar,
    languageFlag : this.languageFlag
}]
  this.downloadFileService.generateExcelSchool((this.languageFlag == 'English' ? this.displayedheaders : this.displayedheadersMarathi), this.displayedColumns, data, nameArr);

}
}



