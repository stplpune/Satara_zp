import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, NgForm, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { DownloadPdfExcelService } from 'src/app/core/services/download-pdf-excel.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { WebStorageService } from 'src/app/core/services/web-storage.service';
import { GlobalDialogComponent } from 'src/app/shared/components/global-dialog/global-dialog.component';
// import { AddUpdateDesignationMasterComponent } from './add-update-designation-master/add-update-designation-master.component';
import { ValidationService } from 'src/app/core/services/validation.service';
import { MasterService } from 'src/app/core/services/master.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-designation-master',
  templateUrl: './designation-master.component.html',
  styleUrls: ['./designation-master.component.scss']
})
export class DesignationMasterComponent implements OnInit {
  DesiganationLevelData: any;
  editFlag: any;
  pageNumber: number = 1;
  searchContent = new FormControl('');
  DesiganationTypeArray: any;
  resultDownloadArr = new Array(); tableData: any;
  tableDataArray = new Array();
  tableDatasize!: Number;
  displayedColumns = new Array();
  displayedheaders = ['Sr.No.', 'Designation', 'Designation Level', 'Action'];
  displayedheadersMarathi = ['अनुक्रमांक', 'पदनाम', 'पदनाम स्तर', 'कृती',];
  langTypeName: any;
  totalCount: number = 0;
  isWriteRight!: boolean;
  highLightFlag: boolean = true;
  designationForm: any;
  formDisabled: boolean = false;
  editId:any;
  // service: any;
  dialogRef: any;
  editData: any;
  obj = { id: 0, designationType: 'Other', m_DesignationType: 'इतर' };
  @ViewChild('formDirective')
  private formDirective!: NgForm;
  constructor(
    private dialog: MatDialog,
    private apiService: ApiService,
    private errors: ErrorsService,
    private commonMethod: CommonMethodsService,
    public webStorage: WebStorageService,
    private errorHandler: ErrorsService,
    private downloadFileService: DownloadPdfExcelService,
    public datepipe: DatePipe,
    public validation: ValidationService,
    private masterService: MasterService,
    private ngxSpinner : NgxSpinnerService,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.formData();
    this.getDesiganationLevel();
    this.getIsWriteFunction();
    this.getTableData();
    this.webStorage.langNameOnChange.subscribe(lang => {
      this.langTypeName = lang;
      this.getTableTranslatedData();
    });
  }

  //#region ----------------------------------Desiganation-Master Dropdown ------------------------------- //
  getDesiganationLevel() {
    let lan = '';
    this.masterService.GetAllDesignationLevel(lan).subscribe({
      next: ((res: any) => {
        if (res.statusCode == '200' && res.responseData.length) {
          this.DesiganationLevelData = res.responseData;
          this.editFlag ? ((this.designationForm.controls['designationLevelId'].setValue(this.editData.designationLevelId))) : '';
        }
      }), error: (error: any) => {
        this.commonMethod.checkEmptyData(error.statusText) == false ? this.errorHandler.handelError(error.statusCode) : this.commonMethod.showPopup(error.statusText, 1);
      }
    })
  }


  getIsWriteFunction() {
    let print = this.webStorage?.getAllPageName().find((x: any) => {
      return x.pageURL == "designation-registration"
    });
    (print.writeRight === true) ? this.isWriteRight = true : this.isWriteRight = false
  }
  //#region ------------------------------------- Designation-Master Dropdown ------------------------------- //

  getTableTranslatedData() {
    this.highLightFlag = true;
    let displayedColumnsReadMode = ['srNo', this.langTypeName == 'English' ? 'designationName' : 'm_DesignationType', this.langTypeName == 'English' ? 'designationLevel' : 'm_DesignationLevel'];
    this.displayedColumns = ['srNo', this.langTypeName == 'English' ? 'designationName' : 'm_DesignationType', this.langTypeName == 'English' ? 'designationLevel' : 'm_DesignationLevel', 'action'];
    this.tableData = {
      pageNumber: this.pageNumber,
      img: '', blink: '', badge: '', isBlock: '', pagintion: true,
      displayedColumns: this.isWriteRight === true ? this.displayedColumns : displayedColumnsReadMode,
      tableData: this.tableDataArray,
      tableSize: this.tableDatasize,
      tableHeaders: this.langTypeName == 'English' ? this.displayedheaders : this.displayedheadersMarathi,
      edit: true
    };
    this.highLightFlag ? this.tableData.highlightedrow = true : this.tableData.highlightedrow = false,
      this.apiService.tableData.next(this.tableData);
  }


  //#endregion ------------------------------------ End Designation-Master Dropdown --------------------------//

  // onPagintion(pageNo: number) {
  //   this.pageNumber = pageNo;
  //   this.getTableData()
  // }

  // filterData(){
  //   if(this.searchContent.value){
  //     this.getTableData('filter');
  //     this.pageNumber = 1;
  //   }
  // }
  //#region ------------------------------------- Designation-Master Table-Data ------------------------------- //
  getTableData(flag?: string) {
    this.pageNumber = flag == 'filter' ? 1 : this.pageNumber;
    let str = `pageno=${this.pageNumber}&pagesize=10&textSearch=${this.searchContent.value ? this.searchContent.value : ''}&lan=${this.webStorage.languageFlag}`;
    let reportStr = `pageno=${this.pageNumber}&pagesize=${this.totalCount * 10}&textSearch=${this.searchContent.value ? this.searchContent.value : ''}&lan=${this.webStorage.languageFlag}`;
    this.apiService.setHttp('GET', 'zp-satara/register-designation/GetAllByCriteria?' + ((flag == 'pdfFlag' || flag == 'excel') ? reportStr : str), false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({

      next: (res: any) => {
        if (res.statusCode == "200") {
          (flag != 'pdfFlag' && flag != 'excel') ? this.tableDataArray = res.responseData.responseData1 : this.tableDataArray = this.tableDataArray;
          this.tableDatasize = res.responseData.responseData2.pageCount;
          this.totalCount = res.responseData.responseData2.pageCount;
          this.resultDownloadArr = [];
          let data: [] = (flag == 'pdfFlag' || flag == 'excel') ? res.responseData.responseData1 : [];
          flag == 'pdfFlag' ? this.downloadPdf(data, 'pdfFlag') : flag == 'excel' ? this.downloadPdf(data, 'excel') : '';
        } else {
          this.tableDataArray = [];
          this.tableDatasize = 0;
          this.tableDatasize == 0 && flag == 'pdfFlag' ? this.commonMethod.showPopup('No Record Found', 1) : '';
        }
        this.getTableTranslatedData();
      },
      error: ((err: any) => { this.errors.handelError(err) })
    });
  }
  //#endregion -------------------------------------End Designation-Master Table-Data ------------------------------- //
  childCompInfo(obj: any) {
    switch (obj.label) {
      case 'Pagination':
        this.pageNumber = obj.pageNumber;
        this.getTableData();
        break;
      case 'Edit':
        this.onClickEdit(obj);
        break;
      case 'Delete':
        this.globalDialogOpen(obj);
        break;
    }
  }

  //#region -------------------------------------------dialog box open function's start heare----------------------------------------//
  // addUpdateAgency(obj?: any) {  
  //   const dialogRef = this.dialog.open(AddUpdateDesignationMasterComponent, {
  //     width: '420px',
  //     data: obj,
  //     disableClose: true,
  //     autoFocus: false
  //   })  
  //    dialogRef.afterClosed().subscribe((result: any) => {

  //     if(result == 'yes' && obj){     
  //       this.clearForm();
  //       this.getTableData();
  //       this.pageNumber = this.pageNumber;
  //     }
  //     else if(result == 'yes' ){
  //       this.getTableData();
  //       this.clearForm();
  //       this.pageNumber = 1 ;   
  //     } 
  //     this.highLightFlag=false; 
  //     this.getTableTranslatedData();  
  //   });
  // }

  globalDialogOpen(obj: any) {
    let dialoObj = {
      header: this.webStorage.languageFlag == 'EN' ? 'Delete' : 'हटवा',
      title: this.webStorage.languageFlag == 'EN' ? 'Do you want to delete Designation record?' : 'तुम्हाला पदनाम रेकॉर्ड हटवायचा आहे का?',
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
      this.highLightFlag = false;
      this.getTableTranslatedData();
    })
  }
  //#endregion -------------------------------------------dialog box open function's end heare----------------------------------------//

  onClickDelete(obj: any) {
    let webStorageMethod = this.webStorage.createdByProps();
    let deleteObj = [{
      "id": obj.id,
      "deletedBy": this.webStorage.getUserId(),
      "modifiedDate": webStorageMethod.modifiedDate,
      "lan": this.webStorage.languageFlag
    }]

    this.apiService.setHttp('delete', 'zp-satara/designation-master/Delete', false, deleteObj, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: ((res: any) => {
        if (res.statusCode == '200') {
          this.commonMethod.showPopup(res.statusMessage, 0);
          // this.clearForm();
        }
      }),
      error: (error: any) => {
        this.commonMethod.checkEmptyData(error.statusText) == false ? this.errorHandler.handelError(error.statusCode) : this.commonMethod.showPopup(error.statusText, 1);
      }
    })
  }

  //#region  ------------------------------------- Desiganation-Master Edit ---------------------------------//
  onClickEdit(obj: any) {
    this.editFlag = true;
    this.editData = obj;
    this.editId=obj.id;
    this.designationForm.patchValue({
      id: this.editId,
      designationType: obj.designationName,
      m_DesignationType: obj.m_DesignationType,
      designationLevelId: obj.designationLevelId
    });
    this.getDesiganationLevel();
  }
  //#endregion -------------------------------------End Desiganation-Master Edit ---------------------------------//


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



  downloadPdf(data: any, flag?: string) {
    this.resultDownloadArr = [];
    data.map((ele: any, i: any) => {
      if (flag == 'excel') {
        let obj = {
          "Sr.No": this.langTypeName == 'English' ? (i + 1) : this.convertToMarathiNumber(i + 1),
          "Designation Name": this.langTypeName == 'English' ? ele.designationName : ele.m_DesignationType,
          "Designation Level": this.langTypeName == 'English' ? ele.designationLevel : ele.m_DesignationLevel,
        }
        this.resultDownloadArr.push(obj);
      } else if (flag == 'pdfFlag') {
        let obj = {
          "Sr.No": i + 1,
          "Designation Name": ele.designationName,
          "Designation Level": ele.designationLevel
        }
        this.resultDownloadArr.push(obj);
      }

    });

    if (this.resultDownloadArr?.length > 0) {
      let keyPDFHeader = ['Sr.No.', 'Designation', 'Designation Level'];
      let MarathikeyPDFHeader = ['अनुक्रमांक', 'पदनाम', 'पदनाम स्तर']
      let ValueData =
        this.resultDownloadArr.reduce(
          (acc: any, obj: any) => [...acc, Object.values(obj).map((value) => value)], []
        );// Value Name

      let objData: any
      if (flag == 'excel') {
        objData = {
          'topHedingName': this.langTypeName == 'English' ? 'Designation List' : 'पदनाम यादी',
          'createdDate': this.langTypeName == 'English' ? 'Created on:' + this.datepipe.transform(new Date(), 'yyyy-MM-dd, h:mm a') : 'रोजी तयार केले :' + this.datepipe.transform(new Date(), 'yyyy-MM-dd, h:mm a')
        }
      } else if (flag == 'pdfFlag') {
        objData = {
          'topHedingName': 'Designation List',
          'createdDate': 'Created on:' + this.datepipe.transform(new Date(), 'yyyy-MM-dd, h:mm a')
        }
      }

      let headerKeySize = [7, 15, 20];
      flag == 'pdfFlag' ? this.downloadFileService.downLoadPdf(keyPDFHeader, ValueData, objData) : this.downloadFileService.allGenerateExcel(this.langTypeName == 'English' ? keyPDFHeader : MarathikeyPDFHeader, ValueData, objData, headerKeySize);
    }
  }

  clearForm() {
    if (this.searchContent.value) {
      this.searchContent.reset();
      this.getTableData();
    }
  }

  clearDrop(formControlName: any) {
    if (formControlName == 'designationLevelId') {
      this.designationForm.controls['designationType'].setValue('');
    }
  }


  //#region -------------------------------------- Desiganation-Master Formdata --------------------------//
  formData() {
    this.designationForm = this.fb.group({
      "lan": [''],
      "id": [0],
      "designationType": ['', [Validators.required, Validators.pattern(this.validation.alphaNumericOnly)]],
      "m_DesignationType": ['', [Validators.required, Validators.pattern('^[-\u0900-\u096F ]+$')]],
      "designationLevelId": ['', Validators.required]
    })
  }
  //#endregion  ---------------------------- End Desiganation-Master Formdata ------------------------------- //

  get f() { return this.designationForm.controls }

  //#region ------------------------------------- Desiganation-Master Submit ---------------------------------// 
  OnSubmit() {
    if (this.designationForm.valid) {
      // this.formDisabled = !this.formDisabled;
      // this.formDisabled ? 'disable' : 'enable';
      // if (this.editFlag) {
      //   const disableValue = this.formDisabled ? 'disable' : 'enable';
      //   Object.keys(this.designationForm.controls).forEach((designationLevelId) => {
      //     this.designationForm.controls[designationLevelId][disableValue]();
      //   });
      // }
      let formValue = this.designationForm.value;
      let data = this.webStorage.createdByProps();

      let postObj = {
        "createdBy": data.createdBy,
        "modifiedBy": data.modifiedBy,
        "createdDate": data.createdDate,
        "modifiedDate": data.modifiedDate,
        "isDeleted": data.isDeleted,
        "lan": this.webStorage.languageFlag,
        "id": this.editFlag?this.editId:0,
        "designationType": formValue.designationType,
        "m_DesignationType": formValue.m_DesignationType,
        "designationLevelId": formValue.designationLevelId,
        "timestamp": new Date(),
        "localId": 0,
      }
      this.ngxSpinner.show();
     
      let url=this.editFlag?'zp-satara/register-designation/UpdateRecord':'zp-satara/register-designation/AddDesignation';
     let method=this.editFlag ? 'put' : 'post'
      // this.editFlag ? url = 'zp-satara/register-designation/UpdateRecord' : url = 'zp-satara/register-designation/AddDesignation'
      this.apiService.setHttp(method, url, false, postObj, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => {
          this.ngxSpinner.hide();
          // this.service.staticData.next('getRefreshStaticdata');
          res.statusCode == 200 ? (this.commonMethod.showPopup(res.statusMessage, 0), this.getTableData()) : this.commonMethod.checkEmptyData(res.statusMessage) == false ? this.errorHandler.handelError(res.statusCode) : this.commonMethod.showPopup(res.statusMessage, 1);
          res.statusCode == 200 ? '' : this.ngxSpinner.hide();
        },
        error: ((error: any) => {
          this.errorHandler.handelError(error.status);
          this.commonMethod.checkEmptyData(error.status) == false ? this.errorHandler.handelError(error.status) : this.commonMethod.showPopup(error.status, 1);
        })
      })
    } else {
      this.commonMethod.showPopup(this.webStorage.languageFlag == 'EN' ? 'Please Enter Mandatory Fields' : 'कृपया अनिवार्य फील्ड प्रविष्ट करा', 1);
      return;
    }

  }
  //#endregion -------------------------------------End Desiganation-Master Submit ---------------------------------//


  clearFormData() {
    this.formDirective.resetForm();
    this.editFlag = false;
    // this.DesiganationLevelData=[]
  }

  clearFilterData() {
    this.searchContent.setValue('');
    this.pageNumber = 1;
    this.getTableData();
  }




}
