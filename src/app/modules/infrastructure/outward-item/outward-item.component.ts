import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AddOutwardItemComponent } from './add-outward-item/add-outward-item.component';
import { MasterService } from 'src/app/core/services/master.service';
import { WebStorageService } from 'src/app/core/services/web-storage.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { ApiService } from 'src/app/core/services/api.service';
import { DownloadPdfExcelService } from 'src/app/core/services/download-pdf-excel.service';
import { DatePipe } from '@angular/common';
import { ValidationService } from 'src/app/core/services/validation.service';
import { GlobalDialogComponent } from 'src/app/shared/components/global-dialog/global-dialog.component';
@Component({
  selector: 'app-item-transfer',
  templateUrl: './outward-item.component.html',
  styleUrls: ['./outward-item.component.scss']
})
export class OutwardItemComponent {
  viewStatus = "Table";
  cardViewFlag: boolean = false;
  filterForm!: FormGroup;
  categoryresp: any;
  subcategoryresp: any;
  totalItem: any;
  totalCount: any;
  tableresp: any;
  itemresp: any;
  pageNumber: number = 1;
  filterFlag: boolean = false;
  highLightFlag: boolean = true;
  resultDownloadArr = new Array();
  tableData:any;
  Id = this.webStorage.getLoggedInLocalstorageData();
  constructor(private fb: FormBuilder,
    public dialog: MatDialog,
    private masterService: MasterService,
    public webStorage: WebStorageService,
    private errors: ErrorsService,
    private commonMethod: CommonMethodsService,
    private apiService: ApiService,
    private excelpdfService: DownloadPdfExcelService,
    public datepipe: DatePipe,
    public Validation:ValidationService,
  ) { }
  ngOnInit() {
    this.filterFormData();
    this.getCategory();
    this.getTableData();

  }

  filterFormData() {
    this.filterForm = this.fb.group({
      CategoryId: [''],
      SubCategoryId: [''],
      ItemsId: [''],
      textSearch: ['']
    })
  }

  openDialog(data?:any) {
    this.filterFlag && data ? '' : (this.getTableData(), this.filterFlag = false);
    const dialogRef = this.dialog.open(AddOutwardItemComponent,
      {
        width: '700px',
        disableClose: true,
        autoFocus: false,
        data: data
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

  getCategory() {
    this.categoryresp = [];
    this.masterService.GetAllAssetCategory(this.webStorage.languageFlag).subscribe({
      next: ((res: any) => {
        if (res.statusCode == 200 && res.responseData.length) {
          this.categoryresp = res.responseData;
        } else {
          this.categoryresp = [];
        }
      }), error: (error: any) => {
        this.errors.handelError(error.statusCode)
      }
    })
  }

  getSubCategory(categoryId: any) {
    this.masterService.GetAssetSubCateByCateId(categoryId, '').subscribe({
      next: (res: any) => {


        if (res.statusCode == '200') {
          this.subcategoryresp = res.responseData;
        } else {
          this.subcategoryresp = [];
          this.commonMethod.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethod.showPopup(res.statusMessage, 1);
          this.subcategoryresp = [];
        }
      }
    });
  }

  getItem(subcategoryId: any) {
    this.apiService.setHttp('GET', 'zp-satara/master/GetAllItem?SubCategoryId=' + subcategoryId + '&flag_lang=e', false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.itemresp = res.responseData;

        } else {
          this.tableresp = [];
        }
      },
      error: ((err: any) => { this.errors.handelError(err) })
    });
  }

  childCompInfo(obj: any) {

    switch (obj.label) {
      case 'Pagination':
        this.filterFlag ? '' : (this.filterForm.value.setValue(''), this.filterFlag = false);
        this.pageNumber = obj.pageNumber;
        this.getTableData();
        break;
      case 'Edit':
        this.openDialog(obj);
        break;
      case 'Block':
        // this.openBlockDialog(obj);
        break;
      case 'Delete':
        this.globalDialogOpen(obj);
        break;
    }
  }

  getTableData(status?: any) {
    status == 'filter' ? (this.filterFlag = true, (this.pageNumber = 1)) : '';
    let formData = this.filterForm.value;
    let obj = {
      "CategoryId": formData.CategoryId || 0,
      "SubCategoryId": formData.SubCategoryId || 0,
      "ItemsId": formData.ItemsId || 0,
      "textSearch": formData.textSearch || '',
    }

    let str = '&CategoryId=' + obj.CategoryId + '&SubCategoryId=' + obj.SubCategoryId + '&ItemId=' + obj.ItemsId + '&pageno=' + this.pageNumber + '&pagesize=10&TextSearch=' + obj.textSearch + '&lan=d'
    let excel = '&CategoryId=' + obj.CategoryId + '&SubCategoryId=' + obj.SubCategoryId + '&ItemId=' + obj.ItemsId + '&pageno=' + 1 + '&pagesize=10&TextSearch=' + obj.textSearch + '&lan=d'

    // this.apiService.setHttp('GET', 'zp-satara/Outward/GetAllOutward?SchoolId='+this.Id.schoolId+(status=='filter'?str:excel), false, false, false, 'baseUrl');
    this.apiService.setHttp('GET', 'zp-satara/Outward/GetAllOutward?SchoolId=2104' + (status == 'filter' ? str : excel), false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
      
        if (res.statusCode == "200") {
          status != 'excel' ? this.tableresp = res.responseData.responseData1 : this.tableresp = this.tableresp;
          // this.tableresp = res.responseData.responseData1 ;
          this.totalItem = res.responseData.responseData2.pageCount;
          this.totalCount = res.responseData.responseData2.pageCount;
          this.resultDownloadArr = [];
          let data: [] = res.responseData.responseData1;
          status == 'excel' ? this.pdfDownload(data) : '';
        } else {
          this.tableresp = [];
          this.totalItem = 0
        }
        this.setTableData();
      },
      error: ((err: any) => { this.errors.handelError(err) })
    });
  }


  setTableData() {
    let displayedColumnsReadMode = ['srNo', 'Category Name', 'Sub Category', 'Items', 'Action'];
    let displayedColumns = ['srNo', 'category', 'subCategory', 'item', 'action'];
    this.tableData  = {
      pageNumber: this.pageNumber,
      img: '',
      blink: '',
      badge: '',
      pagintion: this.totalItem > 10 ? true : false,
      displayedColumns: displayedColumns,
      tableData: this.tableresp,
      tableSize: this.totalItem,
      tableHeaders: displayedColumnsReadMode,
      // tableHeaders: this.langTypeName == 'English' ? this.displayedheadersEnglish : this.displayedheadersMarathi,
    };
    this.highLightFlag ? this.tableData .highlightedrow = true : this.tableData .highlightedrow = false,
    this.apiService.tableData.next(this.tableData );
  }
  clearFilterData() {
    this.filterForm.controls['CategoryId'].setValue('');
    this.filterForm.controls['SubCategoryId'].setValue('');
    this.filterForm.controls['ItemsId'].setValue('');
    this.filterForm.controls['textSearch'].setValue('');
    this.subcategoryresp = [];
    this.itemresp = [];
    this.pageNumber = 1;
    this.getTableData();
  }

  globalDialogOpen(obj:any){
    let dialoObj = {
      header: 'Delete',
      title: this.webStorage.languageFlag == 'EN' ? 'Do you want to delete Outward Item?' : 'तुम्हाला बाह्य वस्तू हटवायची आहेत का?',
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
        this.onClickDelete(obj);
      }
      this.highLightFlag=false;
      this.setTableData();
    })
  }

  onClickDelete(obj : any) {
    let webStorageMethod = this.webStorage.createdByProps();
    let deleteObj = {
      "id": obj.id,
      "modifiedBy": webStorageMethod.modifiedBy,
      "modifiedDate": webStorageMethod.modifiedDate,
      "lan": this.webStorage.languageFlag
    }
    this.apiService.setHttp('delete', 'zp-satara/Outward/DeleteOutward', false, deleteObj, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.commonMethod.showPopup(res.statusMessage, 0);
          this.getTableData();
        }
      },
      error: (error: any) => {
        this.commonMethod.checkEmptyData(error.statusText) == false ? this.errors.handelError(error.statusCode) : this.commonMethod.showPopup(error.statusText, 1);
      }
    })
  }

  pdfDownload(data: any) {
    data.map((ele: any, i: any) => {
      let obj = {
        "Sr.No": i + 1,
        "Category Name": ele.category,
        "Sub Category Name": ele.subCategory,
        "Items":ele.item,
      }
      this.resultDownloadArr.push(obj);
    });
    let keyPDFHeader = ['Sr.No.', 'Category Name', 'Sub Category Name','Items'];
    let ValueData =
      this.resultDownloadArr.reduce(
        (acc: any, obj: any) => [...acc, Object.values(obj).map((value) => value)], []
      );// Value Name

    let objData: any = {
      'topHedingName': 'Outward Itmes List',
      'createdDate': 'Created on:' + this.datepipe.transform(new Date(), 'yyyy-MM-dd, h:mm a')
    }
    this.excelpdfService.downLoadPdf(keyPDFHeader, ValueData, objData);
  }
}

