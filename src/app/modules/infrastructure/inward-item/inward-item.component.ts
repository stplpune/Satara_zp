import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AddInwardItemComponent } from './add-inward-item/add-inward-item.component';
import { ApiService } from 'src/app/core/services/api.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { WebStorageService } from 'src/app/core/services/web-storage.service';
import { MasterService } from 'src/app/core/services/master.service';
import { ValidationService } from 'src/app/core/services/validation.service';
import { GlobalDialogComponent } from 'src/app/shared/components/global-dialog/global-dialog.component';
import { DatePipe } from '@angular/common';
import { DownloadPdfExcelService } from 'src/app/core/services/download-pdf-excel.service';

@Component({
  selector: 'app-parameter',
  templateUrl: './inward-item.component.html',
  styleUrls: ['./inward-item.component.scss']
})
export class InwardItemComponent {
  viewStatus = "Table";
  cardViewFlag: boolean = false;
  filterForm!: FormGroup;
  pageNumber: number = 1;
  tableDataArray = new Array();
  tableDatasize!: Number;
  totalCount: number = 0;
  tableData: any;
  highLightFlag: boolean = true;
  displayedColumns = new Array();
  langTypeName: any;
  talukaArr = new Array();
  centerArr = new Array();
  villageArr = new Array();
  schoolArr = new Array();
  categoryArr = new Array();
  subCategoryArr = new Array();
  itemArr = new Array();
  resultDownloadArr = new Array();
  loginData = this.webStorageS.getLoggedInLocalstorageData();
  get f() { return this.filterForm.controls };
  displayedheadersEnglish = ['Sr. No.', 'Category', 'Sub Category', 'Item', 'Units', 'Purchase Date', 'Price', 'Remark', 'Photo', 'Action'];
  displayedheadersMarathi = ['अनुक्रमांक', 'श्रेणी', 'उप श्रेणी', 'वस्तू', 'युनिट्स', 'खरेदी दिनांक', 'किंमत', 'शेरा', 'फोटो', 'कृती'];

  constructor(private fb: FormBuilder,
    public dialog: MatDialog,
    private apiService: ApiService,
    private errors: ErrorsService,
    private commonMethodS: CommonMethodsService,
    private ngxSpinner: NgxSpinnerService,
    public webStorageS: WebStorageService,
    private masterService: MasterService,
    public validationService: ValidationService,
    private excelpdfService: DownloadPdfExcelService,
    public datepipe: DatePipe) { }

  ngOnInit() {
    this.filterFormData();
    this.getTableData();
    this.webStorageS.langNameOnChange.subscribe(lang => {
      this.langTypeName = lang;
      this.languageChange();
    });
    this.getTaluka();
    this.getCategoryDrop();
  }

  filterFormData() {
    this.filterForm = this.fb.group({
      talukaId :[this.loginData.userTypeId > 2 ? this.loginData.talukaId : ''],
      centerId:[this.loginData.userTypeId > 2 ? this.loginData.centerId : ''],
      villageId:[this.loginData.userTypeId > 2 ? this.loginData.villageId : ''],
      schoolId:[this.loginData.userTypeId > 2 ? this.loginData.schoolId : ''],
      categoryId: [''],
      subCategoryId: [''],
      itemsId: [''],
      textSearch: ['']
    })
  }

  getTableData(flag?: string) {
    this.ngxSpinner.show();
    this.pageNumber = flag == 'filter' ? 1 : this.pageNumber;
    let formValue = this.filterForm.value;
    let str = `SchoolId=${(formValue?.schoolId || 0)}&CategoryId=${(formValue?.categoryId || 0)}&SubCategoryId=${(formValue?.subCategoryId || 0)}&ItemId=${(formValue?.itemsId || 0)}&pageno=1&pagesize=10&TextSearch=${(formValue?.textSearch || '')}&lan=${this.webStorageS.languageFlag}`;
    this.apiService.setHttp('GET', 'zp-satara/Inward/GetAllInward?' + str, false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.ngxSpinner.hide();
          this.tableDataArray = res.responseData.responseData1;
          this.totalCount = res.responseData.responseData2.pageCount;
          this.tableDatasize = res.responseData.responseData2.pageCount;
          this.resultDownloadArr = [];
          let data: [] = res.responseData.responseData1;
          flag == 'excel' ? this.pdfDownload(data) : '';
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
    this.displayedColumns = ['srNo', this.langTypeName == 'English' ? 'category' : 'm_Category', this.langTypeName == 'English' ? 'subCategory' : 'm_SubCategory', 'item', 'quantity', 'purchase_Sales_Date', 'price', 'remark', 'photo', 'action'];
    this.tableData = {
      pageNumber: this.pageNumber,
      img: 'photo', blink: '', badge: '', isBlock: '', pagintion: true, defaultImg: "",
      date: 'purchase_Sales_Date',
      displayedColumns: this.displayedColumns,
      tableData: this.tableDataArray,
      tableSize: this.tableDatasize,
      tableHeaders: this.langTypeName == 'English' ? this.displayedheadersEnglish : this.displayedheadersMarathi
    };
    this.highLightFlag ? this.tableData.highlightedrow = true : this.tableData.highlightedrow = false,
      this.apiService.tableData.next(this.tableData);
  }

  childCompInfo(obj: any) {
    switch (obj.label) {
      case 'Pagination':
        this.pageNumber = obj.pageNumber;
        this.getTableData();
        break;
      case 'Edit':
        this.openDialog(obj);
        break;
      case 'Delete':
        this.globalDialogOpen(obj);
        break;
    }
  }

  openDialog(obj?: any) {
    const dialogRef = this.dialog.open(AddInwardItemComponent,
      {
        width: '700px',
        disableClose: true,
        autoFocus: false,
        data: obj
      });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result == 'yes' && obj) {
        this.onClear();
        this.getCategoryDrop();
        this.getTableData();
        this.pageNumber = obj.pageNumber;
      }
      else if (result == 'yes') {
        this.getCategoryDrop();
        this.getTableData();
        this.onClear();
        this.pageNumber = 1;
      }
      this.highLightFlag = false;
      this.languageChange();
    });
  }

  getTaluka() {
    this.talukaArr = [];
    this.masterService.getAllTaluka('').subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.talukaArr.push({ "id": 0, "taluka": "All", "m_Taluka": "सर्व" }, ...res.responseData);
          this.filterForm?.value.talukaId ? this.getAllCenter() : '';
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
            this.filterForm?.value.centerId ? this.getVillage():'';
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
            this.filterForm?.value.villageId ? this.getAllSchools():'';
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
          this.f['schoolId'].setValue(this.loginData.schoolId);
        } else {
          this.commonMethodS.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethodS.showPopup(res.statusMessage, 1);
          this.schoolArr = [];
        }
      }
    });
  }

  getCategoryDrop() {
    this.categoryArr = [];
    this.masterService.GetAllAssetCategory('').subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.categoryArr.push({ "id": 0, "category": "All", "m_Category": "सर्व" }, ...res.responseData);
        } else {
          this.commonMethodS.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethodS.showPopup(res.statusMessage, 1);
          this.categoryArr = [];
        }
      }
    });
  }

  getSubCategoryDrop() {
    this.subCategoryArr = [];
    this.masterService.GetAssetSubCateByCateId(this.filterForm.value.categoryId, '').subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.subCategoryArr.push({ "id": 0, "subCategory": "All", "m_SubCategory": "सर्व" }, ...res.responseData);
        } else {
          this.commonMethodS.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethodS.showPopup(res.statusMessage, 1);
          this.subCategoryArr = [];
        }
      }
    });
  }

  getItemDrop() {
    this.itemArr = [];
    this.masterService.GetAllItem(this.filterForm.value.subCategoryId, '').subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.itemArr.push({ "id": 0, "itemName": "All", "m_ItemName": "सर्व" }, ...res.responseData);
        } else {
          this.commonMethodS.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethodS.showPopup(res.statusMessage, 1);
          this.itemArr = [];
        }
      }
    });
  }

  globalDialogOpen(obj: any) {
    let dialoObj = {
      header: 'Delete',
      title: this.webStorageS.languageFlag == 'EN' ? 'Do you want to delete Inward Item?' : 'तुम्हाला आवक वस्तू हटवायची आहे का?',
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
        this.onClickDelete(obj);
      }
      this.highLightFlag = false;
      this.languageChange();
    })
  }

  onClickDelete(obj: any) {
    let webStorageMethod = this.webStorageS.createdByProps();
    let deleteObj = {
      "id": obj.id,
      "modifiedBy": webStorageMethod.modifiedBy,
      "modifiedDate": webStorageMethod.modifiedDate,
      "lan": this.webStorageS.languageFlag
    }
    this.apiService.setHttp('delete', 'zp-satara/Inward/DeleteInward', false, deleteObj, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.commonMethodS.showPopup(res.statusMessage, 0);
          this.getTableData();
        }
      },
      error: (error: any) => {
        this.commonMethodS.checkEmptyData(error.statusText) == false ? this.errors.handelError(error.statusCode) : this.commonMethodS.showPopup(error.statusText, 1);
      }
    })
  }

  onClear() {
    this.filterFormData();
    this.getTableData();
    this.centerArr = [];
    this.villageArr = [];
    this.categoryArr = [];
    this.subCategoryArr = [];
    this.schoolArr = [];
    this.itemArr = [];
    this.f['centerId'].setValue(0);
  }

  onChangeDropD(label: string) {
    switch (label) {
      case 'taluka':
        this.f['centerId'].setValue(0);
        this.f['villageId'].setValue(0);
        this.f['categoryId'].setValue(0);
        this.f['subCategoryId'].setValue(0);
        this.f['itemsId'].setValue(0);
        this.villageArr = [];
        this.categoryArr = [];
        this.subCategoryArr = [];
        this.itemArr = [];
        this.schoolArr = [];
        break;
      case 'center':
        this.f['villageId'].setValue(0);
        this.f['categoryId'].setValue(0);
        this.f['subCategoryId'].setValue(0);
        this.f['itemsId'].setValue(0);
        this.categoryArr = [];
        this.subCategoryArr = [];
        this.itemArr = [];
        this.schoolArr = [];
        break;
      case 'village':
        this.f['categoryId'].setValue(0);
        this.f['subCategoryId'].setValue(0);
        this.f['itemsId'].setValue(0);
        this.f['schoolId'].setValue(0);
        this.categoryArr = [];
        this.subCategoryArr = [];
        this.itemArr = [];
        break;
      case 'school':
        this.f['categoryId'].setValue(0);
        this.f['subCategoryId'].setValue(0);
        this.f['itemsId'].setValue(0);
        this.subCategoryArr = [];
        this.itemArr = [];
        break;
      case 'category':
        this.itemArr = [];
        this.f['subCategoryId'].setValue(0);
        this.f['itemsId'].setValue(0);
        break;
      case 'subCategory':
        this.f['itemsId'].setValue(0);
        break;
    }
  }

  pdfDownload(data: any) {
    data.map((ele: any, i: any) => {
      ele.purchase_Sales_Date = this.datepipe.transform(ele.purchase_Sales_Date, 'dd/MM/yyyy');
      let obj = {
        "Sr.No": i + 1,
        "Category Name": ele.category,
        "Sub Category": ele.subCategory,
        "Item": ele.item,
        "Units": ele.quantity,
        "Purchase Date": ele.purchase_Sales_Date,
        "Price": ele.price,
        "Remark": ele.remark,
      }
      this.resultDownloadArr.push(obj);
    });
    let keyPDFHeader = ['Sr.No.', 'Category', 'Sub Category', 'Item', 'Units', 'Purchase Date', 'Price', 'Remark'];
    let ValueData =
      this.resultDownloadArr.reduce(
        (acc: any, obj: any) => [...acc, Object.values(obj).map((value) => value)], []
      );// Value Name

    let objData: any = {
      'topHedingName': 'Inward Itmes List',
      'createdDate': 'Created on:' + this.datepipe.transform(new Date(), 'yyyy-MM-dd, h:mm a')
    }
    this.excelpdfService.downLoadPdf(keyPDFHeader, ValueData, objData);
  }


}

