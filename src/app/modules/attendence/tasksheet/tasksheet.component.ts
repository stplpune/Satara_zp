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
// import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
// const moment = _moment;
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
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
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
  // date = new FormControl('');
  tableresp: any;
  totalItem: any;
  langTypeName: any;
  today = new Date();
  sixMonthsAgo = new Date();
  startDate = new Date(1990, 0);
  // totalCount: number = 0;
  // pageSize: number = 10;
  // pageNo: number = 1;
  displayedheadersEnglish = ['Sr. No.', ' Day', 'Check In Time', 'Check Out Time', 'Attendence', 'Remark', 'Action'];
  displayedheadersMarathi = ['अनुक्रमांक', 'दिवस', 'चेक इन वेळ', 'वेळ तपासा', 'उपस्थिती', 'शेरा', 'कृती'];

  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol', 'Attendence', 'Remark', 'Action'];
  dataSource: any;
  viewStatus = 'Table';
  constructor(public dialog: MatDialog,
    private errors: ErrorsService,
    private apiService: ApiService,
    private webStorage: WebStorageService,
    private datePipe: DatePipe,
    // private commonMethod:CommonMethodsService,
  ) { }

  ngOnInit() {
    this.webStorage.getUserId()
    // let dateOfexpense = this.commonMethod.setDate(date.dateOfexpense);
    // console.log(dateOfexpense);

    this.getTableData();
    this.webStorage.langNameOnChange.subscribe(lang => {
      this.langTypeName = lang;
      // this.getTableTranslatedData();
    });

    this.sixMonthsAgo.setMonth(this.today.getMonth() - 6);
  }

  foods = [
    { value: 'steak-0', viewValue: 'July-2023' },
    { value: 'pizza-1', viewValue: 'Aug-2023' },
    { value: 'tacos-2', viewValue: 'Sept-2023' },
  ]

  chosenYearHandler(normalizedYear: any) {
    let datePipeString = this.datePipe.transform(normalizedYear, 'yyyy-MM');
    console.log(datePipeString);

    let ctrlValue = this.date.value;
    console.log(ctrlValue);

    // ctrlValue.year(normalizedYear.year());
    // this.Date.setValue(ctrlValue);
  }

  // openDatePicker(dp:any) {
  //   console.log(dp);

  //   dp.open();
  // }

  closeDatePicker(eventData: any, dp?: any) {
    let formData = this.date.value;
    console.log(formData);
    let datePipeString = this.datePipe.transform(eventData, 'yyyy-MM');
    console.log(datePipeString);
    // ctrlValue.year(normalizedYear.year());
    //  console.log(this.date.setValue(datePipeString));
    dp.close();
    let ctrlValue = this.date.value;
    console.log("ctrlValue", ctrlValue);
    // this.date.setValue(ctrlValue);
  }


  openDialog() {
    const dialogRef = this['dialog'].open(AddTasksheetComponent, {
      width: '500px',
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

  // openDialog(data?: any) {
  //   data?'':this.textSearch.setValue('');
  //   this.filterFlag && data?'':(this.getTableData(),this.filterFlag=false);
  //   const dialogRef = this.dialog.open(AddSubCategoryComponent, {
  //     width: '400px',
  //     data: data,
  //     disableClose: true,
  //     autoFocus: false
  //   });

  //   dialogRef.afterClosed().subscribe(result => {
  //     if (result == 'yes' && data) {
  //       this.getTableData();
  //       this.pageNumber = this.pageNumber;
  //     } else if (result == 'yes') {
  //       this.getTableData();
  //       this.pageNumber = 1;
  //     }
  //   });
  // }

  getTableData(status?: any) {
    let date = this.date.value
    let yearMonth = moment(date).format('YYYY-MM');

    // let dateYear = date[0].Moment
    // this.datePipe.transform(this.date.value, 'yyyy-MM');
    // return
    status
    // status == 'filter' ? (this.filterFlag = true, (this.pageNumber = 1)) : '';
    // let formData = this.textSearch.value?.trim() || '';
    // let str = 'TextSearch='+formData+  '&PageNo='+this.pageNumber+'&PageSize=10' ;
    // let excel = 'TextSearch='+formData+  '&PageNo='+1+'&PageSize='+this.totalCount ;
    this.apiService.setHttp('GET', 'zp-satara/Attendance/GetAttendanceTasksheet?MonthYear=' + yearMonth + '&UserId=1242', false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        // console.log(res);

        if (res.statusCode == "200") {
          this.tableresp = res.responseData.responseData1
          // console.log(this.tableresp);

          // status != 'excel' ? this.tableresp = res.responseData.responseData1 : this.tableresp = this.tableresp;
          // this.totalItem = res.responseData.responseData2.pageCount;
          // this.totalCount = res.responseData.responseData2.pageCount;
          // this.resultDownloadArr = [];
          // let data: [] = res.responseData.responseData1;
          // status == 'excel' ? this.pdfDownload(data) : '';
        } else {
          this.tableresp = [];
          this.totalItem = 0
        }
        // this.getTableTranslatedData();
      },
      error: ((err: any) => { this.errors.handelError(err) })
    });
  }

  // getTableTranslatedData() {
  //   // this.highLightFlag=true;
  //   // let displayedColumnsReadMode = ['srNo', 'Category Name', 'Sub Category', 'Status', 'Action'];
  //   let displayedColumns = ['srNo', 'category', 'subCategory', 'status', 'id', 'categoryId', 'action'];
  //   let tableData = {
  //     // pageNumber: this.pageNumber,
  //     img: '',
  //     blink: '',
  //     badge: '',
  //     // isBlock: 'status',
  //     pagintion: this.totalItem > 10 ? true : false,
  //     displayedColumns: displayedColumns,
  //     tableData: this.tableresp,
  //     tableSize: this.totalItem,
  //     edit: true,
  //     // tableHeaders: displayedColumnsReadMode,
  //     tableHeaders: this.langTypeName == 'English' ? this.displayedheadersEnglish : this.displayedheadersMarathi,
  //   };
  //   // this.highLightFlag ? this.tableData.highlightedrow = true : this.tableData.highlightedrow = false,
  //   this.apiService.tableData.next(tableData);
  // }

  // childCompInfo(obj: any) {
  //   switch (obj.label) {
  //     case 'Pagination':
  //       // this.filterFlag ? '' : (this.textSearch.setValue(''), this.filterFlag = false);
  //       // this.pageNumber = obj.pageNumber;
  //       this.getTableData();
  //       break;
  //     case 'Edit':
  //       this.openDialog();
  //       break;
  //     case 'Block':
  //       // this.openBlockDialog();
  //       break;
  //     case 'Delete':
  //       // this.globalDialogOpen(obj);
  //       break;
  //   }
  // }

  // paginationEvent(event: any) {
  //   event
  //   // this.pageNo = event.pageIndex + 1;
  //   // this.filterFlag ? '' : (this.textSearch.setValue(''), this.filterFlag = false);
  //   this.getTableData();
  // }

  setMonthAndYear(normalizedMonthAndYear: Moment, datepicker: MatDatepicker<Moment>) {
    const ctrlValue = this.date.value!;
    ctrlValue.month(normalizedMonthAndYear.month());
    ctrlValue.year(normalizedMonthAndYear.year());
    this.date.setValue(ctrlValue);
    datepicker.close();

  }

  onClear() {
    // this.date.setValue(null);
    this.getTableData()
  }

}


