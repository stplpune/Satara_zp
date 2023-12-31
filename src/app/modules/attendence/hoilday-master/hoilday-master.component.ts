import { Component } from '@angular/core';
import { AddHoildayMasterComponent } from './add-hoilday-master/add-hoilday-master.component';
import { MatDialog } from '@angular/material/dialog';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { ApiService } from 'src/app/core/services/api.service';
import { WebStorageService } from 'src/app/core/services/web-storage.service';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { GlobalDialogComponent } from 'src/app/shared/components/global-dialog/global-dialog.component';
import { FormControl } from '@angular/forms';
import { ValidationService } from 'src/app/core/services/validation.service';
import { DownloadPdfExcelService } from 'src/app/core/services/download-pdf-excel.service';
import { DatePipe } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-hoilday-master',
  templateUrl: './hoilday-master.component.html',
  styleUrls: ['./hoilday-master.component.scss']
})
export class HoildayMasterComponent {
  displayedheadersEnglish = ['Sr. No.', 'Holiday Date', ' Holiday Name', 'Action'];
  displayedheadersMarathi = ['अनुक्रमांक', 'सुट्टीची तारीख', 'सुट्टीचे नाव', 'कृती'];
  tableresp = new Array();
  viewStatus = 'Table';
  langTypeName: any;
  totalItem: any;
  deleteId: any;
  yearId = new FormControl();
  textsearch = new FormControl();
  pageNumber: number = 1;
  totalCount: any;
  filterFlag: boolean = false;
  resultDownloadArr = new Array();
  YearArr = new Array();
  constructor(public dialog: MatDialog,
    private errors: ErrorsService,
    private apiService: ApiService,
    public webStorage: WebStorageService,
    private commonService: CommonMethodsService,
    public validation: ValidationService,
    private excelpdfService: DownloadPdfExcelService,
    public datepipe: DatePipe,
    private ngxSpinner: NgxSpinnerService,
  ) { }


  ngOnInit() {
    this.getTableData();
    this.webStorage.langNameOnChange.subscribe(lang => {
      this.langTypeName = lang;
      this.setTableData();
      this.getAllYear();
    });
  }

  year = [
    { id: 2023, year: '2023', Mname: '२०२३' },
    { id: 2024, year: '2024', Mname: '२०२४' },
    { id: 2025, year: '2025', Mname: '२०२५' },
    { id: 2026, year: '2026', Mname: '२०२६' },
  ]

  getAllYear() {
    this.apiService.setHttp('GET', 'zp-satara/master/GetAllYear', false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.YearArr = res.responseData;
        }
      }
    });
  }

  openDialog(data?: any) {
    const dialogRef = this['dialog'].open(AddHoildayMasterComponent, {
      width: '400px',
      data: data,
      disableClose: true,
      autoFocus: false
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result == 'yes' && data) {
        this.getTableData();
        this.pageNumber = this.pageNumber;
      } else if (result == 'yes') {
        this.getTableData();
        this.pageNumber = 1;
      }
    });
  }

  childCompInfo(obj: any) {
    switch (obj.label) {
      case 'Pagination':
        this.filterFlag ? '' : (this.textsearch.setValue(''), this.filterFlag = false);
        this.pageNumber = obj.pageNumber;
        this.getTableData();
        break;
      case 'Edit':
        this.openDialog(obj);
        break;
      case 'Delete':
        this.deleteDialog(obj);
        break;
    }
  }

  getTableData(status?: any) {
    this.ngxSpinner.show();
    let yearID = this.yearId.value;
    let textsearch = this.textsearch.value?.trim();
    status == 'filter' ? (this.filterFlag = true, (this.pageNumber = 1)) : '';
    let pdf = 'Year=' + (yearID || 0) + '&pageno=' + 1 + '&pagesize=' + this.totalCount + '&TextSearch=' + (textsearch || "") + '&lan=' + this.webStorage.languageFlag
    let str = 'Year=' + (yearID || 0) + '&pageno=' + this.pageNumber + '&pagesize=10&TextSearch=' + (textsearch || "") + '&lan=' + this.webStorage.languageFlag
    this.apiService.setHttp('GET', 'zp-satara/HolidayMaster/GetAllHoliday?' + (status == 'pdf' ? pdf : str), false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        console.log(res);
        if (res.statusCode == "200") {
          this.ngxSpinner.hide();
          status != 'pdf' ? this.tableresp = res.responseData.responseData1 : this.tableresp = this.tableresp;
          this.totalItem = res.responseData.responseData2.pageCount;
          this.totalCount = res.responseData.responseData2.pageCount;
          this.resultDownloadArr = [];
          // let data: [] = res.responseData.responseData1;
          // status == 'pdf' ? this.pdfDownload(data) : '';

          let data: [] = (status == 'pdf' || status == 'excel') ? res.responseData.responseData1 : [];
          status == 'pdf' ? this.pdfDownload(data, 'pdf') : status == 'excel' ? this.pdfDownload(data, 'excel') : '';
        } else {
          this.ngxSpinner.hide();
          this.tableresp = [];
          this.totalItem = 0
        }
        this.setTableData();
      },
      error: ((err: any) => { this.errors.handelError(err) })
    });
  }

  setTableData() {
    // let displayedColumnsReadMode = ['srNo', 'Category Name', 'Sub Category', 'Status', 'Action'];
    let displayedColumns = ['srNo', 'holidayDate', this.langTypeName == 'English' ? 'holidayName' : 'm_HolidayName',  'action'];
    let tableData = {
      pageNumber: this.pageNumber,
      img: '',
      blink: '',
      badge: '',
      pagintion: this.totalItem > 10 ? true : false,
      displayedColumns: displayedColumns,
      tableData: this.tableresp,
      tableSize: this.totalItem,
      edit: true, delete: true,
      date: 'holidayDate',
      // tableHeaders: displayedColumnsReadMode,
      tableHeaders: this.langTypeName == 'English' ? this.displayedheadersEnglish : this.displayedheadersMarathi,
    };
    // this.highLightFlag ? this.tableData.highlightedrow = true : this.tableData.highlightedrow = false,
    this.apiService.tableData.next(tableData);
  }


  deleteDialog(obj: any) {
    this.deleteId = obj.id;
    let dialoObj = {
      header: this.webStorage.languageFlag == 'EN' ? 'Delete' : 'हटवा',
      title: this.webStorage.languageFlag == 'EN' ? 'Do You Want To Delete Holiday Record?' : 'तुम्हाला सुट्टीचा रेकॉर्ड हटवायचा आहे का?',
      cancelButton: this.webStorage.languageFlag == 'EN' ? 'Cancel' : 'रद्द करा',
      okButton: this.webStorage.languageFlag == 'EN' ? 'Ok' : 'ओके'
    }
    const deleteDialogRef = this.dialog.open(GlobalDialogComponent, {
      width: '320px',
      data: dialoObj,
      disableClose: true,
      autoFocus: false
    })
    deleteDialogRef.afterClosed().subscribe((result: any) => {
      if (result == 'yes') {
        this.getDeleteData();
      }
    })
  }


  getDeleteData() {
    let deleteObj = {
      "id": this.deleteId,
      "modifiedBy": 0,
      "modifiedDate": new Date(),
      "lan": "EN"
    }

    this.apiService.setHttp('DELETE', 'zp-satara/HolidayMaster/DeleteHoliday', false, deleteObj, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.getTableData();
          console.log("delete msg", res.statusMessage);
          this.commonService.showPopup(res.statusMessage, 0);
        } else {
          this.commonService.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonService.showPopup(res.statusMessage, 1);
        }
      },
      error: ((err: any) => { this.errors.handelError(err.statusCode) })
    });
  }

  pdfDownload(data: any, flag: any) {
    data.map((ele: any, i: any) => {
      let obj = {
        "Sr.No": i + 1,
        // "Year": ele.year,
        "Holiday Date": this.datepipe.transform(ele.holidayDate, 'dd-MM-yyyy'),
        "Holiday Name": flag == 'excel' ? this.langTypeName == 'English' ? ele.holidayName : ele.m_HolidayName : ele.holidayName,
      }
      this.resultDownloadArr.push(obj);
    });
    let keyPDFHeader = ['Sr.No.', 'Holiday Name', 'Holiday Date'];
    let marathiExcelHeader = ['अनुक्रमांक', 'सुट्टीचे नाव', 'सुट्टीची तारीख']
    let ValueData =
      this.resultDownloadArr.reduce(
        (acc: any, obj: any) => [...acc, Object.values(obj).map((value) => value)], []
      );

    let objData: any = {
      'topHedingName': flag == 'excel' ? this.langTypeName == 'English' ? 'Holiday List' :'सुट्टीची यादी' : 'Holiday List',
      'createdDate': (flag == 'excel' ? this.langTypeName == 'English' ? 'Created on:' : 'रोजी तयार केले :' : 'Created on:')+ this.datepipe.transform(new Date(), 'yyyy-MM-dd, h:mm a')
    }
    let headerKeySize = [7, 15, 20, 30, 40,]
    // this.excelpdfService.downLoadPdf(keyPDFHeader, ValueData, objData);
    flag == 'pdf' ? this.excelpdfService.downLoadPdf(keyPDFHeader, ValueData, objData) : this.excelpdfService.allGenerateExcel(this.langTypeName == 'English' ? keyPDFHeader: marathiExcelHeader, ValueData, objData, headerKeySize)
  }

  clearFilterData() {
    this.textsearch.setValue('');
    this.yearId.setValue('');
    this.pageNumber = 1;
    this.getTableData();
  }

}

