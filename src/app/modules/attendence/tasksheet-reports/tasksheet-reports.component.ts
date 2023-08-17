import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';
import { Router } from '@angular/router';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { MasterService } from 'src/app/core/services/master.service';
import { WebStorageService } from 'src/app/core/services/web-storage.service';
import * as _moment from 'moment';
import { default as _rollupMoment, Moment } from 'moment';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiService } from 'src/app/core/services/api.service';
import { DownloadPdfExcelService } from 'src/app/core/services/download-pdf-excel.service';
import { DatePipe } from '@angular/common';
import { AesencryptDecryptService } from 'src/app/core/services/aesencrypt-decrypt.service';
import { GlobalDialogComponent } from 'src/app/shared/components/global-dialog/global-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ValidationService } from 'src/app/core/services/validation.service';

const moment = _rollupMoment || _moment;
export const MY_FORMATS = {
  parse: {
    dateInput: 'YYYY-MM',
  },
  display: {
    dateInput: 'YYYY-MM',
    monthYearLabel: 'YYYY-MM',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'YYYY-MM',
  },
};
@Component({
  selector: 'app-tasksheet-reports',
  templateUrl: './tasksheet-reports.component.html',
  styleUrls: ['./tasksheet-reports.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class TasksheetReportsComponent {
  viewStatus = 'Table';
  filterForm !: FormGroup;
  talukaArr = new Array();
  centerArr = new Array();
  villageArr = new Array();
  schoolArr = new Array();
  tableDataArray = new Array();
  resultDownloadArr = new Array();
  totalCount: number = 0;
  tableDatasize: number = 0;
  pageNumber: number = 1;
  tableData: any;
  highLightFlag: boolean = true;
  displayedColumns = new Array();
  langTypeName: any;
  isWriteRight!: boolean;
  loginData :any;
  get f() { return this.filterForm.controls };
  displayedheadersEnglish = ['Sr. No.', 'Teacher Code','Teacher Name', 'Mobile No', 'Present Days', 'Absent Days','Total Holiday','Total Week Offs', 'Manual Att.', 'Submitted Att', 'Manual Att. Approved', 'Action'];
  displayedheadersMarathi = ['अनुक्रमांक', 'शिक्षक कोड', 'शिक्षकाचे नाव', 'मोबाईल क्र', 'उपस्थित दिवस', 'अनुपस्थित दिवस','एकूण सुट्टी','एकूण आठवडा बंद','मॅन्युअल उपस्थिती','सादर केलेली उपस्थिती','मॅन्युअल उपस्थिती मंजूर', 'कृती'];

  constructor(private router: Router,
    private apiService: ApiService,
    private fb: FormBuilder,
    private masterService: MasterService,
    private commonMethodS: CommonMethodsService,
    private errors: ErrorsService,
    public webStorageS: WebStorageService,
    private ngxSpinner: NgxSpinnerService,
    private excelpdfService: DownloadPdfExcelService,
    public datepipe: DatePipe,
    private encDec : AesencryptDecryptService,
    public dialog: MatDialog,
    public validation: ValidationService
    ) { }

  ngOnInit() {
    this.loginData = this.webStorageS.getLoggedInLocalstorageData();
    this.webStorageS.langNameOnChange.subscribe(lang => {
      this.langTypeName = lang;
      this.languageChange();
    });
    this.getTaluka();
    this.formField();
    this.getTableData();    
  }

  navigateToReport() {
    this.router.navigate(['/teacher-tasksheet']);
  }

  formField() {
    this.filterForm = this.fb.group({
      talukaId: [this.loginData?.talukaId  == '' ? 0 :  this.loginData?.talukaId ],
      centerId: [this.loginData?.centerId == '' ? 0 : this.loginData?.centerId],
      villageId: [this.loginData?.villageId == '' ? 0 : this.loginData?.villageId],
      schoolId: [this.loginData?.schoolId == '' ? 0 : this.loginData?.schoolId],
      date: [moment()],
      textSearch: ['']
    });
  }

  getTableData(flag?: string) {
    this.ngxSpinner.show();
    this.pageNumber = flag == 'filter' ? 1 : this.pageNumber;
    let formValue = this.filterForm?.value;

    let date = formValue?.date
    let yearMonth = moment(date).format('YYYY-MM');
    // MonthYear=2023&TalukaId=1&CenterId=1&VillageId=1&SchoolId=1&UserId=0&TextSearch=tt&PageNo=1&RowCount=10&lan=EN
    // let str =  `MonthYear=2023-08&TalukaId=0&CenterId=0&VillageId=0&SchoolId=0&UserId=398&lan=EN`;
    let str = `MonthYear=${yearMonth}&TalukaId=${formValue?.talukaId || 0}&CenterId=${formValue?.centerId || 0}&VillageId=${formValue?.villageId || 0}&SchoolId=${formValue?.schoolId || 0}&UserId=${this.webStorageS.getUserId()}&TextSearch=${formValue?.textSearch.trim() || ''}&PageNo=${this.pageNumber}&RowCount=10&lan=${this.webStorageS.languageFlag}`;
    let reportStr = `MonthYear=${yearMonth}&TalukaId=${formValue?.talukaId || 0}&CenterId=${formValue?.centerId || 0}&VillageId=${formValue?.villageId || 0}&SchoolId=${formValue?.schoolId || 0}&UserId=${this.webStorageS.getUserId()}&TextSearch=${formValue?.textSearch.trim() || ''}&PageNo=${this.pageNumber}&RowCount=${this.totalCount * 10}&lan=${this.webStorageS.languageFlag}`;

    this.apiService.setHttp('GET', 'zp-satara/Attendance/GetAllTeacherAttendance?' + ((flag == 'excel' || flag == 'pdfFlag') ? reportStr : str), false, false, false, 'baseUrl'); 
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.ngxSpinner.hide();
          flag != 'excel' && flag != 'pdfFlag' ? this.tableDataArray = res.responseData.responseData1 : this.tableDataArray = this.tableDataArray;
          this.tableDataArray.map((x:any)=>{
            if(x.isApproved == 0 && x.isManualAtt == 1 && x.isSubmitted == 1){
              x.isAppr = true
            }else{
              x.isAppr = false
            }
          });
          console.log("this.tableDataArray",this.tableDataArray);
          
          
          // this.totalCount = res.responseData.responseData2.pageCount;
          // this.tableDatasize = res.responseData.responseData2.pageCount;
          this.resultDownloadArr = [];

          let data: [] = (flag == 'pdfFlag' || flag == 'excel') ? res.responseData.responseData1 : [];
          flag == 'pdfFlag' ? this.pdfDownload(data,'pdfFlag') : flag == 'excel' ? this.pdfDownload(data,'excel') :'';  
        }
        else {
          this.ngxSpinner.hide();
          this.tableDataArray = [];
          this.tableDatasize = 0;
        }
        this.languageChange();
      },
      error: ((err: any) => { this.commonMethodS.checkEmptyData(err.statusText) == false ? this.errors.handelError(err.statusCode) : this.commonMethodS.showPopup(err.statusText, 1); })
    });
  }

  languageChange() {
    this.highLightFlag = true;
    let displayedColumnsReadMode = ['srNo', 'teacherCode',this.langTypeName == 'English'? 'teacherName': 'm_TeacherName', 'mobileNo', 'totalPresentDays', 'totalAbsentDays','totalHolidays','totalWeekOffs','isManualAtt', 'isSubmitted', 'isApproved','action'];
    this.displayedColumns = ['srNo', 'teacherCode', 'teacherName', 'mobileNo', 'totalPresentDays', 'totalAbsentDays','totalHolidays','totalWeekOffs', 'isManualAtt', 'isSubmitted', 'isApproved', 'action'];

    this.tableData = {
      pageNumber: this.pageNumber,
      img: '', blink: '', badge: '', isBlock: '', pagintion: true, defaultImg: "",
      date: '',
      displayedColumns: this.isWriteRight === true ? this.displayedColumns : displayedColumnsReadMode,
      tableData: this.tableDataArray,
      tableSize: this.tableDatasize,
      tableHeaders: this.langTypeName == 'English' ? this.displayedheadersEnglish : this.displayedheadersMarathi,
      edit: false, delete: false, approve :true,
      isManual: 'isManualAtt',
      isManSubmit: 'isSubmitted',
      isManualAppr: 'isApproved',
    };
    this.highLightFlag ? this.tableData.highlightedrow = true : this.tableData.highlightedrow = false,
      this.apiService.tableData.next(this.tableData);
  }

  getTaluka() {
    this.talukaArr = [];
    this.masterService.getAllTaluka('').subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.talukaArr.push({ "id": 0, "taluka": "All", "m_Taluka": "सर्व" }, ...res.responseData);          
          this.filterForm?.getRawValue().talukaId ? this.getAllCenter() : this.f['talukaId'].setValue(0);        
          
        } else {
          this.commonMethodS.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethodS.showPopup(res.statusMessage, 1);
          this.talukaArr = [];
        }
      }
    });
  }

  getAllCenter() {
    this.centerArr = [];
    let id = this.f['talukaId'].value;
    if (id != 0) {
      this.masterService.getAllCenter('', id).subscribe({
        next: (res: any) => {
          if (res.statusCode == "200") {
            this.centerArr.push({ "id": 0, "center": "All", "m_Center": "सर्व" }, ...res.responseData);    
            this.filterForm?.value.centerId ? this.getVillage() : this.f['centerId'].setValue(0);
          } else {
            this.commonMethodS.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethodS.showPopup(res.statusMessage, 1);
            this.centerArr = [];
          }
        }
      });
    }
  }

  getVillage() {
    this.villageArr = [];
    let Cid = this.f['centerId'].value;
    if (Cid != 0) {
      this.masterService.getAllVillage('', Cid).subscribe({
        next: (res: any) => {
          if (res.statusCode == 200) {
            this.villageArr.push({ "id": 0, "village": "All", "m_Village": "सर्व" }, ...res.responseData);
            this.filterForm?.value.villageId ? this.getAllSchools() : this.f['villageId'].setValue(0);
          } else {
            this.commonMethodS.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethodS.showPopup(res.statusMessage, 1);
            this.villageArr = [];
          }
        }
      });
    }
  }

  getAllSchools() {
    this.schoolArr = [];
    let Tid = this.f['talukaId'].value;
    let Cid = this.f['centerId'].value || 0;
    let Vid = 0;
    this.masterService.getAllSchoolByCriteria('', Tid, Vid, Cid).subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.schoolArr.push({ "id": 0, "schoolName": "All", "m_SchoolName": "सर्व" }, ...res.responseData);
          this.filterForm?.value.schoolId ?'': this.f['schoolId'].setValue(0)
        } else {
          this.commonMethodS.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethodS.showPopup(res.statusMessage, 1);
          this.schoolArr = [];
        }
      }
    });
  }

  childCompInfo(obj: any) {
    let teacherDetail = obj.userId + '.' + obj.teacherName + '.' + moment(this.f['date'].value).format('YYYY-MM');
    switch (obj.label) {
      case 'Pagination':
        this.pageNumber = obj.pageNumber;
        this.getTableData();
        break;
      case 'View':
        let formData = this.encDec.encrypt(`${teacherDetail}`);
        this.router.navigate(['/tasksheet'],{
          queryParams: { obj: formData },  
        });  
        break;
        case 'Approve':
          this.deleteDialog(obj?.userId);
          break;
    }
  }

  setMonthAndYear(normalizedMonthAndYear: Moment, datepicker: MatDatepicker<Moment>) {
    const ctrlValue = this.f['date'].value!;
    ctrlValue.month(normalizedMonthAndYear.month());
    ctrlValue.year(normalizedMonthAndYear.year());
    this.f['date'].setValue(ctrlValue);
    datepicker.close();
  }

  onChangeDropD(label: string) {
    switch (label) {
      case 'taluka':
        this.f['centerId'].setValue(0);
        this.f['villageId'].setValue(0);
        this.villageArr = [];
        this.schoolArr = [];
        break;
      case 'center':
        this.f['villageId'].setValue(0);
        this.schoolArr = [];
        break;
      case 'village':
        this.f['schoolId'].setValue(0);
        break;
    }
  }

  pdfDownload(data?: any,flag?:string) {   
    this.resultDownloadArr=[];  
    data.find((ele: any, i: any) => {
      let obj = {
              "Sr.No": i + 1,
              "Teacher Code": ele.teacherCode,
              "Teacher Name": ele.teacherName,
              "Mobile No": ele.mobileNo,
              "Present Days": ele.totalPresentDays,
              "Absent Days": ele.totalAbsentDays,
            }
      this.resultDownloadArr.push(obj);
    });

    if (this.resultDownloadArr?.length > 0) {
      let keyPDFHeader = ['Sr. No.', 'Teacher Code','Teacher Name', 'Mobile No', 'Present Days', 'Absent Days'];
      let ValueData =
        this.resultDownloadArr.reduce(
          (acc: any, obj: any) => [...acc, Object.values(obj).map((value) => value)], []
        );
        let objData: any = {
          'topHedingName': 'Attendance Report List',
          'createdDate': 'Created on:' + this.datepipe.transform(new Date(), 'yyyy-MM-dd, h:mm a')
        }
        let headerKeySize = [7, 30, 20, 15, 15]
        flag == 'pdfFlag' ? this.excelpdfService.downLoadPdf(keyPDFHeader, ValueData, objData) :this.excelpdfService.allGenerateExcel(keyPDFHeader, ValueData, objData, headerKeySize)
    }
  }


  
  deleteDialog(userId: any) {
   
    let dialoObj = {
      header: this.webStorageS.languageFlag == 'EN' ? 'Approve' : 'मंजूर',
      title: this.webStorageS.languageFlag == 'EN' ? 'Do You Want To Approve Record?' : 'आपण रेकॉर्ड मंजूर करू इच्छिता?',
      cancelButton: this.webStorageS.languageFlag == 'EN' ? 'Cancel' : 'रद्द करा',
      okButton: this.webStorageS.languageFlag == 'EN' ? 'Ok' : 'ओके'
    }
    const deleteDialogRef = this.dialog.open(GlobalDialogComponent, {
      width: '320px',
      data: dialoObj,
      disableClose: true,
      autoFocus: false
    })
    deleteDialogRef.afterClosed().subscribe((result: any) => {
      if (result == 'yes') {
        this.approveSubmitData(userId);
      }
    })
  }

  approveSubmitData(userId: any){
    let date =  moment(this.f['date'].value).format('YYYY-MM')
    this.apiService.setHttp('POST', `zp-satara/Attendance/ApproveAttendance?MonthYear=${date}&UserId=${userId}&lan=${this.webStorageS.languageFlag}`, false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.commonMethodS.showPopup(res.statusMessage, 0);
          this.getTableData();
          // this.dialogRef.close('yes');
        } else {
          this.commonMethodS.showPopup(res.statusMessage, 1);
        }
      },
      error: ((err: any) => { this.errors.handelError(err) })
    });
  


  }
  

}
