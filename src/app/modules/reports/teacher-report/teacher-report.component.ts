import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { DownloadPdfExcelService } from 'src/app/core/services/download-pdf-excel.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { MasterService } from 'src/app/core/services/master.service';
import { ValidationService } from 'src/app/core/services/validation.service';
import { WebStorageService } from 'src/app/core/services/web-storage.service';

@Component({
  selector: 'app-teacher-report',
  templateUrl: './teacher-report.component.html',
  styleUrls: ['./teacher-report.component.scss']
})
export class TeacherReportComponent {
  teacherReportForm!: FormGroup;
  languageFlag: any;
  loginData = this.webService.getLoggedInLocalstorageData();
  stateArr = new Array();
  districtArr = new Array();
  talukaArr = new Array();
  centerArr = new Array();
  villageArr = new Array();
  schoolArr = new Array();
  standardArr = new Array();
  examTypeArr = new Array();
  academicYearArr = new Array();
  maxDate = new Date();
  pageNumber: number = 1;
  totalCount: number = 0;
  tableDataArray = new Array();
  highLightFlag: boolean = true;
  isWriteRight!: boolean;
  tableDatasize!: Number;
  displayedColumns = new Array();
  tableData: any;
  get f() { return this.teacherReportForm.controls }
  teacherheadersEnglish = ['Sr. No.', 'Standard', 'Student Count'];
  teacherheadersMarathi = ['अनुक्रमांक', 'स्टँडर्ड', 'विद्यार्थी संख्या'];
  // headMasterheadersEnglish = ['Sr. No.', 'District', 'Taluka', 'Center', 'Teacher Name', 'Student Count'];
  // headMasterheadersMarathi = ['अनुक्रमांक', 'जिल्हा', 'तालुका', 'केंद्र', 'शिक्षकाचे नाव', 'विद्यार्थी संख्या'];
  headMasterheadersEnglish = ['Sr. No.', 'Teacher Code','Teacher Name', 'Designation','Mobile No.', 'Student Count'];
  headMasterheadersMarathi = ['अनुक्रमांक', 'शिक्षक कोड','शिक्षकाचे नाव', 'पदनाम', 'मोबाईल क्र.', 'विद्यार्थी संख्या'];

  constructor(private fb: FormBuilder,
    private masterService: MasterService,
    private webService: WebStorageService,
    public validation: ValidationService,
    private commonMethodService: CommonMethodsService,
    private ngxSpinner: NgxSpinnerService,
    private datepipe: DatePipe,
    private apiService: ApiService,
    private errors: ErrorsService,
    private downloadService: DownloadPdfExcelService,
    private router: Router){}

  ngOnInit(){
    this.webService.langNameOnChange.subscribe(lang => {
      this.languageFlag = lang;
      this.languageChange();
    });
    this.formField();
    this.getState(true);
    this.getExamType();
    this.getAcademicYears();
    this.getTableData();
  }

  formField(){
    this.teacherReportForm = this.fb.group({
      stateId: [this.loginData ? this.loginData?.stateId : 0],
      districtId: [this.loginData ? this.loginData?.districtId : ''],
      talukaId: [this.loginData ? this.loginData?.talukaId : ''],
      centerId: [this.loginData ? this.loginData?.centerId : ''],
      villageId: [this.loginData ? this.loginData?.villageId : ''],
      schoolId: [this.loginData ? this.loginData?.schoolId : ''],
      standardId: [0],
      examTypeId: [0],
      educationYearId: [this.loginData ? this.loginData?.educationYearId : ''],
      fromDate: [''],
      toDate: [''],
      textSearch: ['']
    })
  }

  //#region ------------------------------------------- Filter dropdown dependencies start here --------------------------------------------
  getState(flag?: any) {
    this.stateArr = [];
    this.masterService.getAllState('').subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.stateArr.push({ "id": 0, "state": "All", "m_State": "सर्व" }, ...res.responseData);
          (this.loginData && flag == true) ? (this.f['stateId'].setValue(this.loginData.stateId), this.getDistrict(flag)) : this.f['stateId'].setValue(0);
        } else {
          this.stateArr = [];
        }
      }
    });
  }

  getDistrict(flag?: any) {
    this.districtArr = [];
    let stateId: any = this.teacherReportForm.value.stateId;
    if (stateId > 0) {
      this.masterService.getAllDistrict('', stateId).subscribe({
        next: (res: any) => {
          if (res.statusCode == "200") {
            this.districtArr.push({ "id": 0, "district": "All", "m_District": "सर्व" }, ...res.responseData);
            (this.loginData && flag == true) ? (this.f['districtId'].setValue(this.loginData.districtId), this.getTaluka(flag)) : this.f['districtId'].setValue(0);
          } else {
            this.districtArr = [];
          }
        },
      });
    } else {
      this.districtArr = [];
    }
  }

  getTaluka(flag?: any) {
    this.talukaArr = [];
    let districtId: any = this.teacherReportForm.value.districtId;
    if (districtId > 0) {
      this.masterService.getAllTaluka('', districtId).subscribe({
        next: (res: any) => {
          if (res.statusCode == "200") {
            this.talukaArr.push({ "id": 0, "taluka": "All", "m_Taluka": "सर्व" }, ...res.responseData);
            (this.loginData && flag == true) ? (this.f['talukaId'].setValue(this.loginData?.talukaId), this.getAllCenter(flag)) : this.f['talukaId'].setValue(0);
          } else {
            this.talukaArr = [];
          }
        },
      });
    } else {
      this.talukaArr = [];
    }
  }

  getAllCenter(flag?: any) {
    this.centerArr = [];
    let talukaid = this.teacherReportForm.value.talukaId;
    if (talukaid > 0) {
      this.masterService.getAllCenter('', talukaid).subscribe({
        next: (res: any) => {
          if (res.statusCode == "200") {
            this.centerArr.push({ "id": 0, "center": "All", "m_Center": "सर्व" }, ...res.responseData);
            (this.loginData && flag == true) ? (this.f['centerId'].setValue(this.loginData?.centerId), this.getVillageDrop(flag)) : this.f['centerId'].setValue(0);
          } else {
            this.centerArr = [];
          }
        },
      });
    } else {
      this.centerArr = [];
    }
  }

  getVillageDrop(flag?: any) {
    this.villageArr = [];
    let centerId = this.teacherReportForm.value.centerId;
    if (centerId > 0) {
      this.masterService.getAllVillage('', centerId).subscribe({
        next: (res: any) => {
          if (res.statusCode == "200") {
            this.villageArr.push({ "id": 0, "village": "All", "m_Village": "सर्व" }, ...res.responseData);
            (this.loginData && flag == true) ? (this.f['villageId'].setValue(this.loginData?.villageId), this.getAllSchoolsByCenterId(flag)) : this.f['villageId'].setValue(0);
          } else {
            this.villageArr = [];
          }
        },
      });
    } else {
      this.villageArr = [];
    }
  }

  getAllSchoolsByCenterId(flag?: any) {
    this.schoolArr = [];
    let talukaId = this.teacherReportForm.value.talukaId;
    let centerId = this.teacherReportForm.value.centerId;
    let villageId = this.teacherReportForm.value.villageId;
    if (talukaId > 0 && villageId > 0 && centerId > 0) {
      this.masterService.getAllSchoolByCriteria('', talukaId, villageId, centerId).subscribe({
        next: (res: any) => {
          if (res.statusCode == "200") {
            this.schoolArr.push({ "id": 0, "schoolName": "All", "m_SchoolName": "सर्व" }, ...res.responseData);
            (this.loginData && flag == true) ? (this.f['schoolId'].setValue(this.loginData?.schoolId)) : this.f['schoolId'].setValue(0);    //, this.getStandard()
          } else {
            this.schoolArr = [];
          }
        },
      });
    } else {
      this.schoolArr = [];
    }
  }

  // getStandard() {
  //   this.standardArr = [];
  //   let schoolId = this.teacherReportForm.value.schoolId;
  //   if (schoolId > 0) {
  //     this.masterService.GetStandardBySchool(schoolId, '').subscribe({
  //       next: (res: any) => {
  //         if (res.statusCode == "200") {
  //           this.standardArr.push({ "id": 0, "standard": "All", "m_Standard": "सर्व" }, ...res.responseData);
  //           this.f['standardId'].setValue(0);
  //         } else {
  //           this.standardArr = [];
  //         }
  //       },
  //     });
  //   } else {
  //     this.standardArr = [];
  //   }
  // }

  getExamType() {
    this.examTypeArr = [];
    this.masterService.getExamType('').subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.examTypeArr.push({ "id": 0, "examType": "All", "m_ExamType": "सर्व" }, ...res.responseData);
          this.f['examTypeId'].setValue(0);
        } else {
          this.examTypeArr = [];
        }
      },
    });
  }

  getAcademicYears() {
    this.academicYearArr = [];
    this.masterService.getAcademicYears('').subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.academicYearArr.push({ "id": 0, "eductionYear": "All", "eductionYear_M": "सर्व" }, ...res.responseData);
          this.loginData ? (this.f['educationYearId'].setValue(this.loginData?.educationYearId)) : this.f['educationYearId'].setValue(0); 
        }
      }
    })
  }
  //#endregion ------------------------------------------- Filter dropdown dependencies end here --------------------------------------------

  //#region ---------------------------------------------- Table start here -----------------------------------------------------------------

  getTableData(flag?: any) {
    this.ngxSpinner.show();
    let formValue = this.teacherReportForm.value;
    let fromDate = this.datepipe.transform(formValue?.fromDate || new Date(), 'yyyy-MM-dd');
    let toDate = this.datepipe.transform(formValue?.toDate || new Date(), 'yyyy-MM-dd');
    this.pageNumber = flag == 'filter' ? 1 : this.pageNumber;
    let str = `DesignationId=${this.loginData.subUserTypeId == 15 ? 15 : 0}&StateId=${formValue?.stateId || 0}&DistrictId=${formValue?.districtId || 0}&TalukaId=${formValue?.talukaId || 0}&CenterId=${formValue?.centerId || 0}&VillageId=${formValue?.villageId || 0}&SchoolId=${formValue?.schoolId || 0}&ExamTypeId=${formValue?.examTypeId || 0}&FromDate=${fromDate}&ToDate=${toDate}&EducationYearId=${formValue?.educationYearId || 0}&TextSearch=${formValue?.textSearch.trim() || ''}&TeacherId=${this.loginData.subUserTypeId == 15 ? this.loginData.refId : 0}&PageNo=${this.pageNumber}&PageSize=10&lan=` + this.languageFlag;
    let reportStr = `DesignationId=${this.loginData.subUserTypeId == 15 ? 15 : 0}&StateId=${formValue?.stateId || 0}&DistrictId=${formValue?.districtId || 0}&TalukaId=${formValue?.talukaId || 0}&CenterId=${formValue?.centerId || 0}&VillageId=${formValue?.villageId || 0}&SchoolId=${formValue?.schoolId || 0}&ExamTypeId=${formValue?.examTypeId || 0}&FromDate=${fromDate}&ToDate=${toDate}&EducationYearId=${formValue?.educationYearId || 0}&TextSearch=${formValue?.textSearch.trim() || ''}&TeacherId=${this.loginData.subUserTypeId == 15 ? this.loginData.refId : 0}&PageNo=1&PageSize=${0}&lan=` + this.languageFlag;

    this.apiService.setHttp('get', 'zp-satara/assessment-report/Download_TeacherAssessedReport?' + (flag == 'excel' ? reportStr : str), false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        this.ngxSpinner.hide();
        if (res.statusCode == "200") {
          this.teacherReportForm.value.schoolId != 0 ? flag != 'excel' ? this.tableDataArray = res.responseData.responseData1 : this.tableDataArray = this.tableDataArray : this.tableDataArray = [];
          this.totalCount = res.responseData.responseData2.totalCount;

          let data: [] = (flag == 'excel') ? res.responseData.responseData1 : [];
          flag == 'pdfFlag' ? this.downloadPdfExcel(data, 'pdfFlag') : flag == 'excel' ? this.downloadPdfExcel(data, 'excel') : '';
        }else{
          this.tableDataArray = [];
          this.totalCount = 0;
        }
        this.languageChange();
      },error: ((err: any) => {
        this.ngxSpinner.hide();
        this.tableDataArray = [];
        this.totalCount = 0;
        this.commonMethodService.checkEmptyData(err.statusText) == false ? this.errors.handelError(err.statusCode) : this.commonMethodService.snackBar(err.statusText, 1);
      })
    });
  }
  //#endregion ------------------------------------------- Table end here -------------------------------------------------------------------

  downloadPdfExcel(data?: any, flag?: any){
    let resultDownloadArr: any = [];
    data.find((ele: any, i: any) => {
      let teacherObj = {
        "Sr.No": i + 1,
        "Standard" : ele.standard,
        "Student Count": ele.totalAssessedStudent
      }

      let headMasterObj = {
        "Sr.No": i + 1,
        "Teacher Code" : ele.teacherCode,
        "Teacher Name": flag == 'excel' ? this.languageFlag == 'English' ? ele.name : ele.m_Name : ele.name,
        "Designation": flag == 'excel' ? this.languageFlag == 'English' ? ele.designation : ele.m_Designation : ele.designation,
        "Mobile No.": ele.mobileNo,
        "Student Count": ele.totalAssessedStudent
      }
      resultDownloadArr.push(this.loginData.subUserTypeId == 15 ? teacherObj : headMasterObj);
    });

    if (resultDownloadArr?.length > 0) {
      let keyPDFHeader = this.loginData.subUserTypeId == 15 ? this.teacherheadersEnglish : this.headMasterheadersEnglish;
      let MarathikeyPDFHeader = this.loginData.subUserTypeId == 15 ? this.teacherheadersMarathi : this.headMasterheadersMarathi;
      let ValueData = resultDownloadArr.reduce(
          (acc: any, obj: any) => [...acc, Object.values(obj).map((value) => value)], []
        );        
      let objData: any
      objData = {
        'topHedingName': flag == 'excel' ? this.languageFlag == 'English' ? 'Teacher Report' : 'शिक्षक अहवाल' : 'Teacher Report',
        'createdDate': (flag == 'excel' ? this.languageFlag == 'English' ? 'Created on:' : 'रोजी तयार केले :' : 'Created on:')+ this.datepipe.transform(new Date(), 'yyyy-MM-dd, h:mm a')
      }
      let headerKeySize = [10, 15, 20, 20, 20, 20, 15, 20]
      flag == 'pdfFlag' ? this.downloadService.downLoadPdf(keyPDFHeader, ValueData, objData) : this.downloadService.allGenerateExcel(this.languageFlag == 'English' ? keyPDFHeader : MarathikeyPDFHeader, ValueData, objData, headerKeySize);
    }
  }

  languageChange() {
    this.highLightFlag = true;

    let teacherKeys = ['srNo', this.languageFlag == 'English' ? 'standard' : 'm_Standard', 'totalAssessedStudent'];
    let headerMasterKeys = ['srNo', 'teacherCode', this.languageFlag == 'English' ? 'name' : 'm_Name', this.languageFlag == 'English' ? 'designation' : 'm_Designation', 'mobileNo', 'totalAssessedStudent'];

    this.displayedColumns = this.loginData.subUserTypeId == 15 ? teacherKeys : headerMasterKeys;
    let englishHeading = this.loginData.subUserTypeId == 15 ? this.teacherheadersEnglish : this.headMasterheadersEnglish;
    let marathiHeading = this.loginData.subUserTypeId == 15 ? this.teacherheadersMarathi : this.headMasterheadersMarathi;
    this.tableData = {
      pageNumber: this.pageNumber,
      img: '', blink: '', badge: '', isBlock: '', pagintion: true, defaultImg: "",
      date: '',
      displayedColumns: this.displayedColumns,
      tableData: this.tableDataArray,
      tableSize: this.tableDatasize,
      tableHeaders: this.languageFlag == 'English' ? englishHeading : marathiHeading,
      edit: true, delete: true,
    };
    this.highLightFlag ? this.tableData.highlightedrow = true : this.tableData.highlightedrow = false,
      this.apiService.tableData.next(this.tableData);
  }

  childCompInfo(obj: any) {
    switch (obj.label) {
      case 'Pagination':
        // this.pageNumber = obj.pageNumber;
        this.getTableData();
        break;
        case 'View':
          this.onClickStudentCount(obj);
          break;
    }
  }

  onClickStudentCount(data?: any){
    let filterValue = this.teacherReportForm.value;
    let fromDate = this.datepipe.transform(filterValue?.fromDate || new Date(), 'yyyy-MM-dd');
    let toDate = this.datepipe.transform(filterValue?.toDate || new Date(), 'yyyy-MM-dd');

    let obj = {
        StateId: data?.stateId,
        DistrictId: data?.districtId,
        TalukaId: data?.talukaId,
        CenterId: data?.centerId,
        VillageId: data?.villageId,
        SchoolId: filterValue?.schoolId,
        StandardId: filterValue?.standardId ? filterValue?.standardId : 0,
        ExamTypeId: filterValue?.examTypeId,
        EducationYearId: filterValue?.educationYearId,
        GraphLevelId: 0,
        graphName: 'Teacher',
        TeacherId_OfficerId: data?.id,  
        EvaluatorId: 0,
        FromDate:   fromDate,
        ToDate: toDate,   
        IsInspection: false,
    }
    console.log("obj:", obj);
    
    localStorage.setItem('selectedChartObjDashboard2', JSON.stringify(obj));
    this.router.navigate(['/dashboard-student-data']);
  }

  //#region ----------------------------------------- clear filter and onChange dropdown methods start here ---------------------------------
  onClear() {
    this.districtArr = [];
    this.talukaArr = [];
    this.centerArr = [];
    this.villageArr = [];
    this.schoolArr = [];
    this.standardArr = [];
    this.formField();
    this.getState(true);
    this.getTableData();
  }

  onClearDropDown(label: string){
    if(label == 'state'){
      this.f['districtId'].setValue('');
      this.f['talukaId'].setValue('');
      this.f['centerId'].setValue('');
      this.f['villageId'].setValue('');
      this.f['schoolId'].setValue('');
      this.f['standardId'].setValue('');
      this.talukaArr = [];
      this.centerArr = [];
      this.villageArr = [];
      this.schoolArr = [];
      this.standardArr = [];
    }else if(label == 'district'){
      this.f['talukaId'].setValue('');
      this.f['centerId'].setValue('');
      this.f['villageId'].setValue('');
      this.f['schoolId'].setValue('');
      this.f['standardId'].setValue('');
      this.centerArr = [];
      this.villageArr = [];
      this.schoolArr = [];
      this.standardArr = [];
    }else if(label == 'taluka'){
      this.f['centerId'].setValue('');
      this.f['villageId'].setValue('');
      this.f['schoolId'].setValue('');
      this.f['standardId'].setValue('');
      this.villageArr = [];
      this.schoolArr = [];
      this.standardArr = [];
    }else if(label == 'center'){
      this.f['villageId'].setValue('');
      this.f['schoolId'].setValue('');
      this.f['standardId'].setValue('');
      this.schoolArr = [];
      this.standardArr = [];
    }else if(label == 'village'){
      this.f['schoolId'].setValue('');
      this.f['standardId'].setValue('');
      this.standardArr = [];
    }else{
      this.f['standardId'].setValue('');
    }
  }
  //#endregion ----------------------------------------- clear filter and onChange dropdown methods end here -------------------------------
}
