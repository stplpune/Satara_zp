import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddSubCategoryComponent } from './add-sub-category/add-sub-category.component';
import { ApiService } from 'src/app/core/services/api.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { FormControl } from '@angular/forms';
// import { GlobalDialogComponent } from 'src/app/shared/components/global-dialog/global-dialog.component';
// import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { WebStorageService } from 'src/app/core/services/web-storage.service';
import { ValidationService } from 'src/app/core/services/validation.service';
import { DownloadPdfExcelService } from 'src/app/core/services/download-pdf-excel.service';
import { DatePipe } from '@angular/common';
import { GlobalDialogComponent } from 'src/app/shared/components/global-dialog/global-dialog.component';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
@Component({
  selector: 'app-sub-category',
  templateUrl: './sub-category.component.html',
  styleUrls: ['./sub-category.component.scss']
})
export class SubCategoryComponent {
  viewStatus = 'Table';
  totalItem: any;
  textSearch = new FormControl();
  langTypeName: any;
  pageNumber: number = 1;
  tableresp: any;
  totalCount:any;
  resultDownloadArr = new Array();
  filterFlag: boolean = false;
  deleteObj:any;
  highLightFlag : boolean = true;
  // displayedheadersEnglish = ['Sr. No.', ' Category Name','Sub Category Name', 'Inactive/Active','Action'];
  // displayedheadersMarathi = ['अनुक्रमांक', 'श्रेणीचे नाव','उपवर्गाचे नाव',  'निष्क्रिय/सक्रिय', 'कृती'];
  displayedheadersEnglish = ['Sr. No.', ' Category Name','Sub Category Name','Action'];
  displayedheadersMarathi = ['अनुक्रमांक', 'श्रेणीचे नाव','उपवर्गाचे नाव', 'कृती'];
 
  constructor(public dialog: MatDialog,
    private apiService: ApiService,
    private errors: ErrorsService,
    private commonService: CommonMethodsService,
    private webStorage: WebStorageService,
    private excelpdfService:DownloadPdfExcelService,
    public validation:ValidationService,
    public datepipe : DatePipe) { }

  ngOnInit() {
    this.getTableData();
    this.webStorage.langNameOnChange.subscribe(lang => {
      this.langTypeName = lang;
      this.getTableTranslatedData();
    });
  }
  openDialog(data?: any) {
    data?'':this.textSearch.setValue('');
    this.filterFlag && data?'':(this.getTableData(),this.filterFlag=false);
    const dialogRef = this.dialog.open(AddSubCategoryComponent, {
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
        this.filterFlag ? '' : (this.textSearch.setValue(''), this.filterFlag = false);
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
    let formData = this.textSearch.value?.trim() || '';
    let str = 'TextSearch='+formData+  '&PageNo='+this.pageNumber+'&PageSize=10' ;
    let excel = 'TextSearch='+formData+  '&PageNo='+1+'&PageSize='+this.totalCount ;
    this.apiService.setHttp('GET', 'zp-satara/AssetSubCategory/GetAll?'+(status=='excel'?excel:str), false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          status != 'excel' ? this.tableresp = res.responseData.responseData1 : this.tableresp = this.tableresp;
          this.totalItem = res.responseData.responseData2.pageCount;
          this.totalCount = res.responseData.responseData2.pageCount;
          this.resultDownloadArr = [];
          let data: [] = res.responseData.responseData1;
          status == 'excel' ? this.pdfDownload(data) : '';
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
    // let displayedColumnsReadMode = ['srNo', 'Category Name', 'Sub Category', 'Status', 'Action'];
    let displayedColumns = ['srNo', 'category', 'subCategory', 'action'];
    let tableData = {
      pageNumber: this.pageNumber,
      img: '',
      blink: '',
      badge: '',
      // isBlock: 'status',
      pagintion:this.totalItem > 10 ? true : false,
      displayedColumns: displayedColumns,
      tableData: this.tableresp,
      tableSize: this.totalItem,
      // tableHeaders: displayedColumnsReadMode,
      tableHeaders: this.langTypeName == 'English' ? this.displayedheadersEnglish : this.displayedheadersMarathi,
    };
    // this.highLightFlag ? this.tableData.highlightedrow = true : this.tableData.highlightedrow = false,
    this.apiService.tableData.next(tableData);
  }

  clearFilterData() {
    this.textSearch.setValue('');
    this.pageNumber=1;
    this.getTableData();
  }

  pdfDownload(data:any) {
    data.map((ele: any, i: any)=>{
          let obj = {
            "Sr.No": i+1,
            "Category Name": ele.category,
            "Sub Category Name": ele.subCategory,
          }
          this.resultDownloadArr.push(obj);
        });
        let keyPDFHeader = ['Sr.No.', 'Category Name', 'Sub Category Name'];
              let ValueData =
                this.resultDownloadArr.reduce(
                  (acc: any, obj: any) => [...acc, Object.values(obj).map((value) => value)], []
                );// Value Name
                       
                let objData:any = {
                  'topHedingName': 'Sub Category List',
                  'createdDate':'Created on:'+this.datepipe.transform(new Date(), 'yyyy-MM-dd, h:mm a')
                }
               this.excelpdfService.downLoadPdf(keyPDFHeader, ValueData, objData);
  }

  // downloadPdf(data: any) {
  //   data.map((ele: any, i: any)=>{
  //     let obj = {
  //       "Sr.No": i+1,
  //       "Designation Name": ele.designationName,
  //       "Designation Level": ele.designationLevel,
  //     }
  //     this.resultDownloadArr.push(obj);
  //   });
  //   let keyPDFHeader = ['Sr.No.', 'Designation', 'Designation Level'];
  //       let ValueData =
  //         this.resultDownloadArr.reduce(
  //           (acc: any, obj: any) => [...acc, Object.values(obj).map((value) => value)], []
  //         );// Value Name
                 
  //         let objData:any = {
  //           'topHedingName': 'Designation List',
  //           'createdDate':'Created on:'+this.datepipe.transform(new Date(), 'yyyy-MM-dd, h:mm a')
  //         }
  //        this.downloadFileService.downLoadPdf(keyPDFHeader, ValueData, objData);
  // }

  // openBlockDialog(obj: any) {
  //   let userEng = obj.isBlock == false ? 'Active' : 'Inactive';
  //   let userMara = obj.isBlock == false ? 'ब्लॉक' : 'अनब्लॉक';
  //   let dialoObj = {
  //     header: this.langTypeName == 'English' ? userEng + ' Office User' : 'ऑफिस वापरकर्ता ' + userMara + ' करा',
  //     title: this.langTypeName == 'English' ? 'Do You Want To ' + userEng + ' The Selected Sub Category?' : 'तुम्ही निवडलेल्या ऑफिस वापरकर्त्याला ' + userMara + ' करू इच्छिता?',
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
  //     result == 'yes' ? this.getStatusData(obj) : this.getTableData();
  //     // this.highLightFlag=false;
  //     // this.languageChange();
  //   })
  // }


  // getStatusData(data: any) {
  //   console.log(data);
  //   let webdata = this.webStorage.createdByProps();
  //   let obj = {
  //     "id": data.id,
  //     "status": !data.status,
  //     "statusChangeBy": this.webStorage.getUserId(),
  //     "statusChangeDate": webdata.modifiedDate,
  //     "lan": this.webStorage.languageFlag
  //   }
  //   this.apiService.setHttp('put', 'zp-satara/AssetSubCategory/UpdateStatus', false, obj, false, 'baseUrl');
  //   this.apiService.getHttp().subscribe({
  //     next: (res: any) => {
  //       console.log(res);
  //       if (res.statusCode == "200") {
  //         this.commonService.snackBar(res.statusMessage, 0);
  //         // this.tableresp = res.responseData.responseData1;
  //       } else {
  //         this.commonService.snackBar(res.statusMessage, 1);
  //       }
  //     },
  //     error: ((err: any) => { this.errors.handelError(err) })
  //   });
  // }

  globalDialogOpen(obj: any) {
    this.deleteObj = obj;
    let dialoObj = {
      header: 'Delete',
      title: this.webStorage.languageFlag == 'EN' ? 'Do you want to Sub Category record?' : 'तुम्हाला उपवर्ग रेकॉर्ड हटवायचा आहे का?',
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
    
    this.apiService.setHttp('DELETE', 'zp-satara/AssetSubCategory/DeleteSubCategory', false, deleteObj, false, 'baseUrl');
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






