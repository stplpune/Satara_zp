import { animate, state, style, transition, trigger } from '@angular/animations';
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
  selector: 'app-officer-visit-report',
  templateUrl: './officer-visit-report.component.html',
  styleUrls: ['./officer-visit-report.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class OfficerVisitReportComponent {
  officerVisitReportForm!: FormGroup;
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
  designationsArr = new Array();
  levelsArr = new Array();
  maxDate = new Date();
  pageNumber: number = 1;
  totalCount: number = 0;
  tableDataArray = new Array();

  get f() { return this.officerVisitReportForm.controls }

  columnsToDisplay = ['srNo', 'officerName', 'contactNo', 'designation', 'district', 'taluka', 'center', 'schoolCount'];
  columnsToDisplayWithExpand = [...this.columnsToDisplay, 'expand'];
  expandedElement!: PeriodicElement | null;

  displayedColumns: string[] = ['srNo', 'schoolCode', 'schoolName', 'studentCount'];
  schoolDataSource = [
    {
      position: 1,
      description: `hi.`,
    },
  ];

  dataSource = [
    {
      position: 1,
      description: `hi.`,
    },
    {
      position: 2,
      description: `hi.`,
    }
  ];

  constructor(private masterService: MasterService,
    private fb: FormBuilder,
    private webService: WebStorageService,
    public validation: ValidationService,
    private router: Router,
    private ngxSpinner: NgxSpinnerService,
    private apiService: ApiService,
    private datepipe: DatePipe,
    private commonMethodService: CommonMethodsService,
    private errors: ErrorsService,
    private excelPdfService: DownloadPdfExcelService) { }

  ngOnInit() {
    this.webService.langNameOnChange.subscribe(lang => {
      this.languageFlag = lang;
    });

    this.formField();
    this.getLevel();
    this.getState();
    this.getExamType();
    this.getAcademicYears();
    this.getTableData();
  }

  formField() {
    this.officerVisitReportForm = this.fb.group({
      designationLevelId: [this.loginData ? this.loginData?.userTypeId : 0],
      designationId: [this.loginData ? this.loginData?.subUserTypeId  : 0],
      stateId: [this.loginData ? this.loginData?.stateId : 0],
      districtId: [this.loginData ? this.loginData?.districtId : ''],
      talukaId: [this.loginData ? this.loginData?.talukaId : ''],
      centerId: [this.loginData ? this.loginData?.centerId : ''],
      villageId: [this.loginData ? this.loginData?.villageId : ''],
      schoolId: [this.loginData ? this.loginData?.schoolId : ''],
      standardId: [''],
      examTypeId: [''],
      educationYearId: [this.loginData ? this.loginData?.educationYearId : ''],
      fromDate: [''],
      toDate: [''],
      textSearch: ['']
    })
  }

  //#region ------------------------------------------- Filter dropdown dependencies start here --------------------------------------------
  getLevel() {
    this.levelsArr = [];
    this.masterService.GetDesignationLevel(this.webService.languageFlag).subscribe({
      next: (res: any) => {
        if(res.statusCode == "200"){
          this.levelsArr.push({ "id": 0, "designationLevel": "All", "m_DesignationLevel": "सर्व" }, ...res.responseData);
          this.loginData ? (this.f['designationLevelId'].setValue(this.loginData.userTypeId), this.getDesignationByLevelId()) : this.f['designationLevelId'].setValue(0);
        }else{
          this.levelsArr = [];
        }
      }
    });
  }

  getDesignationByLevelId() {
    this.designationsArr = [];
    let levelId = this.officerVisitReportForm.value.designationLevelId;
    if (levelId > 0) {
      this.masterService.GetDesignationByLevelId(this.webService.languageFlag, levelId).subscribe({
        next: (res: any) => {
          if(res.statusCode == "200"){
            this.designationsArr.push({ "id": 0, "designationType": "All", "m_DesignationType": "सर्व" }, ...res.responseData);
            this.loginData ? this.f['designationId'].setValue(this.loginData.subUserTypeId) : this.f['designationId'].setValue(0);
          }else{
            this.designationsArr = [];
          }
        },
      })
    } else {
      this.designationsArr = [];
    }
  }

  getState() {
    this.stateArr = [];
    this.masterService.getAllState('').subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.stateArr.push({ "id": 0, "state": "All", "m_State": "सर्व" }, ...res.responseData);
          this.loginData ? (this.f['stateId'].setValue(this.loginData.stateId), this.getDistrict()) : this.f['stateId'].setValue(0);
        } else {
          this.stateArr = [];
        }
      }
    });
  }

  getDistrict() {
    this.districtArr = [];
    let stateId: any = this.officerVisitReportForm.value.stateId;
    if (stateId > 0) {
      this.masterService.getAllDistrict('', stateId).subscribe({
        next: (res: any) => {
          if (res.statusCode == "200") {
            this.districtArr.push({ "id": 0, "district": "All", "m_District": "सर्व" }, ...res.responseData);
            this.loginData ? (this.f['districtId'].setValue(this.loginData.districtId), this.getTaluka()) : this.f['districtId'].setValue(0);
          } else {
            this.districtArr = [];
          }
        },
      });
    } else {
      this.districtArr = [];
    }
  }

  getTaluka() {
    this.talukaArr = [];
    let districtId: any = this.officerVisitReportForm.value.districtId;
    if (districtId > 0) {
      this.masterService.getAllTaluka('', districtId).subscribe({
        next: (res: any) => {
          if (res.statusCode == "200") {
            this.talukaArr.push({ "id": 0, "taluka": "All", "m_Taluka": "सर्व" }, ...res.responseData);
            this.loginData ? (this.f['talukaId'].setValue(this.loginData?.talukaId), this.getAllCenter()) : this.f['talukaId'].setValue(0);
          } else {
            this.talukaArr = [];
          }
        },
      });
    } else {
      this.talukaArr = [];
    }
  }

  getAllCenter() {
    this.centerArr = [];
    let talukaid = this.officerVisitReportForm.value.talukaId;
    if (talukaid > 0) {
      this.masterService.getAllCenter('', talukaid).subscribe({
        next: (res: any) => {
          if (res.statusCode == "200") {
            this.centerArr.push({ "id": 0, "center": "All", "m_Center": "सर्व" }, ...res.responseData);
            this.loginData ? (this.f['centerId'].setValue(this.loginData?.centerId), this.getVillageDrop()) : this.f['centerId'].setValue(0);
          } else {
            this.centerArr = [];
          }
        },
      });
    } else {
      this.centerArr = [];
    }
  }

  getVillageDrop() {
    this.villageArr = [];
    let centerId = this.officerVisitReportForm.value.centerId;
    if (centerId > 0) {
      this.masterService.getAllVillage('', centerId).subscribe({
        next: (res: any) => {
          if (res.statusCode == "200") {
            this.villageArr.push({ "id": 0, "village": "All", "m_Village": "सर्व" }, ...res.responseData);
            this.loginData ? (this.f['villageId'].setValue(this.loginData?.villageId), this.getAllSchoolsByCenterId()) : this.f['villageId'].setValue(0);
          } else {
            this.villageArr = [];
          }
        },
      });
    } else {
      this.villageArr = [];
    }
  }

  getAllSchoolsByCenterId() {
    this.schoolArr = [];
    let talukaId = this.officerVisitReportForm.value.talukaId;
    let centerId = this.officerVisitReportForm.value.centerId;
    let villageId = this.officerVisitReportForm.value.villageId;
    if (talukaId > 0 && villageId > 0 && centerId > 0) {
      this.masterService.getAllSchoolByCriteria('', talukaId, villageId, centerId).subscribe({
        next: (res: any) => {
          if (res.statusCode == "200") {
            this.schoolArr.push({ "id": 0, "schoolName": "All", "m_SchoolName": "सर्व" }, ...res.responseData);
            this.loginData ? (this.f['schoolId'].setValue(this.loginData?.schoolId)) : this.f['schoolId'].setValue(0);
          } else {
            this.schoolArr = [];
          }
        },
      });
    } else {
      this.schoolArr = [];
    }
  }

  getStandard() {
    this.standardArr = [];
    let schoolId = this.officerVisitReportForm.value.schoolId;
    if (schoolId > 0) {
      this.masterService.GetStandardBySchool(schoolId, '').subscribe({
        next: (res: any) => {
          if (res.statusCode == "200") {
            this.standardArr.push({ "id": 0, "standard": "All", "m_Standard": "सर्व" }, ...res.responseData);
            this.f['standardId'].setValue(0);
          } else {
            this.standardArr = [];
          }
        },
      });
    } else {
      this.standardArr = [];
    }
  }

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
          this.f['educationYearId'].setValue(0);
        }
      }
    })
  }
  //#endregion ------------------------------------------- Filter dropdown dependencies end here --------------------------------------------

  //#region ---------------------------------------------- Table start here -----------------------------------------------------------------

  getTableData(flag?: any) {
    console.log("flag", flag);
    
    this.ngxSpinner.show();
    let formValue = this.officerVisitReportForm.value;
    let fromDate = this.datepipe.transform(formValue?.fromDate || new Date(), 'yyyy-MM-dd');
    let toDate = this.datepipe.transform(formValue?.toDate || new Date(), 'yyyy-MM-dd');
    this.pageNumber = flag == 'filter' ? 1 : this.pageNumber;
    let str = `DesignationLevelId=${formValue?.designationLevelId || 0}&DesignationId=${formValue?.designationId || 0}&StateId=${formValue?.stateId || 0}&DistrictId=${formValue?.districtId || 0}&TalukaId=${formValue?.talukaId || 0}&CenterId=${formValue?.centerId || 0}&VillageId=${formValue?.villageId || 0}&FromDate=${fromDate}&ToDate=${toDate}&EducationYearId=${formValue?.educationYearId || 0}&TextSearch=${formValue?.textSearch || ''}&PageNo=${this.pageNumber}&RowCount=10&lan=` + this.languageFlag
    let reportStr = `DesignationLevelId=${formValue?.designationLevelId || 0}&DesignationId=${formValue?.designationId || 0}&StateId=${formValue?.stateId || 0}&DistrictId=${formValue?.districtId || 0}&TalukaId=${formValue?.talukaId || 0}&CenterId=${formValue?.centerId || 0}&VillageId=${formValue?.villageId || 0}&FromDate=${fromDate}&ToDate=${toDate}&EducationYearId=${formValue?.educationYearId || 0}&TextSearch=${formValue?.textSearch || ''}&PageNo=1&RowCount=${0}&lan=` + this.languageFlag

    this.apiService.setHttp('get', 'zp-satara/assessment-report/Download_OfficerVisitReport?' + (flag == 'excel' ? reportStr : str), false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        this.ngxSpinner.hide();
        if (res.statusCode == "200") {
          flag != 'excel' ? this.tableDataArray = res.responseData.responseData1 : this.tableDataArray = this.tableDataArray;
          this.totalCount = res.responseData.responseData2.totalCount;

          let data: [] = (flag == 'pdfFlag' || flag == 'excel') ? res.responseData.responseData1 : [];
          flag == 'excel' ? this.downloadExcel(data) : '';

          console.log("totalCount", this.totalCount);
          
          // flag == 'excel' ? this.downloadExcel(res.responseData.responseData1) : '';
        }else{
          this.tableDataArray = [];
          this.totalCount = 0;
        }
      },error: ((err: any) => {
        this.ngxSpinner.hide();
        this.tableDataArray = [];
        this.totalCount = 0;
        this.commonMethodService.checkEmptyData(err.statusText) == false ? this.errors.handelError(err.statusCode) : this.commonMethodService.snackBar(err.statusText, 1);
      })
    })
  }

  //#endregion ------------------------------------------- Table end here -------------------------------------------------------------------

  downloadExcel(data?: any){
    console.log("excel data: ", data);

    let obj = {
      column: ['srNo', 'officerName', 'mobileNo', 'designation', 'district', 'taluka', 'centers'],
      subColumn: ['srNo', 'schoolCode', 'schoolName', 'totalAssessedStudent'],
      header: ['Sr.No.', 'Officer Name', 'Contact No.', 'Designation', 'District', 'Taluka', 'Center'],
      subHeader: ['Sr.No.', 'School Code', 'School Name', 'Student Count'],
      pageName: 'Officer Visit Report',
      headerWidth:[7, 50, 50, 25, 20, 20, 20]
    }
    // this.excelPdfService.downloadExcelWithRowSpan(data, obj?.column, obj?.header, obj?.pageName, obj?.headerWidth, obj?.subHeader);
    this.excelPdfService.downloadExcelTable(obj?.header, obj?.column, data, obj?.subHeader, obj?.subColumn, obj?.pageName, obj?.headerWidth);
  }

  onClickSchoolList() {
    let filterValue = this.officerVisitReportForm.value;
    // localStorage.setItem('selectedOfficerObj', JSON.stringify(filterValue));
    localStorage.setItem('selectedChartObjDashboard2', JSON.stringify(filterValue));
    this.router.navigate(['/dashboard-student-data']);
  }

  onClear() {
    this.designationsArr = [];
    this.districtArr = [];
    this.talukaArr = [];
    this.centerArr = [];
    this.villageArr = [];
    this.schoolArr = [];
    this.standardArr = [];
    this.getLevel();
    this.getState();
    this.formField();
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
    }else if(label == 'school'){
      this.f['standardId'].setValue('');
    }else{
      this.f['designationId'].setValue(0);
    }
  }



}

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
  description: string;
}
