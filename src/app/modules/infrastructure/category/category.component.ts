import { Component } from '@angular/core';
import { AddCategoryComponent } from './add-category/add-category.component';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'src/app/core/services/api.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { FormControl } from '@angular/forms';
import { GlobalDialogComponent } from 'src/app/shared/components/global-dialog/global-dialog.component';
import { WebStorageService } from 'src/app/core/services/web-storage.service';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent {
  viewStatus = 'Table';
  // displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  // dataSource = ELEMENT_DATA;
  search = new FormControl('');
  tableresp: any;
  totalItem: any;
  langTypeName: any;
  filterFlag:boolean=false;
  totalCount:any;
  pageNumber: number = 1;
  constructor(public dialog: MatDialog,
    private apiService: ApiService,
    private errors: ErrorsService,
    private webStorage: WebStorageService,
    private commonService:CommonMethodsService) { }

  ngOnInit() {
    this.getTableData();
    this.webStorage.langNameOnChange.subscribe(lang => {
      this.langTypeName = lang;
      // this.languageChange();
    });
    // this.getStatus();
  }

  openDialog(data?: any) {
    const dialogRef = this.dialog.open(AddCategoryComponent, {
      width: '400px',
      data: data,
      disableClose: true,
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {

      if (result == 'yes') {
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
        this.filterFlag?'': (this.search.setValue(''),this.filterFlag=false);
        this.pageNumber = obj.pageNumber;
        this.getTableData();
        break;
      case 'Edit':
        this.openDialog(obj);
        break;
      case 'Block':
        this.openBlockDialog(obj);
        break;
      case 'Delete':
        // this.globalDialogOpen(obj);
        break;
    }
  }

  getTableData(status?:any) {
    status
    let formData = this.search.value || ''
    this.apiService.setHttp('GET', 'zp-satara/AssetCategory/GetAll?TextSearch=' + formData + '&PageNo=' + this.pageNumber + '&PageSize=10', false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
console.log(res);

        if (res.statusCode == "200") {
          this.tableresp = res.responseData.responseData1;
          this.totalItem = res.responseData.responseData2.pageCount;
          this.totalCount = res.responseData.responseData2.pageCount;
        } else {
          this.tableresp = [];
          this.totalItem=0
        }
        this.getTableTranslatedData();
      },
      error: ((err: any) => { this.errors.handelError(err) })
    });
  }

  getTableTranslatedData() {
    // this.highLightFlag=true;
    let displayedColumnsReadMode = ['srNo', 'Category Name', 'Inactive/Active', 'Action'];
    let displayedColumns = ['srNo', 'category', 'isBlock', 'action'];
    let tableData = {
      pageNumber: this.pageNumber,
      img: '',
      blink: '',
      badge: '',
      isBlock: 'isBlock',
      pagintion: this.totalItem > 10 ? true : false,
      displayedColumns: displayedColumns,
      tableData: this.tableresp,
      tableSize: this.totalItem,
      tableHeaders: displayedColumnsReadMode,
    };
    // this.highLightFlag ? this.tableData.highlightedrow = true : this.tableData.highlightedrow = false,
    this.apiService.tableData.next(tableData);
  }

  openBlockDialog(obj: any) {
    console.log(obj);

    let userEng = obj.isBlock == false ?'Active' : 'Inactive';
    let userMara = obj.isBlock == false ?'ब्लॉक' : 'अनब्लॉक';
    let dialoObj = {
      header: this.langTypeName == 'English' ? userEng+' Office User' : 'ऑफिस वापरकर्ता '+userMara+' करा',
      title: this.langTypeName == 'English' ? 'Do You Want To '+userEng+' The Selected Category?' : 'तुम्ही निवडलेल्या ऑफिस वापरकर्त्याला '+userMara+' करू इच्छिता?',
      cancelButton: this.langTypeName == 'English' ? 'Cancel' : 'रद्द करा',
      okButton: this.langTypeName == 'English' ? 'Ok' : 'ओके'
    }
    const deleteDialogRef = this.dialog.open(GlobalDialogComponent, {
      width: '320px',
      data: dialoObj,
      disableClose: true,
      autoFocus: false
    })
    deleteDialogRef.afterClosed().subscribe((result: any) => {
      result == 'yes' ? this.getStatus(obj) : this.getTableData();
      // this.highLightFlag=false;
      // this.languageChange();
    })
  }

  getStatus(data: any) {
    console.log(data);
    let webdata = this.webStorage.createdByProps();
    let obj = {
      "id": data.id,
      "status": !data.status,
      "statusChangeBy": this.webStorage.getUserId(),
      "statusChangeDate": webdata.modifiedDate,
      "lan": this.webStorage.languageFlag
    }
    console.log(obj);
    
    this.apiService.setHttp('put', 'zp-satara/AssetCategory/UpdateStatus', false, obj, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        console.log(res);
        if (res.statusCode == "200") {
          this.commonService.snackBar(res.statusMessage, 0);
          // this.tableresp = res.responseData.responseData1;
        } else {
          this.commonService.snackBar(res.statusMessage, 1);
        }
      },
      error: ((err: any) => { this.errors.handelError(err) })
    });
  }

  clearFilterData() {
    this.search.setValue('');
    this.pageNumber = 1;
    this.getTableData();
  }


}

