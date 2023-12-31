import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'src/app/core/services/api.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { FormBuilder, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
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
  categoryForm !:FormGroup;
  languageFlag !:string;
  editObj: any;
  editFlag = false;
  editId: any;
  viewStatus = 'Table';

  displayedheadersEnglish = ['Sr. No.', ' Category', 'Action'];
  displayedheadersMarathi = ['अनुक्रमांक', 'श्रेणींचे नाव', 'कृती'];
  @ViewChild('formDirective')
  private formDirective!: NgForm;
  search = new FormControl('');
  tableresp: any;
  totalItem: any;
  langTypeName: any;
  filterFlag: boolean = false;
  cardViewFlag: boolean = false;
  highLightFlag: boolean = true;
  totalCount: any;
  isWriteRight!: boolean;
  displayedColumns: any;
  tableData: any;
  resultDownloadArr = new Array();
  pageNumber: number = 1;
  deleteObj: any;
  constructor(public dialog: MatDialog,
    private apiService: ApiService,
    private errors: ErrorsService,
    private webStorage: WebStorageService,
    public validation: ValidationService,
    private excelpdfService: DownloadPdfExcelService,
    public datepipe: DatePipe,
    private commonService: CommonMethodsService,
    private fb : FormBuilder,
    public validators : ValidationService,
  ) { }

  ngOnInit() {
    this.getIsWriteFunction();
    this.getTableData();
    this.webStorage.langNameOnChange.subscribe(lang => {
      this.langTypeName = lang;
      this.getTableTranslatedData();
    });
    this.formData()
  }

  formData(){
    this.categoryForm = this.fb.group({
      category:['',[Validators.required,Validators.pattern(this.validators.name)]],
      M_category:['',[Validators.required, Validators.pattern('^[\u0900-\u0965 ]+$')]]
    })
  }


  getIsWriteFunction() {
    let print = this.webStorage?.getAllPageName().find((x: any) => {
      return x.pageURL == "category"
    });
    (print.writeRight === true) ? this.isWriteRight = true : this.isWriteRight = false;
  }

  get f() {
    return this.categoryForm.controls;
  }

  onSubmit() {
    if (this.categoryForm.invalid) {
      return;
    }else{
      let data = this.webStorage.createdByProps();
    let formData = this.categoryForm.value;
    let obj = {
      "createdBy": data.createdBy,
      "modifiedBy": data.modifiedBy,
      "createdDate": data.createdDate,
      "modifiedDate": data.modifiedDate,
      "isDeleted": data.isDeleted,
      "id":  this.editFlag?this.editId:0,
      "category": formData.category,
      "m_Category":formData.M_category,
      "lan": this.languageFlag
    }

    let method = this.editFlag ? 'PUT' : 'POST';
    let url = this.editFlag ? 'UpdateCategory' : 'AddCategory';
    this.apiService.setHttp(method, 'zp-satara/AssetCategory/'+url, false, obj, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.formDirective.resetForm();
          this.getTableData();
          this.commonService.showPopup(res.statusMessage, 0);
          this.editFlag = false;
          this.formData()
        } else {
          this.commonService.showPopup(res.statusMessage, 1);
        }

      },
      error: ((err: any) => { this.errors.handelError(err) })
    });
    } 
    
  }

  editData(data: any) {
    this.editFlag = true;
    this.editId = data.id;    
    this.f['category'].setValue(data?.category)
    this.f['M_category'].setValue(data?.m_Category)

  }

  // openDialog(data?: any) {
  //   const dialogRef = this.dialog.open(AddCategoryComponent, {
  //     width: '400px',
  //     data: data,
  //     disableClose: true,
  //     autoFocus: false
  //   });

  //   dialogRef.afterClosed().subscribe(result => {
  //     if (result == 'yes') {
  //       this.getTableData();
  //       this.pageNumber = this.pageNumber;
  //     } else if (result == 'yes') {
  //       this.getTableData();
  //       this.pageNumber = 1;
  //     }
  //     this.highLightFlag = false;
  //     this.getTableTranslatedData();
  //   });
  // }

  childCompInfo(obj: any) {
    switch (obj.label) {
      case 'Pagination':
        this.filterFlag ? '' : (this.search.setValue(''), this.filterFlag = false);
        this.pageNumber = obj.pageNumber;
        this.getTableData();
        break;
      case 'Edit':
        this.editData(obj);
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
    let formData = this.search.value?.trim() || '';
    let str = 'TextSearch=' + formData + '&PageNo=' + this.pageNumber + '&PageSize=10';
    let excel = 'TextSearch=' + formData + '&PageNo=' + 1 + '&PageSize=' + this.totalCount;

    this.apiService.setHttp('GET', 'zp-satara/AssetCategory/GetAll?' + ((status == 'excel' || status == 'pdfFlag' ? excel : str)), false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          status != 'excel' && status != 'pdfFlag' ? this.tableresp = res.responseData.responseData1 : this.tableresp = this.tableresp;
  
          this.totalItem = res.responseData.responseData2.pageCount;
          this.totalCount = res.responseData.responseData2.pageCount;

          this.resultDownloadArr = [];
  
          let data: [] = (status == 'pdfFlag' || status == 'excel') ? res.responseData.responseData1 : [];
          status == 'pdfFlag' ? this.pdfDownload(data,'pdfFlag') : status == 'excel' ? this.pdfDownload(data,'excel') :'';  
        } else {
          this.tableresp = [];
          this.totalItem = 0;
        }
        this.getTableTranslatedData();

      },
      error: ((err: any) => { this.errors.handelError(err) })
    });
  }

  getTableTranslatedData() {
    this.highLightFlag = true;
    let displayedColumnsReadMode = ['srNo', this.langTypeName == 'English' ? 'category' : 'm_Category'];
    let displayedColumns = ['srNo', this.langTypeName == 'English' ?'category': 'm_Category', 'action'];
    let tableData = {
      pageNumber: this.pageNumber,
      img: '',
      blink: '',
      badge: '',
      // isBlock: 'status',
      pagintion: this.totalItem > 10 ? true : false,
      // displayedColumns: displayedColumns,
      displayedColumns: this.isWriteRight === true ? displayedColumns : displayedColumnsReadMode, 
      tableData: this.tableresp,
      tableSize: this.totalItem,
      tableHeaders: this.langTypeName == 'English' ? this.displayedheadersEnglish : this.displayedheadersMarathi,
      edit: true, delete: true,
    };
    // this.highLightFlag ? this.tableData.highlightedrow = true : this.tableData.highlightedrow = false,
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

  pdfDownload(data?: any,flag?:string) {   
    this.resultDownloadArr=[];  
    data.find((ele: any, i: any) => {
      // "Category": flag == 'excel' ? this.langTypeName == 'English' ? ele.category : ele.m_Category : ele.category,
     
      let obj = {
            "Sr.No":this.langTypeName == 'English' || flag != 'excel' ? (i+1) : this.convertToMarathiNumber(i+1),
            "category":flag == 'excel' ?this.langTypeName == 'English' ? ele.category : ele.m_Category:ele.category,
          }
          
      // if(flag == 'excel'){
      //   let obj = {
      //     "Sr.No":this.langTypeName == 'English' ? (i+1) : this.convertToMarathiNumber(i+1),
      //     "category":this.langTypeName == 'English' ? ele.category : ele.m_Category,
      //   }
      //   this.resultDownloadArr.push(obj);
      // }else if( flag == 'pdfFlag'){
      //   let obj = {
      //     "Sr.No":i+1,
      //     "category": ele.category,
      //   }
      this.resultDownloadArr.push(obj);
      // }
    });

    if (this.resultDownloadArr?.length > 0) {
      let keyPDFHeader = ["Sr.No.", "Category"];
      let MarathikeyPDFHeader = ['अनुक्रमांक', 'श्रेणी']
      let ValueData =
        this.resultDownloadArr.reduce(
          (acc: any, obj: any) => [...acc, Object.values(obj).map((value) => value)], []
        );
        let objData :any
      //   if(flag=='excel'){
      //     objData= {
      //       'topHedingName':this.langTypeName == 'English'? 'Category List':'श्रेणी सूची',
      //       'createdDate': this.langTypeName == 'English'?'Created on:'+this.datepipe.transform(new Date(), 'yyyy-MM-dd, h:mm a') : 'रोजी तयार केले :'+this.datepipe.transform(new Date(), 'yyyy-MM-dd, h:mm a')
      //     }
      //   }else if(flag=='pdfFlag'){
      //    objData = {
      //     'topHedingName': 'Category List',
      //     'createdDate': 'Created on:' + this.datepipe.transform(new Date(), 'yyyy-MM-dd, h:mm a')
      //   }
      // }

      objData= {
        'topHedingName': flag == 'excel' ? this.langTypeName == 'English' ? 'Category List' : 'श्रेणी सूची' : 'Category List',
        'createdDate': (flag == 'excel' ? this.langTypeName == 'English' ? 'Created on:' : 'रोजी तयार केले :' : 'Created on:')+ this.datepipe.transform(new Date(), 'yyyy-MM-dd, h:mm a')
      }
        let headerKeySize = [7, 15, 20, 30, 40,]
        flag == 'pdfFlag' ? this.excelpdfService.downLoadPdf(keyPDFHeader, ValueData, objData) :this.excelpdfService.allGenerateExcel(this.langTypeName == 'English' ? keyPDFHeader : MarathikeyPDFHeader, ValueData, objData, headerKeySize)
    }
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

  clearFormData(){
    this.formDirective.resetForm();
    this.editFlag = false;
  }

  globalDialogOpen(obj: any) {
    this.deleteObj = obj;
    let dialoObj = {
      img: 'assets/images/trash.gif',
      header: this.webStorage.languageFlag == 'EN' ? 'Delete' : 'हटवा',
      title: this.webStorage.languageFlag == 'EN' ? 'Do You Want To Delete Category Record?' : 'तुम्हाला श्रेणी रेकॉर्ड हटवायचा आहे का?',
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
      this.highLightFlag = false;
    })
  }


  deteleDialogOpen() {
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
      error: ((err: any) => { this.errors.handelError(err.statusCode) })
    });
  }

}

