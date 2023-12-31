import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AddItemComponent } from './add-item/add-item.component';
// import { NgxSpinnerService } from 'ngx-spinner';
import { ApiService } from 'src/app/core/services/api.service';
import { WebStorageService } from 'src/app/core/services/web-storage.service';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { MasterService } from 'src/app/core/services/master.service';
import { DownloadPdfExcelService } from 'src/app/core/services/download-pdf-excel.service';
import { DatePipe } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
import { GlobalDialogComponent } from 'src/app/shared/components/global-dialog/global-dialog.component';
import { ValidationService } from 'src/app/core/services/validation.service';
@Component({
  selector: 'app-item-registration',
  templateUrl: './item-registration.component.html',
  styleUrls: ['./item-registration.component.scss']
})
export class ItemRegistrationComponent {
  viewStatus = "Table";
  cardViewFlag: boolean = false;
  filterForm!: FormGroup;
  pageNumber: number = 1;
  searchContent = new FormControl('');
  totalCount: number = 0;
  tableDataArray = new Array();
  tableDatasize!: number;
  languageFlag!: string;
  highLightFlag: boolean = true;
  isWriteRight!: boolean;
  categoryArr = new Array();
  subCategoryArr = new Array();
  itemArr = new Array();
  resultDownloadArr = new Array();
  deleteObj: any;

  displayedColumns = ['srNo', 'category', 'subCategory', 'itemName', 'description', 'action'];
  marathiDisplayedColumns = ['srNo', 'm_Category', 'm_SubCategory', 'm_ItemName', 'description', 'action'];
  displayedheaders = ['Sr. No.', ' Category', 'Sub Category', 'Item', 'Description', 'action'];
  marathiDisplayedheaders = ['अनुक्रमांक', 'श्रेणी', 'उप-श्रेणी', 'वस्तूचे नाव', 'वर्णन', 'कृती'];

  constructor(private fb: FormBuilder,
    public dialog: MatDialog,
    private apiService: ApiService,
    public webService: WebStorageService,
    private commonMethodS: CommonMethodsService,
    private errors: ErrorsService,
    private masterService: MasterService,
    private commonMethods: CommonMethodsService,
    private downloadFileService: DownloadPdfExcelService,
    public datepipe: DatePipe,
    private ngxSpinner: NgxSpinnerService,
    public validators: ValidationService) { }

  ngOnInit(): void {
    this.getIsWriteFunction();
    this.languageFlag = this.webService.languageFlag;
    this.webService.langNameOnChange.subscribe(lang => {
      this.languageFlag = lang;
      this.setTableData();
    });

    this.getTableData();
    this.filterFormData();
    this.getAllCategory();
  }

  getIsWriteFunction() {
    let print = this.webService?.getAllPageName().find((x: any) => {
      return x.pageURL == "item"
    });
    (print.writeRight === true) ? this.isWriteRight = true : this.isWriteRight = false
  }

  filterFormData() {
    this.filterForm = this.fb.group({
      CategoryId: [''],
      SubCategoryId: [''],
      villageId: [''],
      // ItemsId: [''],
      textSearch: ['']
    });
  }

  getTableData(flag?: string) {
    let formValue = this.filterForm?.value
    this.ngxSpinner.show();
    this.pageNumber = flag == 'filter' ? 1 : this.pageNumber;
    let pageNo = this.cardViewFlag ? (this.pageNumber) : this.pageNumber;
    let str = `CategoryId=${formValue?.CategoryId || 0}&SubCategoryId=${formValue?.SubCategoryId || 0}&pageno=${pageNo}&pagesize=10&TextSearch=${formValue?.textSearch || ''}&lan=${this.languageFlag}`
    let reportStr = `CategoryId=${formValue?.CategoryId || 0}&SubCategoryId=${formValue?.SubCategoryId || 0}&pageno=${pageNo}&pagesize=${this.tableDatasize * 10}&TextSearch=${formValue?.textSearch || ''}&lan=${this.languageFlag}`
    this.apiService.setHttp('GET', 'zp-satara/ItemMaster/GetAllItem?' + ((flag == 'pdfFlag' || flag == 'excel') ? reportStr : str), false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.ngxSpinner.hide();
          (flag != 'pdfFlag' && flag != 'excel') ? this.tableDataArray = res.responseData.responseData1 : this.tableDataArray = this.tableDataArray;
          // (flag != 'excel') ? this.tableDataArray = res.responseData.responseData1 : this.tableDataArray = this.tableDataArray; 
          this.tableDatasize = res.responseData.responseData2.pageCount
          let data: [] = (flag == 'pdfFlag' || flag == 'excel') ? res.responseData.responseData1 : [];
          flag == 'pdfFlag' ? this.downloadPdf(data, 'pdfFlag') : flag == 'excel' ? this.downloadPdf(data, 'excel') : '';
        } else {
          this.ngxSpinner.hide();
          this.tableDataArray = [];
          this.tableDatasize = 0
        }
        this.setTableData();
      },
      error: ((err: any) => { (this.ngxSpinner.hide(), this.commonMethodS.checkEmptyData(err.statusText) == false) ? this.errors.handelError(err.statusCode) : this.commonMethodS.showPopup(err.statusText, 1); })
    });
  }

  setTableData() {
    this.highLightFlag = true;
    let displayedColumnsReadMode = ['srNo', this.languageFlag == 'English' ? 'category' : 'm_Category', this.languageFlag == 'English' ? 'subCategory' : 'm_SubCategory', this.languageFlag == 'English' ?'itemName':'m_ItemName', this.languageFlag == 'English' ?'description':'description'];
    this.displayedColumns = ['srNo', this.languageFlag == 'English' ? 'category' : 'm_Category', this.languageFlag == 'English' ? 'subCategory' : 'm_SubCategory', this.languageFlag == 'English' ?'itemName':'m_ItemName', this.languageFlag == 'English' ?'description':'description', 'action'];

    let tableData = {
      highlightedrow: true,
      pageNumber: this.pageNumber,
      img: 'docPath', blink: '', badge: '', isBlock: '', pagintion: this.tableDatasize > 10 ? true : false,
      displayedColumns: this.isWriteRight == true ? this.displayedColumns : displayedColumnsReadMode,
      tableData: this.tableDataArray,
      tableSize: this.tableDatasize,
      tableHeaders: this.languageFlag == 'English' ? this.displayedheaders : this.marathiDisplayedheaders,
      edit: true, delete: true,
    };
    this.highLightFlag ? tableData.highlightedrow = true : tableData.highlightedrow = false,
      this.apiService.tableData.next(tableData);
  }

  private marathiDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  convertToMarathiNumber(number: number): string {
    const englishNumberString = number.toString();
    let marathiNumberString = '';
    for (let i = 0; i < englishNumberString.length; i++) {
      const digit = parseInt(englishNumberString[i], 10);
      marathiNumberString += this.marathiDigits[digit];
    }
    return marathiNumberString;
  }

  downloadPdf(data?: any, flag?: string) {
    this.resultDownloadArr = [];
    data.find((ele: any, i: any) => {
      // let obj = {
      //   srNo: i + 1,
      //   category: ele.category,
      //   subCategory: ele.subCategory,
      //   itemName: ele.itemName,
      //   description: ele.description,
      // }

      let obj: any;
      if (flag == 'excel') {
        obj = {
          srNo: this.languageFlag == 'English' ? (i + 1) : this.convertToMarathiNumber(i + 1),
          category: this.languageFlag == 'English' ? ele.category : ele.m_Category,
          subCategory: this.languageFlag == 'English' ? ele.subCategory : ele.m_SubCategory,
          itemName: this.languageFlag == 'English' ? ele.itemName : ele.m_ItemName,
          description: this.languageFlag == 'English' ? ele.description : ele.description,
        }

      } else if (flag == 'pdfFlag') {
        obj = {
          srNo: i + 1,
          category: ele.category,
          subCategory: ele.subCategory,
          itemName: ele.itemName,
          description: ele.description,
        }
      }
      this.resultDownloadArr.push(obj);
    });

    if (this.resultDownloadArr?.length > 0) {
      let keyPDFHeader = ["Sr.No.", "Category", "Sub Category", "Item", "Description"];
      let MarathikeyPDFHeader = ['अनुक्रमांक', 'श्रेणी', 'उप श्रेणी', 'वस्तू', 'वर्णन'];
      let ValueData =
        this.resultDownloadArr.reduce(
          (acc: any, obj: any) => [...acc, Object.values(obj).map((value) => value)], []
        );

      let objData: any
      if (flag == 'excel') {
        objData = {
          'topHedingName':this.languageFlag == 'English' ? 'Item List':'वस्तू सूची',
          'createdDate':this.languageFlag == 'English'?'Created on:'+this.datepipe.transform(new Date(), 'yyyy-MM-dd, h:mm a') : 'रोजी तयार केले :'+this.datepipe.transform(new Date(), 'yyyy-MM-dd, h:mm a')
        }
      } else if (flag == 'pdfFlag') {
        objData = {
          'topHedingName': 'Item List',
          'createdDate': 'Created on:' + this.datepipe.transform(new Date(), 'yyyy-MM-dd, h:mm a')
        }
      }
      let headerKeySize = [7, 15, 20, 30, 40,]
      flag == 'pdfFlag' ? this.downloadFileService.downLoadPdf(keyPDFHeader, ValueData, objData) : this.downloadFileService.allGenerateExcel(this.languageFlag == 'English' ?keyPDFHeader:MarathikeyPDFHeader, ValueData, objData, headerKeySize)
    }
  }





  childTableCompInfo(obj: any) {
    switch (obj.label) {
      case 'Pagination':
        this.pageNumber = obj.pageNumber;
        this.getTableData();
        break;
      case 'Edit':
        this.addUpdateItem(obj);
        break;
      case 'Delete':
        this.globalDialogOpen(obj);
        break;
      case 'View':
        // this.openDetailsDialog(obj);
        break;
    }
  }

  getAllCategory() {
    this.categoryArr = [];
    this.masterService.GetAllAssetCategory(this.languageFlag).subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.categoryArr.push({ id: 0, category: "All category", m_Category: "सर्व श्रेणी" }, ...res.responseData);
          this.filterForm.controls['CategoryId'].setValue(0);
        } else {
          this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
          this.categoryArr = [];
        }
      },
      // error: ((err: any) => { this.errors.handelError(err.statusCode) })
    });
  }

  getAllSubCategory() {
    let catId = this.filterForm.value.CategoryId;
    this.subCategoryArr = [];
    this.masterService.GetAssetSubCateByCateId(catId, this.languageFlag).subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.subCategoryArr.push({ "id": 0, "subCategory": "All SubCategory", "m_SubCategory": "सर्व उपश्रेणी" }, ...res.responseData);
          this.filterForm.controls['SubCategoryId'].setValue(0);
        } else {
          this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
          this.subCategoryArr = [];
        }
      },
      // error: ((err: any) => { this.errors.handelError(err.statusCode) })
    });
  }

  addUpdateItem(obj?: any) {
    const dialogRef = this.dialog.open(AddItemComponent, {
      width: '500px',
      disableClose: true,
      autoFocus: false,
      data: obj

    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result == 'yes' && obj) {
        this.pageNumber = obj.pageNumber;
        this.getTableData();
      } else if (result == 'yes') {
        this.pageNumber = 1;
        this.getTableData();
      }
      this.highLightFlag = false;
      this.setTableData();
    });
  }

  globalDialogOpen(obj: any) {
    this.deleteObj = obj;
    let dialoObj = {
      img: 'assets/images/trash.gif',
      header: this.webService.languageFlag == 'EN' ? 'Delete' : 'हटवा',
      title: this.webService.languageFlag == 'EN' ? 'Do You Want To Delete Item?' : 'तुम्हाला वस्तू हटवायची आहे का?',
      cancelButton: this.webService.languageFlag == 'EN' ? 'Cancel' : 'रद्द करा',
      okButton: this.webService.languageFlag == 'EN' ? 'Ok' : 'ओके'
    }
    const deleteDialogRef = this.dialog.open(GlobalDialogComponent, {
      width: '320px',
      data: dialoObj,
      disableClose: true,
      autoFocus: false
    })
    deleteDialogRef.afterClosed().subscribe((result: any) => {
      if (result == 'yes') {
        this.deteleDialogOpen();
      }
      this.highLightFlag = false;

    })
  }

  deteleDialogOpen() {
    let deleteObj = {
      "id": this.deleteObj.id,
      "modifiedBy": 0,
      "modifiedDate": new Date(),
      "lan": "EN"
    }
    this.apiService.setHttp('DELETE', 'zp-satara/ItemMaster/DeleteItem', false, deleteObj, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.getTableData();
          this.commonMethods.showPopup(res.statusMessage, 0);
        } else {
          this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
        }
      },
      error: ((err: any) => { this.errors.handelError(err.statusCode) })
    });
  }

  clearForm() {
    this.filterForm.reset();
    this.getTableData();
  }

  clearDropdown(dropdown: string) {
    if (dropdown == 'CategoryId') {
      this.filterForm.controls['SubCategoryId'].setValue(0);
      this.filterForm.controls['textSearch'].setValue('');
      this.subCategoryArr = [];
    }
  }

}

