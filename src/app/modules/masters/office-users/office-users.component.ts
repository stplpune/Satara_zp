import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { DownloadPdfExcelService } from 'src/app/core/services/download-pdf-excel.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { ValidationService } from 'src/app/core/services/validation.service';
import { WebStorageService } from 'src/app/core/services/web-storage.service';
import { GlobalDetailComponent } from 'src/app/shared/components/global-detail/global-detail.component';
import { GlobalDialogComponent } from 'src/app/shared/components/global-dialog/global-dialog.component';
import { AddUpdateOfficeUsersComponent } from './add-update-office-users/add-update-office-users.component';
import { MasterService } from 'src/app/core/services/master.service';

@Component({
  selector: 'app-office-users',
  templateUrl: './office-users.component.html',
  styleUrls: ['./office-users.component.scss']
})
export class OfficeUsersComponent implements OnInit {
  cardViewFlag: boolean = false;
  pageNumber: number = 1;
  resultDownloadArr = new Array();
  totalCount: number = 0;
  searchContent = new FormControl('');
  stateId = new FormControl(0);
  districtId = new FormControl(0);
  talukaId = new FormControl(0);
  langTypeName: any;
  tableData: any;
  tableDataArray = new Array();
  tableDatasize!: Number;
  displayedColumns = new Array();
  stateArr = new Array();
  districtArr = new Array();
  talukaArray = new Array();
  isWriteRight!: boolean;
  highLightFlag: boolean =true;
  viewStatus='Table';
  displayedheadersEnglish = ['Sr. No.', ' Office User Name', 'Designation', 'Taluka', 'Mobile No.', 'Email ID', 'Unblock/Block', 'action'];
  displayedheadersMarathi = ['अनुक्रमांक', 'ऑफिस युजर नावे', 'पदनाम', 'तालुका', 'मोबाईल क्र.', 'ई-मेल आयडी', 'अनब्लॉक/ब्लॉक', 'कृती'];
  constructor(private apiService: ApiService, private errors: ErrorsService, private dialog: MatDialog, private commonService: CommonMethodsService,
    public webStorageService: WebStorageService, private downloadFileService: DownloadPdfExcelService, public validation: ValidationService,
    private ngxSpinner: NgxSpinnerService, public datepipe: DatePipe, private masterService: MasterService) { }

  ngOnInit() {
    this.getIsWriteFunction();
    this.getState();
    this.getTableData();
    // this.getofficeReport();
    this.webStorageService.langNameOnChange.subscribe(lang => {
      this.langTypeName = lang;
      console.log("langTypeName",this.langTypeName);
      
      this.languageChange();
    });
  }

  getIsWriteFunction() {
    let print = this.webStorageService?.getAllPageName().find((x: any) => {
      return x.pageURL == "office-user-registration"
    });
    (print.writeRight === true) ? this.isWriteRight = true : this.isWriteRight = false
  }
  
  onPagintion(pageNo: number) {
    this.pageNumber = pageNo;
    this.getTableData();
  }

  getTableData(flag?: string) {
    this.ngxSpinner.show();
    this.pageNumber = flag == 'filter' ? 1 : this.pageNumber;
    // if (flag == 'filter' && !this.searchContent.value) {
    //   this.ngxSpinner.hide();
    //   return
    // }

    let reportStr = `?textSearch=${this.searchContent.value}&pageno=${1}&pagesize=${(this.totalCount * 10)}&StateId=${this.stateId.value || 0}&DistrictId=1&TalukaId=${this.talukaId.value || 0}&lan=${this.webStorageService.languageFlag}`;
    let str = `?textSearch=${this.searchContent.value}&pageno=${this.pageNumber}&pagesize=10&StateId=${this.stateId.value || 0}&DistrictId=${this.districtId.value || 0}&TalukaId=${this.talukaId.value || 0}&lan=${this.webStorageService.languageFlag}`;
    this.apiService.setHttp('GET', 'zp-satara/Office/GetAllOffice' + ((flag == 'pdfFlag' || flag == 'excel') ? reportStr : str), false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.ngxSpinner.hide();
          (flag != 'pdfFlag' && flag != 'excel') ? this.tableDataArray = res.responseData.responseData1 : this.tableDataArray = this.tableDataArray;
          
          // this.tableDataArray = res.responseData.responseData1;
          this.tableDatasize = res.responseData.responseData2.pageCount;
          this.totalCount = res.responseData.responseData2.pageCount;
          this.resultDownloadArr = [];
          let data: [] = (flag == 'pdfFlag' || flag == 'excel') ? res.responseData.responseData1 : [];
         flag == 'pdfFlag' ? this.downloadPdf(data,'pdfFlag') : flag == 'excel' ? this.downloadPdf(data,'excel') :'';  
        } else {
          this.ngxSpinner.hide();
          this.tableDataArray = [];
          this.tableDatasize = 0;
          this.tableDatasize == 0 && flag == 'reportFlag' ? this.commonService.showPopup('No Record Found', 1) : '';
        }
        this.languageChange();
      },
      error: ((err: any) => { this.errors.handelError(err.message) })
    });
  }

  downloadPdf(data?: any,flag?:string){
    data.find((ele: any, i: any) => {
      let obj = {
        "Sr.No": i + 1,
        "name": flag=='excel'?this.langTypeName == 'English' ?ele.officeName:ele.m_OfficeName:ele.officeName,
        "designation": flag=='excel'?this.langTypeName == 'English' ?ele.designation:ele.m_Designation:ele.designation,
        "taluka": flag=='excel'?this.langTypeName == 'English' ?ele.taluka:ele.m_Taluka:ele.taluka,
        "mobileNo": ele.mobileNo,
        "emailId": ele.emailId,
      }
      this.resultDownloadArr.push(obj);
    });
    if (this.resultDownloadArr.length > 0) {
      let keyPDFHeader = ['Sr. No.', "Office User Name", "Designation", 'Taluka', "Mobile No.", "Email ID"];
      let MarathikeyPDFHeader = ['अनुक्रमांक', 'ऑफिस युजर नावे', 'पदनाम', 'तालुका', 'मोबाईल क्र.', 'ई-मेल आयडी'];
      let ValueData =
        this.resultDownloadArr.reduce(
          (acc: any, obj: any) => [...acc, Object.values(obj).map((value) => value)], []
        );
      // let objData: any = {
      //   'topHedingName': 'Office User List',
      //   'createdDate': 'Created on:' + this.datepipe.transform(new Date(), 'yyyy-MM-dd, h:mm a')
      // }

     let objData= {
        'topHedingName': flag == 'excel' ? this.langTypeName == 'English' ? 'Office User List' : 'ऑफिस वापरकर्ता यादी' : 'Office User List',
        'createdDate': (flag == 'excel' ? this.langTypeName == 'English' ? 'Created on:' : 'रोजी तयार केले :' : 'Created on:')+ this.datepipe.transform(new Date(), 'yyyy-MM-dd, h:mm a')
      }
      let headerKeySize = [7, 15, 10, 10, 10, 15];
      flag == 'pdfFlag' ? this.downloadFileService.downLoadPdf(keyPDFHeader, ValueData, objData) :this.downloadFileService.allGenerateExcel(this.langTypeName == 'English'?keyPDFHeader:MarathikeyPDFHeader, ValueData, objData, headerKeySize);
    }
  }
  
  languageChange() {
    this.highLightFlag=true;
    let displayedColumnsReadMode = ['srNo', this.langTypeName == 'English' ? 'officeName' : 'm_OfficeName', this.langTypeName == 'English' ? 'designation' : 'm_Designation', this.langTypeName == 'English' ? 'taluka' : 'm_Taluka', 'mobileNo', 'emailId'];
    this.displayedColumns = ['srNo', this.langTypeName == 'English' ? 'officeName' : 'm_OfficeName', this.langTypeName == 'English' ? 'designation' : 'm_Designation', this.langTypeName == 'English' ? 'taluka' : 'm_Taluka', 'mobileNo', 'emailId', 'isBlock', 'action'];
    this.tableData = {
      pageNumber: this.pageNumber,
      img: '', blink: '', badge: '', isBlock: 'isBlock', pagintion: true,
      // img: '', blink: '', badge: '', isBlock: 'isBlock', pagintion: true, desig: (this.langTypeName == 'English' ? 'designation' : 'm_Designation'),
      displayedColumns: this.isWriteRight === true ? this.displayedColumns : displayedColumnsReadMode,
      tableData: this.tableDataArray,
      tableSize: this.tableDatasize,
      tableHeaders: this.langTypeName == 'English' ? this.displayedheadersEnglish : this.displayedheadersMarathi,
      edit: true
    };
    this.highLightFlag?this.tableData.highlightedrow=true:this.tableData.highlightedrow=false,
    this.apiService.tableData.next(this.tableData);
  }

  addUpdateOffice(obj?: any) {
    const dialogRef = this.dialog.open(AddUpdateOfficeUsersComponent, {
      width: '600px',
      data: obj,
      disableClose: true,
      autoFocus: false
    })
    dialogRef.afterClosed().subscribe(result => {
      result == 'Yes' ? this.getTableData() : '';
      this.highLightFlag=false;
      this.languageChange();
    });
  }

  getState(){
    this.stateArr = [];
    this.masterService.getAllState('').subscribe({
      next: (res: any) => {
        if(res.statusCode == "200"){
          this.stateArr.push({"id": 0, "state": "All", "m_State": "सर्व"}, ...res.responseData);
        }
        else{
          this.stateArr = [];
        }
      }
    });
  }

  getDistrict() {
    let stateId = this.stateId.value || 0;
    if(stateId > 0){
    this.masterService.getAllDistrict('', stateId).subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.districtArr.push({"id": 0, "district": "All", "m_District": "सर्व"}, ...res.responseData);
        }
        else {
          this.districtArr = [];
        }
      },
      error: ((err: any) => { this.commonService.checkEmptyData(err.statusText) == false ? this.errors.handelError(err.statusCode) : this.commonService.showPopup(err.statusText, 1); })
    });
  }
  }

  getAllTaluka() {
    let districtId = this.districtId.value || 0;
    this.talukaArray = [];
    this.masterService.getAllTaluka(this.langTypeName, districtId).subscribe({
      next: ((res: any) => {
        if (res.statusCode == 200 && res.responseData.length) {
          this.talukaArray.push({"id": 0, "taluka": "All", "m_Taluka": "सर्व"}, ...res.responseData);
        } else {
          this.commonService.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonService.showPopup(res.statusMessage, 1);
          this.talukaArray = [];
        }
      }), error: (error: any) => {
        this.errors.handelError(error.statusCode)
      }
    })
  }

  childCompInfo(obj: any) {
    switch (obj.label) {
      case 'Pagination':
        this.pageNumber = obj.pageNumber;
        this.getTableData();
        break;
      case 'Edit':
        this.addUpdateOffice(obj);
        break;
      case 'Delete':
        this.openDeleteDialog(obj);
        break;
      case 'View':
        this.openDetailsDialog(obj);
        break;
      case 'Block':
        this.openBlockDialog(obj);
    }
  }

  openBlockDialog(obj?: any) {
    let userEng = obj.isBlock == false ?'Block' : 'Unblock';
    let userMara = obj.isBlock == false ?'ब्लॉक' : 'अनब्लॉक';
    let dialoObj = {
      header: this.langTypeName == 'English' ? userEng+' Office User' : 'ऑफिस वापरकर्ता '+userMara+' करा',
      title: this.langTypeName == 'English' ? 'Do You Want To '+userEng+' The Selected Office User?' : 'तुम्ही निवडलेल्या ऑफिस वापरकर्त्याला '+userMara+' करू इच्छिता?',
      cancelButton: this.langTypeName == 'English' ? 'Cancel' : 'रद्द करा',
      okButton: this.langTypeName == 'English' ? 'OK' : 'ओके'
    }
    const deleteDialogRef = this.dialog.open(GlobalDialogComponent, {
      width: '320px',
      data: dialoObj,
      disableClose: true,
      autoFocus: false
    })
    deleteDialogRef.afterClosed().subscribe((result: any) => {
      result == 'yes' ? this.blockOffice(obj) : this.getTableData();
      this.highLightFlag=false;
      this.languageChange();
    })
  }

  blockOffice(obj: any) {
    let webStorageMethod = this.webStorageService.createdByProps();
    let blockObj = {
      "refId": obj.id,
      "isBlock": !obj.isBlock,
      "blockDate": webStorageMethod.modifiedDate,
      "blockBy": this.webStorageService.getUserId(),
      "userTypeId": obj.designationLevelId,
      "subUserTypeId": obj.designationId
    }

    this.apiService.setHttp('put', 'zp-satara/user-registration/BlockUnblockUser', false, blockObj, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        res.statusCode == "200" ? (this.commonService.showPopup(res.statusMessage, 0), this.getTableData()) : this.commonService.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonService.snackBar(res.statusMessage, 1);
      },
      error: (error: any) => {
        this.errors.handelError(error.status);
        this.commonService.checkEmptyData(error.status) == false ? this.errors.handelError(error.status) : this.commonService.snackBar(error.status, 1);
      }
    })
  }

  openDeleteDialog(obj?: any) {
    let dialoObj = {
      header: 'Delete Office',
      title: 'Do You Want To Delete The Selected Office ?',
      cancelButton: 'Cancel',
      okButton: 'Ok'
    }
    const deleteDialogRef = this.dialog.open(GlobalDialogComponent, {
      width: '320px',
      data: dialoObj,
      disableClose: true,
      autoFocus: false
    })
    deleteDialogRef.afterClosed().subscribe((result: any) => {
      result == 'yes' ? this.deleteOffice(obj) : '';
      this.highLightFlag=false;
      this.languageChange();
    })
  }

  deleteOffice(obj: any) {
    let webStorageMethod = this.webStorageService.createdByProps();
    let deleteObj = [{
      "id": obj.id,
      "deletedBy": this.webStorageService.getUserId(),
      "modifiedDate": webStorageMethod.modifiedDate,
      "lan": this.webStorageService.languageFlag
    }]
    this.apiService.setHttp('DELETE', 'zp-satara/Office/DeleteOffice', false, deleteObj, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (resp: any) => {
        resp.statusCode == "200" ? (this.commonService.snackBar(resp.statusMessage, 0), this.getTableData()) : this.commonService.checkEmptyData(resp.statusMessage) == false ? this.errors.handelError(resp.statusCode) : this.commonService.snackBar(resp.statusMessage, 1);
      },
      error: (err: any) => {
        this.errors.handelError(err.status);
        this.commonService.checkEmptyData(err.status) == false ? this.errors.handelError(err.status) : this.commonService.snackBar(err.status, 1);
      }
    })
  }


  // downloadPdf() {
  //   this.getTableData('reportFlag');
  // }

  // filterData(){
  //   this.getTableData();
  //   // this.getofficeReport();
  // }

  clearFilterData() {
    if (this.searchContent.value != null && this.searchContent.value != '' || this.talukaId.value) {
      this.searchContent.setValue('');
      this.stateId.setValue(0);
      this.districtId.setValue(0);
      this.talukaId.setValue(0);
      this.getTableData();
      this.districtArr = [];
      this.talukaArray = [];
    }
  }


  // this.getofficeReport();

  selectGrid(label: string) {
    this.viewStatus=label;
    if (label == 'Table') {
      this.cardViewFlag = false;
      this.pageNumber = 1;
    } else if (label == 'Card') {
      this.cardViewFlag = true;
      this.pageNumber = 1;
      // this.cardCurrentPage = this.cardCurrentPage;
    }
    this.getTableData();
  }

  childGridCompInfo(obj: any) {
    switch (obj.label) {
      case 'Pagination':
        this.pageNumber = obj.pageNumber;

        this.getTableData();
        // this.selectGrid('Card');
        break;
      case 'Edit':
        this.addUpdateOffice(obj);
        break;
      case 'Delete':
        this.openDeleteDialog(obj);
        break;
      case 'View':
        this.openDetailsDialog(obj);
        break;
      case 'Block':
        this.openBlockDialog(obj);
    }
  }

  openDetailsDialog(obj: any) {
    var data = {
      headerImage: "",
      header: this.webStorageService.languageFlag == 'EN' ? obj.officeName : obj.m_OfficeName,
      subheader: this.webStorageService.languageFlag == 'EN' ? obj.designation : obj.m_Designation,
      labelHeader: this.webStorageService.languageFlag == 'EN' ? ['Mobile Number', 'Email ID', 'Designation', 'Taluka', 'District'] : ['मोबाईल क्र.', 'ई-मेल आयडी', 'पदनाम', 'तालुका', 'जिल्हा'],
      labelKey: this.webStorageService.languageFlag == 'EN' ? ['mobileNo', 'emailId', 'designationLevel', 'taluka', 'district'] : ['mobileNo', 'emailId', 'm_DesignationLevel', 'm_Taluka', 'm_District'],
      Obj: obj,
      chart: false,
      checkbox: this.webStorageService.languageFlag == 'EN' ? 'Center' : 'केंद्र',

    }
    const viewDialogRef = this.dialog.open(GlobalDetailComponent, {
      width: '900px',
      data: data,
      disableClose: true,
      autoFocus: false
    });
    viewDialogRef.afterClosed().subscribe((result: any) => {
      if (result == 'Yes') {
        this.getTableData();
      }
      this.highLightFlag=false;
      this.languageChange();
    });
  }

}