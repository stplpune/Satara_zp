import { Component } from '@angular/core';
import { AddTasksheetComponent } from './add-tasksheet/add-tasksheet.component';
import { MatDialog } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { ApiService } from 'src/app/core/services/api.service';
import { WebStorageService } from 'src/app/core/services/web-storage.service';
import { DatePipe } from '@angular/common';
import { MatDatepicker } from '@angular/material/datepicker';
import * as _moment from 'moment';
import { default as _rollupMoment, Moment } from 'moment';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { NgxSpinnerService } from 'ngx-spinner';
import { DownloadPdfExcelService } from 'src/app/core/services/download-pdf-excel.service';
import { ActivatedRoute } from '@angular/router';
import { AesencryptDecryptService } from 'src/app/core/services/aesencrypt-decrypt.service';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';

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
  selector: 'app-tasksheet',
  templateUrl: './tasksheet.component.html',
  styleUrls: ['./tasksheet.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class TasksheetComponent {
  date = new FormControl(moment());
  tableresp: any;
  totalItem: any;
  langTypeName: any;
  today = new Date();
  startDate = new Date(1990, 0);
  resultDownloadArr = new Array();
  submitFlag : boolean = false;
  displayedheadersEnglish = ['Sr. No.', ' Day', 'Check In Time', 'Check Out Time', 'Attendence', 'Remark', 'Action'];
  displayedheadersMarathi = ['अनुक्रमांक', 'दिवस', 'चेक इन वेळ', 'वेळ तपासा', 'उपस्थिती', 'शेरा', 'कृती'];
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol', 'Attendence', 'Remark', 'Action'];
  dataSource: any;
  viewStatus = 'Table';
  attendanceSheetRes : any;

  constructor(public dialog: MatDialog,
    private errors: ErrorsService,
    private apiService: ApiService,
    private webStorage: WebStorageService,
    private ngxSpinner : NgxSpinnerService,
    private excelpdfService : DownloadPdfExcelService,
    public datepipe: DatePipe,
    private route : ActivatedRoute,
    private encDec: AesencryptDecryptService,   
    private commonMethod: CommonMethodsService,
    public webStorageS: WebStorageService,
  ) { 
    let teacherObj: any;    
     this.route.queryParams.subscribe((queryParams: any) => { teacherObj = queryParams['obj'] });
    let data = this.encDec.decrypt(`${decodeURIComponent(teacherObj)}`);
    this.attendanceSheetRes = data.split('.');
  }

  ngOnInit() {
    this.getTableData();
    this.webStorage.langNameOnChange.subscribe(lang => {
      this.langTypeName = lang;
      // this.getTableTranslatedData();
    });
  }

  openDialog(data : any) {
    const dialogRef = this['dialog'].open(AddTasksheetComponent, {
      width: '500px',
      data: data
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result == 'yes') {
        this.getTableData();
        // this.pageNumber = this.pageNumber;
      } else if (result == 'yes') {
        this.getTableData();
        // this.pageNumber = 1;
      }
    });
  }

  getTableData(flag?: any) {
    this.ngxSpinner.show();
    let date = this.attendanceSheetRes ? this.attendanceSheetRes[2] : this.date.value;
    let yearMonth = moment(date).format('YYYY-MM');

    this.apiService.setHttp('GET', 'zp-satara/Attendance/GetAttendanceTasksheet?MonthYear=' + yearMonth + '&UserId=' + (this.attendanceSheetRes[0] || this.webStorage.getUserId()), false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.ngxSpinner.hide();
          this.tableresp = res.responseData.responseData1;
          flag != 'excel' ? this.tableresp = res.responseData.responseData1 : this.tableresp = this.tableresp;

          let data: [] = (flag == 'pdfFlag' || flag == 'excel') ? res.responseData.responseData1 : [];
          flag == 'pdfFlag' ? this.pdfDownload(data,'pdfFlag') : flag == 'excel' ? this.pdfDownload(data,'excel') :'';  
        } else {
          this.ngxSpinner.hide();
          this.tableresp = [];
          this.totalItem = 0
        }
        // this.getTableTranslatedData();
      },
      error: ((err: any) => { this.errors.handelError(err) })
    });
  }

  setMonthAndYear(normalizedMonthAndYear: Moment, datepicker: MatDatepicker<Moment>) {
    const ctrlValue = this.date.value!;
    ctrlValue.month(normalizedMonthAndYear.month());
    ctrlValue.year(normalizedMonthAndYear.year());
    this.date.setValue(ctrlValue);
    datepicker.close();
  }

  onClear() {
    this.date.setValue(moment());
    this.getTableData()
  }

  pdfDownload(data?: any,flag?:string) {   
    this.resultDownloadArr=[];  
    data.find((ele: any, i: any) => {
      let obj = {
              "Sr.No": i + 1,
              "Day": ele.day,
              "Check In Time": ele.checkInTime,
              "Check Out Time": ele.checkOutTime,
              "Attendence": ele.attendance,
              "Remark": ele.remark,
            }
      this.resultDownloadArr.push(obj);
    });

    if (this.resultDownloadArr?.length > 0) {
      let keyPDFHeader = ['Sr.No.', 'Day', 'Check In Time', 'Check Out Time', 'Attendence', 'Remark'];
      let ValueData =
        this.resultDownloadArr.reduce(
          (acc: any, obj: any) => [...acc, Object.values(obj).map((value) => value)], []
        );
        let objData: any = {
          'topHedingName': 'Tasksheet List',
          'createdDate': 'Created on:' + this.datepipe.transform(new Date(), 'yyyy-MM-dd, h:mm a')
        }
        let headerKeySize = [7, 15, 15, 15, 15, 40]
        flag == 'pdfFlag' ? this.excelpdfService.downLoadPdf(keyPDFHeader, ValueData, objData) :this.excelpdfService.allGenerateExcel(keyPDFHeader, ValueData, objData, headerKeySize)
    }
  }

  onSubmit(){
    // this.submitFlag = true;
    let date = this.attendanceSheetRes ? this.attendanceSheetRes[2] : this.date.value;
    let yearMonth = moment(date).format('YYYY-MM');  
    this.apiService.setHttp('POST', `zp-satara/Attendance/SubmitAttendance?MonthYear=${yearMonth}&UserId=${this.webStorage.getUserId()}&lan=${this.webStorageS.languageFlag}`, false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.commonMethod.showPopup(res.statusMessage, 0);
          // this.dialogRef.close('yes');
        } else {
          this.commonMethod.showPopup(res.statusMessage, 1);
        }
      },
      error: ((err: any) => { this.errors.handelError(err) })
    });
  

  }

}


