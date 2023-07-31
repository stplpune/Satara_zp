import { Component } from '@angular/core';
import { AddCategoryComponent } from './add-category/add-category.component';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'src/app/core/services/api.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { FormControl } from '@angular/forms';
// import { GlobalDialogComponent } from 'src/app/shared/components/global-dialog/global-dialog.component';
import { WebStorageService } from 'src/app/core/services/web-storage.service';
// import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { ValidationService } from 'src/app/core/services/validation.service';
import { DownloadPdfExcelService } from 'src/app/core/services/download-pdf-excel.service';
import { DatePipe } from '@angular/common';
import { GlobalDialogComponent } from 'src/app/shared/components/global-dialog/global-dialog.component';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent {
  viewStatus = 'Table';
  // displayedheadersEnglish = ['Sr. No.', ' Category Name', 'Inactive/Active','Action'];
  // displayedheadersMarathi = ['अनुक्रमांक', 'श्रेणीचे नाव',  'निष्क्रिय/सक्रिय', 'कृती'];

  displayedheadersEnglish = ['Sr. No.', ' Category Name', 'Action'];
  displayedheadersMarathi = ['अनुक्रमांक', 'श्रेणीचे नाव', 'कृती'];
  
  search = new FormControl('');
  tableresp: any;
  totalItem: any;
  langTypeName: any;
  filterFlag:boolean=false;
  cardViewFlag: boolean = false;
  highLightFlag: boolean =true;
  totalCount:any;
  isWriteRight!: boolean;
  displayedColumns :any;
  tableData: any;
  resultDownloadArr = new Array();
  pageNumber: number = 1;
  deleteObj :any;
  constructor(public dialog: MatDialog,
    private apiService: ApiService,
    private errors: ErrorsService,
    private webStorage: WebStorageService,
    public validation:ValidationService,
    private excelpdfService:DownloadPdfExcelService,
    public datepipe : DatePipe,
    private commonService:CommonMethodsService
    ) { }

  ngOnInit() {
    // this.getIsWriteFunction()
    this.getTableData();
    this.webStorage.langNameOnChange.subscribe(lang => {
      this.langTypeName = lang;
      
      
      this.getTableTranslatedData();
    });
    
  }


  // getIsWriteFunction(){
  //   console.log(this.webStorage?.getAllPageName());
    
  //   let print = this.webStorage?.getAllPageName().find((x: any) => {
  //     console.log("x",x);
      
  //     return x.pageURL == "category"
  //    });
  //    (print.writeRight === true) ?  this.isWriteRight = true : this.isWriteRight = false

  //    console.log(print);
     
  //     }

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
      this.highLightFlag=false;
      this.getTableTranslatedData();
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
        // this.openBlockDialog(obj);
        break;
      case 'Delete':
        this.globalDialogOpen(obj);
        break;
    }
  }

  getTableData(status?:any) {
    status == 'filter' ? (this.filterFlag = true, (this.pageNumber = 1)) : '';
    let formData = this.search.value?.trim() || '';
    let str = 'TextSearch='+formData+'&PageNo='+this.pageNumber+'&PageSize=10';
    let excel = 'TextSearch='+formData+'&PageNo='+1+'&PageSize='+this.totalCount ;

    this.apiService.setHttp('GET', 'zp-satara/AssetCategory/GetAll?'+(status=='excel'?excel:str), false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        console.log(res);
        if (res.statusCode == "200") {
          status != 'excel' ? this.tableresp = res.responseData.responseData1 : this.tableresp = this.tableresp;
          // this.tableresp = res.responseData.responseData1;
          this.totalItem = res.responseData.responseData2.pageCount;
          this.totalCount = res.responseData.responseData2.pageCount;
          this.resultDownloadArr = [];
          let data: [] = res.responseData.responseData1;
          status == 'excel' ? this.pdfDownload(data) : '';
        } else {
          this.tableresp = [];
          this.totalItem=0;
        }
        this.getTableTranslatedData();
        
      },
      error: ((err: any) => { this.errors.handelError(err) })
    });
  }

  getTableTranslatedData() {
    this.highLightFlag=true;
    // let displayedColumnsReadMode = ['srNo', 'Category Name', 'Inactive/Active', 'Action'];
    let displayedColumns = ['srNo', 'category', 'action'];
    let tableData = {
      pageNumber: this.pageNumber,
      img: '',
      blink: '',
      badge: '',
      // isBlock: 'status',
      pagintion: this.totalItem > 10 ? true : false,
      displayedColumns: displayedColumns,
      // displayedColumns: this.isWriteRight === true ?displayedColumns : displayedColumnsReadMode, 
      tableData: this.tableresp,
      tableSize: this.totalItem,
      // tableHeaders: displayedColumnsReadMode,
      tableHeaders: this.langTypeName == 'English' ? this.displayedheadersEnglish : this.displayedheadersMarathi,
    };
    // this.highLightFlag ? this.tableData.highlightedrow = true : this.tableData.highlightedrow = false,
    this.apiService.tableData.next(tableData);
  }

  pdfDownload(data:any) {
    console.log(data);
    
    data.map((ele: any, i: any)=>{
          let obj = {
            "Sr.No": i+1,
            "Category Name": ele.category,
          }
          this.resultDownloadArr.push(obj);
        });
        let keyPDFHeader = ['Sr.No.', 'Category Name'];
              let ValueData =
                this.resultDownloadArr.reduce(
                  (acc: any, obj: any) => [...acc, Object.values(obj).map((value) => value)], []
                );// Value Name
                       
                let objData:any = {
                  'topHedingName': 'Category List',
                  'createdDate':'Created on:'+this.datepipe.transform(new Date(), 'yyyy-MM-dd, h:mm a')
                }
               this.excelpdfService.downLoadPdf(keyPDFHeader, ValueData, objData);
  }

  // openBlockDialog(obj: any) {
  //   let userEng = obj.isBlock == false ?'Active' : 'Inactive';
  //   let userMara = obj.isBlock == false ?'सक्रिय' : 'निष्क्रिय';
  //   let dialoObj = {
  //     header: this.langTypeName == 'English' ? userEng+' Office User' : 'ऑफिस वापरकर्ता '+userMara+' करा',
  //     title: this.langTypeName == 'English' ? 'Do You Want To '+userEng+' The Selected Category?' : 'तुम्ही निवडलेल्या श्रेणीचे नाव '+userMara+' करू इच्छिता?',
  //     cancelButton: this.langTypeName == 'English' ? 'Cancel' : 'रद्द करा',
  //     okButton: this.langTypeName == 'English' ? 'Ok' : 'ओके'
  //   }
  //   const deleteDialogRef = this.dialog.open(GlobalDialogComponent, {
  //     width: '320px',
  //     data: dialoObj,
  //     disableClose: true,
  //     autoFocus: false
  //   })
  //   deleteDialogRef.afterClosed().subscribe((result: any) => {
  //     result == 'yes' ? this.getStatus(obj) : this.getTableData();
  //     this.highLightFlag=false;
  //     this.getTableTranslatedData();
  //   })
  // }

  // getStatus(data: any) {
  //   let webdata = this.webStorage.createdByProps();
  //   let obj = {
  //     "id": data.id,
  //     "status": !data.status,
  //     "statusChangeBy": this.webStorage.getUserId(),
  //     "statusChangeDate": webdata.modifiedDate,
  //     "lan": this.webStorage.languageFlag
  //   }
   
    
  //   this.apiService.setHttp('put', 'zp-satara/AssetCategory/UpdateStatus', false, obj, false, 'baseUrl');
  //   this.apiService.getHttp().subscribe({
  //     next: (res: any) => {
  //       if (res.statusCode == "200") {
  //         this.commonService.snackBar(res.statusMessage, 0);
  //       } else {
  //         this.commonService.snackBar(res.statusMessage, 1);
  //       }
  //     },
  //     error: ((err: any) => { this.errors.handelError(err) })
  //   });
  // }

  clearFilterData() {
    this.search.setValue('');
    this.pageNumber = 1;
    this.getTableData();
  }

  
  // selectGrid(label: string) {
  //   this.viewStatus=label;
  //   if (label == 'Table') {
  //     this.cardViewFlag = false;
  //     this.pageNumber = 1;
  //   } else if (label == 'Card') {
  //     this.cardViewFlag = true;
  //     this.pageNumber = 1;
  //   }
  //   this.getTableData();
  // }

  // childGridCompInfo(obj: any) {
  //   switch (obj.label) {
  //     case 'Pagination':
  //       this.pageNumber = obj.pageNumber;
  //       this.getTableData();
  //       break;
  //     case 'Edit':
  //       this.openDialog(obj);
  //       break;
     
  //     case 'Block':
  //       this.openBlockDialog(obj);
  //   }
  // }


  globalDialogOpen(obj: any) {
    this.deleteObj = obj;
    let dialoObj = {
      header: this.webStorage.languageFlag == 'EN'  ? 'Delete' : 'हटवा',
      title: this.webStorage.languageFlag == 'EN' ? 'Do you want to delete Category record?' : 'तुम्हाला श्रेणी रेकॉर्ड हटवायचा आहे का?',
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
        this.deteleDialogOpen();
      }
      this.highLightFlag=false;
      
    })
  }


  deteleDialogOpen(){
    let deleteObj = {
      "id": this.deleteObj.id,
      "deletedBy": 0,
      "modifiedDate": new Date(),
      "lan": "EN"
    }
    
    this.apiService.setHttp('DELETE', 'zp-satara/AssetCategory/DeleteCategory', false, deleteObj, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.getTableData();
          this.commonService.showPopup(res.statusMessage, 0);
        } else {     
          this.commonService.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonService.showPopup(res.statusMessage, 1);
        }
      },
      error: ((err: any) => {  this.errors.handelError(err.statusCode) })
    });
  }

}

