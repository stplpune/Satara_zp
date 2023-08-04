import { Component } from '@angular/core';
import { AddTasksheetComponent } from './add-tasksheet/add-tasksheet.component';
import { MatDialog } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { ApiService } from 'src/app/core/services/api.service';
import { WebStorageService } from 'src/app/core/services/web-storage.service';

@Component({
  selector: 'app-tasksheet',
  templateUrl: './tasksheet.component.html',
  styleUrls: ['./tasksheet.component.scss']
})
export class TasksheetComponent {
  Date = new FormControl('');
  tableresp: any;
  totalItem: any;
  langTypeName: any;
  displayedheadersEnglish = ['Sr. No.', ' Day', 'Check In Time', 'Check Out Time', 'Attendence', 'Remark', 'Action'];
  displayedheadersMarathi = ['अनुक्रमांक', 'दिवस', 'चेक इन वेळ', 'वेळ तपासा', 'उपस्थिती', 'शेरा', 'कृती'];

  // displayedColumns: string[] = ['position', 'name', 'weight', 'symbol','Attendence','Remark','Action'];
  // dataSource = ELEMENT_DATA;
  viewStatus = 'Table';
  constructor(public dialog: MatDialog,
    private errors: ErrorsService,
    private apiService: ApiService,
    private webStorage: WebStorageService,
  ) { }

  ngOnInit() {
    this.getTableData();
    this.webStorage.langNameOnChange.subscribe(lang => {
      this.langTypeName = lang;
      this.getTableTranslatedData();
    });
  }

  foods = [
    { value: 'steak-0', viewValue: 'July-2023' },
    { value: 'pizza-1', viewValue: 'Aug-2023' },
    { value: 'tacos-2', viewValue: 'Sept-2023' },
  ]

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
    status
    // status == 'filter' ? (this.filterFlag = true, (this.pageNumber = 1)) : '';
    // let formData = this.textSearch.value?.trim() || '';
    // let str = 'TextSearch='+formData+  '&PageNo='+this.pageNumber+'&PageSize=10' ;
    // let excel = 'TextSearch='+formData+  '&PageNo='+1+'&PageSize='+this.totalCount ;
    this.apiService.setHttp('GET', 'zp-satara/AssetSubCategory/GetAll?', false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        console.log(res);

        if (res.statusCode == "200") {
          this.tableresp = res.responseData.responseData1
          console.log(this.tableresp);

          // status != 'excel' ? this.tableresp = res.responseData.responseData1 : this.tableresp = this.tableresp;
          this.totalItem = res.responseData.responseData2.pageCount;
          // this.totalCount = res.responseData.responseData2.pageCount;
          // this.resultDownloadArr = [];
          // let data: [] = res.responseData.responseData1;
          // status == 'excel' ? this.pdfDownload(data) : '';
        } else {
          this.tableresp = [];
          this.totalItem = 0
        }
        this.getTableTranslatedData();
      },
      error: ((err: any) => { this.errors.handelError(err) })
    });
  }

  getTableTranslatedData() {
    // this.highLightFlag=true;
    // let displayedColumnsReadMode = ['srNo', 'Category Name', 'Sub Category', 'Status', 'Action'];
    let displayedColumns = ['srNo', 'category', 'subCategory', 'status', 'id', 'categoryId', 'action'];
    let tableData = {
      // pageNumber: this.pageNumber,
      img: '',
      blink: '',
      badge: '',
      // isBlock: 'status',
      pagintion: this.totalItem > 10 ? true : false,
      displayedColumns: displayedColumns,
      tableData: this.tableresp,
      tableSize: this.totalItem,
      edit: true,
      // tableHeaders: displayedColumnsReadMode,
      tableHeaders: this.langTypeName == 'English' ? this.displayedheadersEnglish : this.displayedheadersMarathi,
    };
    // this.highLightFlag ? this.tableData.highlightedrow = true : this.tableData.highlightedrow = false,
    this.apiService.tableData.next(tableData);
  }

  childCompInfo(obj: any) {
    switch (obj.label) {
      case 'Pagination':
        // this.filterFlag ? '' : (this.textSearch.setValue(''), this.filterFlag = false);
        // this.pageNumber = obj.pageNumber;
        this.getTableData();
        break;
      case 'Edit':
        this.openDialog();
        break;
      case 'Block':
        // this.openBlockDialog();
        break;
      case 'Delete':
        // this.globalDialogOpen(obj);
        break;
    }
  }


}


