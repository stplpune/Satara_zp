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
import { GlobalDetailComponent } from 'src/app/shared/components/global-detail/global-detail.component';
@Component({
  selector: 'app-item-transfer',
  templateUrl: './outward-item.component.html',
  styleUrls: ['./outward-item.component.scss']
})
export class OutwardItemComponent {
  viewStatus = "Table";
  cardViewFlag: boolean = false;
  filterForm!: FormGroup;
  talukaArr = new Array();
  centerArr = new Array();
  villageArr = new Array();
  schoolArr = new Array();
  categoryresp = new Array();
  subcategoryresp = new Array();
  totalItem: any;
  totalCount: any;
  tableresp = new Array();
  itemresp = new Array();
  pageNumber: number = 1;
  filterFlag: boolean = false;
  highLightFlag: boolean = true;
  resultDownloadArr = new Array();
  tableData:any;
  displayedColumns = new Array();
  loginData = this.webStorage.getLoggedInLocalstorageData();
  langTypeName : any;
  get f(){return this.filterForm.controls}
  displayedheadersEnglish = ['Sr. No.', 'Category', 'Sub Category', 'Item', 'Unit', 'Sell Date', 'Sell Price', 'Assign To', 'Remark', 'Action'];
  displayedheadersMarathi = ['अनुक्रमांक', 'श्रेणी', 'उप श्रेणी', 'वस्तू', 'युनिट', 'विक्री दिनांक','विक्री किंमत', 'असाइन करा', 'शेरा',  'कृती'];

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
    this.getTableData();
    this.webStorage.langNameOnChange.subscribe(lang => {
      this.langTypeName = lang;
      this.setTableData();
    });   
    this.getTaluka();
    this.getCategory();
  }

  filterFormData() {
    this.filterForm = this.fb.group({
      // talukaId :[this.loginData.userTypeId > 2 ? this.loginData.talukaId : ''],
      // centerId:[this.loginData.userTypeId > 2 ? this.loginData.centerId : ''],
      // villageId:[this.loginData.userTypeId > 2 ? this.loginData.villageId : ''],
      // schoolId:[this.loginData.userTypeId > 2 ? this.loginData.schoolId : ''],   
      talukaId :[''],
      centerId:[''],
      villageId:[''],
      schoolId:[''],  
      CategoryId: [''],
      SubCategoryId: [''],
      ItemsId: [''],
      textSearch: ['']
    });
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

  getTaluka() {
    this.talukaArr = [];
    this.masterService.getAllTaluka('').subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.talukaArr.push({ "id": 0, "taluka": "All", "m_Taluka": "सर्व" }, ...res.responseData);
          this.filterForm?.value.talukaId ? this.getAllCenter() : '';
        } else {
          this.commonMethod.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethod.showPopup(res.statusMessage, 1);
          this.talukaArr = [];
        }
      }
    });
  }

  getAllCenter() {
    this.centerArr = [];
    // let id = this.filterForm.controls['talukaId'].value;
    let id = this.filterForm.value.talukaId
    if (id != 0) {
      this.masterService.getAllCenter('', id).subscribe({
        next: (res: any) => {
          if (res.statusCode == "200") {
            this.centerArr.push({ "id": 0, "center": "All", "m_Center": "सर्व" }, ...res.responseData);
            this.filterForm?.value.centerId ? this.getVillage():'';
          } else {
            this.commonMethod.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethod.showPopup(res.statusMessage, 1);
            this.centerArr = [];
          }
        }
      });
    }
  }

  getVillage() {
    this.villageArr = [];
    // let Cid = this.filterForm.controls['centerId'].value;
    let Cid = this.filterForm.value.centerId
    if (Cid != 0) {
      this.masterService.getAllVillage('', Cid).subscribe({
        next: (res: any) => {
          if (res.statusCode == 200) {
            this.villageArr.push({ "id": 0, "village": "All", "m_Village": "सर्व" }, ...res.responseData);
            this.filterForm?.value.villageId ? this.getAllSchools():'';
          } else {
            this.commonMethod.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethod.showPopup(res.statusMessage, 1);
            this.villageArr = [];
          }
        }
      });
    }
  }

  getAllSchools() {
    this.schoolArr = [];
    // let Tid = this.filterForm.controls['talukaId'].value;
    // let Cid = this.filterForm.controls['centerId'].value || 0;
    let Tid = this.filterForm.value.talukaId;
    let Cid = this.filterForm.value.centerId || 0;
    let Vid = 0;
    this.masterService.getAllSchoolByCriteria('', Tid, Vid, Cid).subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.schoolArr.push({ "id": 0, "schoolName": "All", "m_SchoolName": "सर्व" }, ...res.responseData);
          this.f['schoolId'].setValue(this.loginData.schoolId);
        } else {
          this.commonMethod.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethod.showPopup(res.statusMessage, 1);
          this.schoolArr = [];
        }
      }
    });
  }

  getCategory() {
    this.categoryresp = [];
    this.masterService.GetAllAssetCategory(this.webStorage.languageFlag).subscribe({
      next: ((res: any) => {
        if (res.statusCode == "200" && res.responseData.length) {
          this.categoryresp.push({ "id": 0, "category": "All", "m_Category": "सर्व" }, ...res.responseData);
        } else {
          this.categoryresp = [];
        }
      }),
      //  error: (error: any) => {
      //   this.errors.handelError(error.statusCode)
      // }
    })
  }

  getSubCategory() {
  let catId = this.filterForm.value.CategoryId
    this.masterService.GetAssetSubCateByCateId(catId, '').subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.subcategoryresp.push({ "id": 0, "subCategory": "All", "m_SubCategory": "सर्व" }, ...res.responseData);
        } else {
          this.subcategoryresp = [];
          this.commonMethod.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethod.showPopup(res.statusMessage, 1);
          this.subcategoryresp = [];
        }
      }
    });
  }

  getItem() {
    let subCatId = this.filterForm.value.SubCategoryId
    this.apiService.setHttp('GET', 'zp-satara/master/GetAllItem?SubCategoryId=' + subCatId + '&flag_lang=e', false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.itemresp.push({ "id": 0, "itemName": "All", "m_ItemName": "सर्व" }, ...res.responseData);
        } else {
          this.tableresp = [];
        }
      },
      // error: ((err: any) => { this.errors.handelError(err) })
    });
  }

  childCompInfo(obj: any) {
    switch (obj.label) {
      case 'Pagination':
        // this.filterFlag ? '' : (formData.textSearch.setValue(''), this.filterFlag = false);
        this.pageNumber = obj.pageNumber;
        this.getTableData();
        break;
      case 'Edit':
        this.openDialog(obj);
        break;
      case 'Delete':
        this.globalDialogOpen(obj);
        break;
      case 'View':
        this.openDetailsDialog(obj);
        break;
    }
  }

  openDetailsDialog(obj: any) {

    console.log(obj);
    // return;
    var data = {     
      headerImage: '',
      // header: '',
      // subheader: '',
      labelHeader: '',
      labelKey: '',
      Obj: obj,
      chart: false,
      multipleImage: true,
      pdf:true
    }
    const viewDialogRef = this.dialog.open(GlobalDetailComponent, {
      width: '900px',
      data: data,
      disableClose: true,
      autoFocus: false
    });
    viewDialogRef.afterClosed().subscribe((result: any) => {
      if (result == 'yes') {
        // this.getTableData();
      }
      this.highLightFlag=false;
      // this.languageChange();
    });
  }
  getTableData(status?: any) {
    status == 'filter' ? (this.filterFlag = true, (this.pageNumber = 1)) : '';
    let formData = this.filterForm.value;
    // let obj = {
    //   "SchoolId" : formData.schoolId || 0,
    //   "CategoryId": formData.CategoryId || 0,
    //   "SubCategoryId": formData.SubCategoryId || 0,
    //   "ItemsId": formData.ItemsId || 0,      
    //   "textSearch": formData.textSearch || '',
    // }
    // SchoolId=0&CategoryId=0&SubCategoryId=0&ItemId=0&DistrictId=0&CenterId=0&TalukaId=0&VillageId=0&pageno=1&pagesize=10&TextSearch=0&lan=0
    let str = `SchoolId=${formData?.schoolId || 0}&CategoryId=${formData?.CategoryId || 0}&SubCategoryId=${formData?.SubCategoryId || 0}&ItemId=${formData?.ItemsId || 0}&DistrictId=1&CenterId=${formData?.centerId || 0}&TalukaId=${formData?.talukaId || 0}&VillageId=${formData?.villageId || 0}&pageno=${ this.pageNumber}&pagesize=10&TextSearch=${formData?.textSearch || '' }&lan=${this.webStorage.languageFlag}`
    // let str = 'SchoolId='+formData?.schoolId || 0 +'&CategoryId=' + formData?.CategoryId || 0 + '&SubCategoryId=' + formData?.SubCategoryId || 0 + '&ItemId=' + formData?.ItemsId || 0+ '&pageno=' + this.pageNumber + '&pagesize=10&TextSearch=' + formData?.textSearch || '' + '&lan=' + this.webStorage.languageFlag
    let excel = `SchoolId=${formData?.schoolId || 0}&CategoryId=${formData?.CategoryId || 0}&SubCategoryId=${formData?.SubCategoryId || 0}&ItemId=${formData?.ItemsId || 0}&pageno=1&pagesize=${this.totalItem *10}&TextSearch=${formData?.textSearch || '' }&lan=${this.webStorage.languageFlag}`

    this.apiService.setHttp('GET', 'zp-satara/Outward/GetAllOutward?' + (status == 'excel' ? excel : str ), false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
      
        if (res.statusCode == "200") {
          status != 'excel' ? this.tableresp = res.responseData.responseData1 : this.tableresp = this.tableresp;
       
          // this.tableresp = res.responseData.responseData1 ;
          this.totalItem = res.responseData.responseData2.pageCount;
          // this.totalCount = res.responseData.responseData2.pageCount;
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
    this.displayedColumns = ['srNo', this.langTypeName == 'English' ? 'category' : 'm_Category', this.langTypeName == 'English' ? 'subCategory' : 'm_SubCategory', this.langTypeName == 'English' ? 'itemName' : 'm_Item', 'quantity', 'purchase_Sales_Date','price', 'outwardTo', 'remark',  'action'];
    this.tableData  = {
      pageNumber: this.pageNumber,
      img: 'photo',
      blink: '',
      badge: '',
      date: 'purchase_Sales_Date',
      pagintion: this.totalItem > 10 ? true : false,
      displayedColumns: this.displayedColumns,
      tableData: this.tableresp,
      tableSize: this.totalItem,
      tableHeaders: this.langTypeName == 'English' ? this.displayedheadersEnglish : this.displayedheadersMarathi,
    };
    this.highLightFlag ? this.tableData .highlightedrow = true : this.tableData .highlightedrow = false,
    this.apiService.tableData.next(this.tableData );
  }

  onChangeDropD(label: string) {
    switch (label) {
      case 'taluka':
        this.filterForm.controls['centerId']?.setValue(0);
        this.filterForm.controls['villageId']?.setValue(0);       
        this.filterForm.controls['categoryId']?.setValue(0);
        this.filterForm.controls['subCategoryId']?.setValue(0);
        this.filterForm.controls['itemsId']?.setValue(0);
        this.villageArr = [];
        this.categoryresp = [];
        this.subcategoryresp = [];
        this.itemresp = [];
        this.schoolArr = [];
        break;
      case 'center':
        this.filterForm.controls['villageId']?.setValue(0);
        this.filterForm.controls['categoryId']?.setValue(0);
        this.filterForm.controls['subCategoryId']?.setValue(0);
        this.filterForm.controls['itemsId']?.setValue(0);
        this.categoryresp = [];
        this.subcategoryresp = [];
        this.itemresp = [];
        this.schoolArr = [];
        break;
      case 'village':
        this.filterForm.controls['categoryId']?.setValue(0);
        this.filterForm.controls['subCategoryId']?.setValue(0);
        this.filterForm.controls['itemsId']?.setValue(0);
        this.filterForm.controls['schoolId']?.setValue(0);
        this.categoryresp = [];
        this.subcategoryresp = [];
        this.itemresp = [];
        break;
      case 'school':
        this.filterForm.controls['categoryId']?.setValue(0);
        this.filterForm.controls['subCategoryId']?.setValue(0);
        this.filterForm.controls['itemsId']?.setValue(0);
        this.subcategoryresp = [];
        this.itemresp = [];
        break;
      case 'category':
        this.itemresp = [];
        this.filterForm.controls['subCategoryId']?.setValue(0);
        this.filterForm.controls['itemsId']?.setValue(0);
        break;
      case 'subCategory':
        this.filterForm.controls['itemsId']?.setValue(0);
        break;
    }
  }

  clearFilterData() {
    // this.f['talukaId']?.setValue(0);
    // this.f['centerId']?.setValue(0);
    // this.f['villageId']?.setValue(0);      
    // this.f['schoolId']?.setValue(0);   
    // this.f['categoryId']?.setValue(0);
    // this.f['subCategoryId']?.setValue(0);
    // this.f['itemsId']?.setValue(0);
    // this.centerArr = [];
    // this.villageArr = [];
    // this.categoryresp = [];
    // this.schoolArr = [];
    // this.itemresp = [];
    // this.subcategoryresp = [];
    this.filterForm.reset();
    this.pageNumber = 1;
    this.getTableData();
  }

  globalDialogOpen(obj:any){
    let dialoObj = {
      header: 'Delete',
      title: this.webStorage.languageFlag == 'EN' ? 'Do you want to delete Outward Item?' : 'तुम्हाला बाह्य वस्तू हटवायची आहे का?',
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
    let keyPDFHeader = ['Sr.No.', 'Category', 'Sub Category','Items'];
    let ValueData =
      this.resultDownloadArr.reduce(
        (acc: any, obj: any) => [...acc, Object.values(obj).map((value) => value)], []
      );

    let objData: any = {
      'topHedingName': 'Outward Itmes List',
      'createdDate': 'Created on:' + this.datepipe.transform(new Date(), 'yyyy-MM-dd, h:mm a')
    }
    this.excelpdfService.downLoadPdf(keyPDFHeader, ValueData, objData);
  }
}

