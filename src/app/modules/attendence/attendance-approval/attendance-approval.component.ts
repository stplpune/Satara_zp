import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AttendancePermissionComponent } from './attendance-permission/attendance-permission.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { default as _rollupMoment, Moment } from 'moment';
import * as _moment from 'moment';
import { WebStorageService } from 'src/app/core/services/web-storage.service';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { DatePipe } from '@angular/common';
import { DownloadPdfExcelService } from 'src/app/core/services/download-pdf-excel.service';
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
  selector: 'app-attendance-approval',
  templateUrl: './attendance-approval.component.html',
  styleUrls: ['./attendance-approval.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class AttendanceApprovalComponent {
  viewStatus = 'Table';
  approvalForm !: FormGroup;
  pageNumber: number = 1;
  totalCount: number = 0;
  tableDataArray = new Array();
  highLightFlag: boolean = true;
  displayedColumns = new Array();
  langTypeName: any;
  tableData: any;
  tableDatasize: number = 0;
  isWriteRight!: boolean;
  resultDownloadArr = new Array();
  typeArr = [
    {id: 0, type: 'All', m_type: 'सर्व'},
    {id: 1, type: 'Pending', m_type: 'बाकी'},
    {id: 2, type: 'Approved', m_type: 'मंजूर'},
    {id: 3, type: 'Rejected', m_type: 'नाकारले'}
  ]
  get f() { return this.approvalForm.controls }
  displayedheadersEnglish = ['Sr. No.','Teacher Code', 'Teacher Name','Date', 'Check In Time', 'Check Out Time','Approval Status', 'Remark','Action'];
  displayedheadersMarathi = ['अनुक्रमांक', 'शिक्षक कोड', 'शिक्षकाचे नाव', 'तारीख', 'चेक इन वेळ', 'चेक आऊट वेळ','मान्यता स्थिती', 'शेरा','कृती'];

  constructor(public dialog: MatDialog,
    private ngxSpinner: NgxSpinnerService,
    private fb: FormBuilder,
    private apiService: ApiService,
    public webStorageS: WebStorageService,
    private commonMethodS: CommonMethodsService,
    private errors: ErrorsService,
    private datepipe: DatePipe,
    private excelpdfService: DownloadPdfExcelService,
    public validators: ValidationService
    ) { }

  ngOnInit() { 
    this.webStorageS.langNameOnChange.subscribe(lang => {
      this.langTypeName = lang;
      this.languageChange();
    });
    this.formFeild();
    this.getTableData();
  }

  formFeild(){
    this.approvalForm = this.fb.group({
      date : [moment()],
      typeId: [0],
      textSeach : ['']
    });
  }

  getTableData(flag?: string) {
    this.ngxSpinner.show();
    this.pageNumber = flag == 'filter' ? 1 : this.pageNumber;

    let formValue = this.approvalForm?.value;
    let yearMonth = moment(formValue.date).format('YYYY-MM');
    let str = `MonthYear=${yearMonth}&UserId=${this.webStorageS.getUserId()}&Type=${formValue?.typeId || 0}&TextSearch=${formValue?.textSearch || ''}&PageNo=${this.pageNumber}&RowCount=10&lan=${this.webStorageS.languageFlag}`
    let reportStr = `MonthYear=${yearMonth}&UserId=${this.webStorageS.getUserId()}&Type=${formValue?.typeId || 0}&TextSearch=${formValue?.textSearch || ''}&PageNo=${this.pageNumber}&RowCount=${this.totalCount * 10}&lan=${this.webStorageS.languageFlag}`

    this.apiService.setHttp('post', 'zp-satara/Attendance/GetAttendanceForApproval?' + ((flag == 'excel' || flag == 'pdfFlag') ? reportStr : str), false, false, false, 'baseUrl')
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if(res.statusCode == "200"){
          this.ngxSpinner.hide();
          flag != 'excel' && flag != 'pdfFlag' ? this.tableDataArray = res.responseData.responseData1 : this.tableDataArray = this.tableDataArray;

          let data: [] = (flag == 'pdfFlag' || flag == 'excel') ? res.responseData.responseData1 : [];
          flag == 'pdfFlag' ? this.pdfDownload(data, 'pdfFlag') : flag == 'excel' ? this.pdfDownload(data, 'excel') : '';
        }
        else{
          this.ngxSpinner.hide();
          this.tableDataArray = [];
        }
        this.languageChange();
      },
      error: ((err: any) => { this.ngxSpinner.hide(), this.commonMethodS.checkEmptyData(err.statusText) == false ? this.errors.handelError(err.statusCode) : this.commonMethodS.showPopup(err.statusText, 1); })
    })
  }

  languageChange(){
    this.highLightFlag = true;
    let displayedColumnsReadMode = ['srNo', 'teacherCode',this.langTypeName == 'English'? 'teacherName': 'm_TeacherName', 'date', 'checkInTime', 'checkOutTime','approvalStatus', 'remark','action'];
    this.displayedColumns = ['srNo', 'teacherCode',this.langTypeName == 'English'? 'teacherName': 'm_TeacherName', 'date', 'checkInTime', 'checkOutTime','approvalStatus', 'remark','action'];

    this.tableData = {
      pageNumber: this.pageNumber,
      img: '', blink: '', badge: '', isBlock: '', pagintion: true, defaultImg: "",
      date: 'date',
      displayedColumns: this.isWriteRight === true ? this.displayedColumns : displayedColumnsReadMode,
      tableData: this.tableDataArray,
      tableSize: this.tableDatasize,
      tableHeaders: this.langTypeName == 'English' ? this.displayedheadersEnglish : this.displayedheadersMarathi,
      edit: false, delete: false, approve :true,
    };
    this.highLightFlag ? this.tableData.highlightedrow = true : this.tableData.highlightedrow = false,
      this.apiService.tableData.next(this.tableData);
  }

  setMonthAndYear(normalizedMonthAndYear: Moment, datepicker: MatDatepicker<Moment>) {
    const ctrlValue = this.f['date'].value!;
    ctrlValue.month(normalizedMonthAndYear.month());
    ctrlValue.year(normalizedMonthAndYear.year());
    this.f['date'].setValue(ctrlValue);
    datepicker.close();
  }

  openDialog() {
    const dialogRef = this.dialog.open(AttendancePermissionComponent, {
      width: '400px',
      disableClose: true,
      autoFocus: false
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  childCompInfo(obj: any){
    switch (obj.label) {
      case 'Pagination':
        this.pageNumber = obj.pageNumer;
        this.getTableData();
        break;

        case 'Approve':
          this.openDialog();
          break;
    }
  }

  onClear(){
    this.formFeild();
    this.getTableData();
  }

  pdfDownload(data?: any, flag?: string){
    this.resultDownloadArr = [];
    data.find((ele: any, i: any) => {
      let obj: any;
      obj = {
        "Sr.No": i + 1,
        "Teacher Code": ele.teacherCode,
        "Teacher Name": flag == 'excel' ? this.langTypeName == 'English' ? ele.teacherName : ele.m_TeacherName : ele.teacherName,
        "Date": this.datepipe.transform(ele.date, 'dd/MM/yyyy'),
        "Check In Time": ele.checkInTime,
        "Check Out Time": ele.checkOutTime,
        "Approval Status": ele.approvalStatus,
        "Remark": ele.remark,
      }
      this.resultDownloadArr.push(obj);
    });

    if(this.resultDownloadArr.length > 0){
      let keyPDFHeader = ['Sr. No.','Teacher Code', 'Teacher Name','Date', 'Check In Time', 'Check Out Time','Approval Status', 'Remark'];
      let MarathikeyPDFHeader = ['अनुक्रमांक', 'शिक्षक कोड', 'शिक्षकाचे नाव', 'तारीख', 'चेक इन वेळ', 'चेक आऊट वेळ','मान्यता स्थिती', 'शेरा'];
      let ValueData = this.resultDownloadArr.reduce(
        (acc: any, obj: any) => [...acc, Object.values(obj).map((value) => value)], []
      );  
      let objData: any;
      objData = {
        'topHedingName': flag == 'excel' ? this.langTypeName == 'English' ? 'Attendance Approval List' : 'उपस्थिती मान्यता यादी' : 'Attendance Approval List',
        'createdDate': (flag == 'excel' ? this.langTypeName == 'English' ? 'Created on:' : 'रोजी तयार केले :' : 'Created on:')+ this.datepipe.transform(new Date(), 'yyyy-MM-dd, h:mm a')
      }
      let headerKeySize = [7, 15, 20, 20, 10, 20, 15, 20]
      flag == 'pdfFlag' ? this.excelpdfService.downLoadPdf(keyPDFHeader, ValueData, objData) : this.excelpdfService.allGenerateExcel(this.langTypeName == 'English' ? keyPDFHeader : MarathikeyPDFHeader, ValueData, objData, headerKeySize);    
    }
  }

}
