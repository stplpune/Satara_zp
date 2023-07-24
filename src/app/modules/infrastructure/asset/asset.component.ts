import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddAssetComponent } from './add-asset/add-asset.component';
import { WebStorageService } from 'src/app/core/services/web-storage.service';
import { ApiService } from 'src/app/core/services/api.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MasterService } from 'src/app/core/services/master.service';

@Component({
  selector: 'app-asset',
  templateUrl: './asset.component.html',
  styleUrls: ['./asset.component.scss']
})
export class AssetComponent {
  viewStatus='Table';
  displayedColumns = new Array();
  languageFlag!: string;
  pageNumber: number = 1;
  tableDataArray = new Array();
  tableDatasize!: Number;
  tableData: any;
  totalCount: number = 0;
  displayedheaders = ['Sr.No.','Category', 'SubCategory', 'Asset Type', 'Quantity', 'Description','Date', 'Added by', 'Action'];
  displayedheadersMarathi = ['अनुक्रमांक', 'प्रकार', 'उपप्रकार', 'मालमत्ता प्रकार', 'प्रमाण','वर्णन', 'तारीख','तयार करणारा' , 'कृती'];
  highLightFlag: boolean =true;
  resultDownloadArr = new Array();
  filterForm!: FormGroup;
  categoryArr= new Array();
  subCategoryArr = new Array();
  assetTypeArr= new Array();
  isWriteRight!: boolean;
  


  constructor(public dialog: MatDialog,
              private webService: WebStorageService,
              private apiService: ApiService,
              private errors: ErrorsService,
              private commonMethods: CommonMethodsService,
              private fb: FormBuilder,
              private masterService: MasterService

              ) {}

  ngOnInit(){
    this.getAccessFunction();
    this.webService.langNameOnChange.subscribe(lang => {
      this.languageFlag = lang;
      this.setTableData();
    });
    this.getCategoryDrop();
    this.filterFormData()
    this.getTableData();   

  }
  getAccessFunction(){
    let print = this.webService?.getAllPageName().find((x: any) => {
      return x.pageURL == "designation-registration"
     });
     (print.writeRight === true) ?  this.isWriteRight = true : this.isWriteRight = false

  }

  filterFormData(){
    this.filterForm = this.fb.group({
      categoryId: [0],
      subCategoryId: [0],
      assetTypeId: [0],
      textArea: ['']
    })
  }

  getCategoryDrop(){
    this.categoryArr = [];
    this.masterService.GetAllAssetCategory('').subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.categoryArr.push({ "id": 0, "category": "All", "m_Category": "सर्व" }, ...res.responseData);
          this.filterForm.controls['categoryId'].setValue(0);         
        } else {
          this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
          this.categoryArr = [];
        }
      }
    });

  }

  getSubCategoryDrop(){
    this.subCategoryArr = [];
    this.masterService.GetAssetSubCateByCateId(this.filterForm.value.categoryId,'').subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.subCategoryArr.push({ "id": 0, "subCategory": "All", "m_SubCategory": "सर्व" }, ...res.responseData);
          this.filterForm.controls['subCategoryId'].setValue(0);         
        } else {
          this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
          this.subCategoryArr = [];
        }
      }
    });

  }

  getAssetTypeDrop(){
    this.assetTypeArr = [];
    this.masterService.GetAllAssetType(this.filterForm.value.subCategoryId, '').subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.assetTypeArr.push({ "id": 0, "category": "All", "m_category": "सर्व" }, ...res.responseData);
          this.filterForm.controls['assetTypeId'].setValue(0);         
        } else {
          this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
          this.assetTypeArr = [];
        }
      }
    });

  }

  getTableData(flag?: string){
    let formData = this.filterForm.value;
    let str = `CategoryId=${formData?.categoryId}&SubCategoryId=${formData?.subCategoryId}&TypeId=${formData?.assetTypeId}&TextSearch=${formData?.textArea}&PageNo=${this.pageNumber}&PageSize=10&lan=''`
    let reportStr = `CategoryId=${formData?.categoryId}&SubCategoryId=${formData?.subCategoryId}&TypeId=${formData?.assetTypeId}&TextSearch=${formData?.textArea}&PageNo=${1}&RowCount=0`;
    this.pageNumber =   flag == 'filter'? 1 :this.pageNumber;
    this.apiService.setHttp('GET', 'zp-satara/Asset/GetAll?' + (flag == 'pdfFlag' ? reportStr : str), false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          flag != 'pdfFlag' ? this.tableDataArray = res.responseData.responseData1 : this.tableDataArray = this.tableDataArray;
          this.tableDatasize = res.responseData.responseData2.pageCount;          
          this.totalCount = res.responseData.responseData2.pageCount;
          this.resultDownloadArr = [];
          let data: [] = res.responseData.responseData1;
          flag == 'pdfFlag' ? this.downloadPdf(data) : '';
        } else {
          this.tableDataArray = [];
          this.tableDatasize = 0;
          this.tableDatasize == 0 && flag == 'pdfFlag' ? this.commonMethods.showPopup('No Record Found', 1) : '';
        }
        this.setTableData();
      },
      error: ((err: any) => { this.errors.handelError(err) })
    });

  }

  setTableData(){
    this.highLightFlag=true;
  let displayedColumnsReadMode = ['srNo', this.languageFlag == 'English' ? 'category' : 'm_Category', this.languageFlag == 'English' ?'subCategory':'m_SubCategory', this.languageFlag == 'English' ?'type':'m_Type', 'quantity' ,'description','date','addedBy'];
  this.displayedColumns = ['srNo', this.languageFlag == 'English' ? 'category' : 'm_Category', this.languageFlag == 'English' ?'subCategory':'m_SubCategory', this.languageFlag == 'English' ?'type':'m_Type', 'quantity' ,'description','date','addedBy', 'action'];
    this.tableData = {
      pageNumber: this.pageNumber,
      img: '', blink: '', badge: '', isBlock: '', pagintion: true,
      displayedColumns: this.isWriteRight === true ? this.displayedColumns : displayedColumnsReadMode, 
      tableData: this.tableDataArray,
      tableSize: this.tableDatasize,
      tableHeaders: this.languageFlag == 'English' ? this.displayedheaders : this.displayedheadersMarathi,
    };
    this.highLightFlag?this.tableData.highlightedrow=true:this.tableData.highlightedrow=false,
  this.apiService.tableData.next(this.tableData);
  }

  downloadPdf(data: any){
    console.log(data);
    
  }

  openDialog() {
    const dialogRef = this.dialog.open(AddAssetComponent,{
      width: '600px',
      disableClose: true,
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
      if(result == 'Yes'){
      this.getTableData();
      }
    });
  }

  clearDrop(flag?: string){
    switch(flag){
      case 'category':
        this.filterForm.controls['subCategoryId'].setValue('');
        this.filterForm.controls['assetTypeId'].setValue('');
        break;
        case 'subCategory':
          this.filterForm.controls['assetTypeId'].setValue('')
    }
  }

  childCompInfo(obj: any) {    
    switch (obj.label) {
      case 'Pagination':
        this.pageNumber = obj.pageNumber;       
        this.getTableData();
        break;
      case 'Edit':        
        this.addUpdateAsset(obj);

        break;
     
    }
  }

  addUpdateAsset(obj?:any){
    const dialogRef = this.dialog.open(AddAssetComponent, {
      width: '420px',
      data: obj,
      disableClose: true,
      autoFocus: false
    })  
     dialogRef.afterClosed().subscribe((result: any) => {
     
      if(result == 'Yes' && obj){     
        // this.clearForm();
        this.getTableData();
        this.pageNumber = this.pageNumber;
      }
      else if(result == 'Yes' ){
        this.getTableData();
        // this.clearForm();
        this.pageNumber = 1 ;   
      } 
      this.highLightFlag=false; 
      this.setTableData();  
    });
  }

  clearForm() {
    this.filterFormData();
    this.getTableData();
  }



}

