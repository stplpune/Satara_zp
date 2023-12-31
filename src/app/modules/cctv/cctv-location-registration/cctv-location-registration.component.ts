import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddCctvLocationComponent } from './add-cctv-location/add-cctv-location.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { WebStorageService } from 'src/app/core/services/web-storage.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { DownloadPdfExcelService } from 'src/app/core/services/download-pdf-excel.service';
import { DatePipe } from '@angular/common';
import { MasterService } from 'src/app/core/services/master.service';
import { ValidationService } from 'src/app/core/services/validation.service';
import { GlobalDialogComponent } from 'src/app/shared/components/global-dialog/global-dialog.component';
import { Workbook } from 'exceljs';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-cctv-location-registration',
  templateUrl: './cctv-location-registration.component.html',
  styleUrls: ['./cctv-location-registration.component.scss']
})
export class CctvLocationRegistrationComponent {
  viewStatus = 'Table';
  filterForm !:FormGroup;
  languageFlag!: string;
  pageNumber: number = 1;
  tableDataArray = new Array();
  tableDatasize!: number;
  resultDownloadArr = new Array();
  highLightFlag: boolean = true;
  isWriteRight!: boolean;
  stateArr = new Array();
  districtArr = new Array();
  talukaArr = new Array();
  villageArr = new Array();
  centerArr = new Array();
  schoolArr = new Array();
  CCTVLocation = new Array();
  deleteObj: any;
  totalDetailRows: number = 0;
  loginData = this.webService.getLoggedInLocalstorageData();

  displayedheaders = ['Sr. No.', 'CCTV Type', 'CCTV Name', 'CCTV Location', 'Registration Date', 'CCTV Model','Remark', 'action'];
  marathiDisplayedheaders = ['अनुक्रमांक', 'सीसीटीव्हीचा प्रकार', 'सीसीटीव्हीचे नाव', 'सीसीटीव्ही स्थान','नोंदणी दिनांक', 'सीसीटीव्ही मॉडेल', 'वर्णन', 'कृती'];

  constructor(public dialog: MatDialog,
    public webService: WebStorageService,
    private fb: FormBuilder,
    private ngxSpinner: NgxSpinnerService,
    private apiService: ApiService,
    private commonMethods: CommonMethodsService,
    private errors: ErrorsService,
    private downloadFileService: DownloadPdfExcelService,
    public datepipe: DatePipe,
    private masterService: MasterService,
    public validators: ValidationService,
     ) {}


  ngOnInit() {
    this.getIsWriteFunction();
    this.languageFlag = this.webService.languageFlag;
    this.webService.langNameOnChange.subscribe(lang => {
      this.languageFlag = lang;
      this.setTableData();
    });
    this.filterFormData();
    this.getTableData();    
    this.getState();;
    this.getCCTVLocation();
    console.log("loginData: ", this.loginData);
  }

  getIsWriteFunction() {
    let print = this.webService?.getAllPageName().find((x: any) => {
      return x.pageURL == "cctv-location-registration"
    });
    (print.writeRight === true) ? this.isWriteRight = true : this.isWriteRight = false
  }

  getFormValue(){
     return {
      "stateId" : this.loginData ? this.loginData.stateId : 0,
      "districtId" : this.loginData ? this.loginData.districtId : 0,
      "centerId" : this.loginData ? this.loginData.centerId : 0,
      "talukaId" : this.loginData ? this.loginData.talukaId : 0,
      "villageId" : this.loginData ? this.loginData.villageId : 0,
      "schoolId" : this.loginData ? this.loginData.schoolId : 0
     }
  }

  filterFormData() {
    this.filterForm = this.fb.group({  
      stateId: [this.getFormValue().stateId],
      districtId: [this.getFormValue().districtId],
      centerId : [this.getFormValue().centerId],
      TalukaId: [this.getFormValue().talukaId],
      villageId: [this.getFormValue().villageId],  
      SchoolId: [this.getFormValue().schoolId],
      cctvLocation :[''],
      textSearch : ['']
    });
  }
  
  getState(){
    this.stateArr = [];
    this.masterService.getAllState('').subscribe({
      next: (res: any) => {
        if(res.statusCode == "200"){
          this.stateArr.push({"id": 0, "state": "All", "m_State": "सर्व"}, ...res.responseData);
          this.loginData ? (this.filterForm.controls['stateId'].setValue(this.loginData.stateId), this.getDistrict()) : this.filterForm.controls['stateId'].setValue(0);
        }
        else{
          this.stateArr = [];
        }
      }
    })
  }

  getDistrict() {
    this.districtArr = [];
    let stateId = this.filterForm.value.stateId;
    if(stateId != 0){
      this.masterService.getAllDistrict('', stateId).subscribe({
        next: (res: any) => {
          if (res.statusCode == "200") {
            this.districtArr.push({"id": 0, "district": "All", "m_District": "सर्व"}, ...res.responseData);
            this.loginData ? (this.filterForm.controls['districtId'].setValue(this.loginData.districtId), this.getTaluka()) : this.filterForm.controls['districtId'].setValue(0);
          }
          else {
            this.districtArr = [];
          }
        },
      });
    }
  }

  getTaluka() {
    this.talukaArr = [];
    let districtId = this.filterForm.value.districtId;
    if(districtId != 0){
      this.masterService.getAllTaluka('', districtId).subscribe({
        next: (res: any) => {
          if (res.statusCode == 200) {
            this.talukaArr.push({ "id": 0, "taluka": "All", "m_Taluka": "सर्व" }, ...res.responseData);
            this.loginData ? (this.filterForm.controls['TalukaId'].setValue(this.loginData?.talukaId), this.getAllCenter()): this.filterForm.controls['TalukaId'].setValue(0);
          } else {
            this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
            this.talukaArr = [];
          }
        },
        // error: ((err: any) => { this.errors.handelError(err.statusCode || err.status) })
      });
    }
  }

  getAllCenter() {
    this.centerArr = [];
    let talukaId = this.filterForm.value.TalukaId;
    if (talukaId != 0) {
      this.masterService.getAllCenter('', talukaId).subscribe({
        next: (res: any) => {
          if (res.statusCode == 200) {
            this.centerArr.push({ "id": 0, "center": "All", "m_Center": "सर्व" }, ...res.responseData);            
            this.loginData ? (this.filterForm.controls['centerId'].setValue(this.loginData?.centerId), this.getVillage()): this.filterForm.controls['centerId'].setValue(0);
          } else {
            this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
            this.centerArr = [];
          }
        },
        // error: ((err: any) => { this.errors.handelError(err.statusCode || err.status) })
      });
    }
  }

  getVillage() {
    this.villageArr = [];
    let Cid = this.filterForm.value.centerId;
    if(Cid != 0){
      this.masterService.getAllVillage('', Cid).subscribe({
        next: (res: any) => {
          if (res.statusCode == 200) {
            this.villageArr.push({ "id": 0, "village": "All", "m_Village": "सर्व" }, ...res.responseData);
            this.loginData ? (this.filterForm.controls['villageId'].setValue(this.loginData?.villageId), this.getAllSchoolsByCenterId()): this.filterForm.controls['villageId'].setValue(0);
          } else {
            this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
            this.villageArr = [];
          }
        },
        // error: ((err: any) => { this.errors.handelError(err.statusCode || err.status) })
      });
    }
    }

    getAllSchoolsByCenterId() {
      this.schoolArr = [];
      let Tid = this.filterForm.value.talukaId || 0;
      let Cid = this.filterForm.value.centerId || 0;
      let Vid = this.filterForm.value.villageId || 0;
      if(Vid != 0){
        this.masterService.getAllSchoolByCriteria('', Tid, Vid, Cid).subscribe({
          next: (res: any) => {
            if (res.statusCode == 200) {
              this.schoolArr.push({ "id": 0, "schoolName": "All", "m_SchoolName": "सर्व" }, ...res.responseData);
              this.loginData ? this.filterForm.controls['SchoolId'].setValue(this.loginData?.schoolId): this.filterForm.controls['SchoolId'].setValue(0);
            } else {
              this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
              this.schoolArr = [];
            }
          },
          // error: ((err: any) => { this.errors.handelError(err.statusCode || err.status) })
        });
      }
    }

    getCCTVLocation(){
      this.CCTVLocation = [];
      this.masterService.getCCTVLocation('').subscribe({
        next: (res: any) => {
          if (res.statusCode == 200) {
            this.CCTVLocation =res.responseData         
            
            // this.logInDetails ? this.studentReportForm.controls['villageId'].setValue(this.logInDetails?.villageId): this.studentReportForm.controls['villageId'].setValue(0), this.getAllSchoolsByCenterId();
          } else {
            this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
            this.CCTVLocation = [];
          }
        },
        // error: ((err: any) => { this.errors.handelError(err.statusCode || err.status) })
      });
    }
  
  getTableData(flag?: string) {
    let formValue = this.filterForm?.value;
    this.ngxSpinner.show();
    this.pageNumber = flag == 'filter' ? 1 : this.pageNumber;
    
    let str = `StateId=${formValue?.stateId || 0}&DistrictId=${formValue?.districtId || 0}&TalukaId=${formValue?.TalukaId || 0}&CenterId=${formValue?.centerId || 0}&VillageId=${formValue?.villageId || 0}&SchoolId=${formValue?.SchoolId || 0}&CCTVLocationId=${formValue?.cctvLocation || 0}&TextSearch=${formValue?.textSearch?.trim() || 0}&PageNo=${this.pageNumber}&PageSize=10&lan=${this.languageFlag}`
    let reportStr = `StateId=${formValue?.stateId || 0}&DistrictId=${formValue?.districtId || 0}&TalukaId=${formValue?.TalukaId || 0}&CenterId=${formValue?.centerId || 0}&VillageId=${formValue?.villageId || 0}&SchoolId=${formValue?.SchoolId || 0}&CCTVLocationId=${formValue?.cctvLocation || 0}&TextSearch=${formValue?.textSearch?.trim() || 0}&PageNo=${this.pageNumber}&PageSize=${this.tableDatasize * 10}&lan=${this.languageFlag}`
    this.apiService.setHttp('GET', 'zp-satara/CCTVLocation/GetAll?' + ((flag == 'pdfFlag' || flag == 'excel') ? reportStr : str), false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.ngxSpinner.hide();
          (flag != 'pdfFlag' && flag != 'excel') ? this.tableDataArray = res.responseData.responseData1 : this.tableDataArray = this.tableDataArray;
          this.tableDataArray = this.convertKeys(); // Rename key name in the array
           //  shift 1st array index into object
          this.tableDataArray.map((x: any) => {
            let obj: any
            if (x.cctvDetailsModelResponse.length) {
              obj = x.cctvDetailsModelResponse.shift();
            }
            Object.assign(x, obj);
          })     
          
          // (flag != 'excel') ? this.tableDataArray = res.responseData.responseData1 : this.tableDataArray = this.tableDataArray; 
          this.tableDatasize = res.responseData.responseData2.pageCount;
          let data: [] = (flag == 'pdfFlag' || flag == 'excel') ? res.responseData.responseData1 : [];
          flag == 'pdfFlag' ? this.downloadPdf(data, 'pdfFlag') : flag == 'excel' ? this.downloadExcel(data) : '';
        } else {
          this.ngxSpinner.hide();
          this.tableDataArray = [];
          this.tableDatasize = 0
        }
        this.setTableData();
      },
      error: ((err: any) => { (this.ngxSpinner.hide(), this.commonMethods.checkEmptyData(err.statusText) == false) ? this.errors.handelError(err.statusCode) : this.commonMethods.showPopup(err.statusText, 1); })
    });
  }

  setTableData() {
    this.highLightFlag = true;
    let displayedColumnsReadMode = ['srNo', 'cctvName', this.languageFlag == 'English' ? 'cctvLocation' : 'm_CCTVLocation', 'registrationDate', 'cctvModel','remark'];
    let displayedColumns = ['srNo','cctvName', this.languageFlag == 'English' ? 'cctvLocation' : 'm_CCTVLocation', 'registrationDate','cctvModel','remark', 'action'];

    let tableData = {
      highlightedrow: true,
      pageNumber: this.pageNumber,
      img: 'docPath', blink: '', badge: '', isBlock: '', pagintion: this.tableDatasize > 10 ? true : false,
      displayedColumns: this.isWriteRight === true ? displayedColumns : displayedColumnsReadMode,
      tableData: this.tableDataArray,
      tableSize: this.tableDatasize,
      tableHeaders: this.languageFlag == 'English' ? this.displayedheaders : this.marathiDisplayedheaders,
      edit: true, delete: true,
      date : 'registrationDate'
    };
    this.highLightFlag ? tableData.highlightedrow = true : tableData.highlightedrow = false,
      this.apiService.tableData.next(tableData);
  }
 
  childTableCompInfo(obj: any) {
    switch (obj.label) {
      case 'Pagination':
        this.pageNumber = obj.pageNumber;
        this.getTableData();
        this.clearForm();
        break;
      case 'Edit':
        this.openDialog(obj);
        break;
      case 'Delete':
        this.globalDialogOpen(obj);
        break;
      // case 'View':
      //   // this.openDetailsDialog(obj);
      //   break;
    }
  }

  downloadPdf(data?: any, flag?: string) {
    this.resultDownloadArr = [];
    data.find((ele: any, i: any) => {    

     let obj = {
        srNo:(i + 1),
        cctvName: ele.cctvName,
        cctvLocation:ele.cctvLocation ,
        registrationDate: ele.registrationDate,
        cctvModel: ele.cctvModel,
        remark : ele.remark
      }
    
      this.resultDownloadArr.push(obj);
    });

    if (this.resultDownloadArr?.length > 0) {
      let keyPDFHeader = ['Sr. No.', 'CCTV Name', 'CCTV Location', 'Registration Date', 'CCTV Model','Remark'];;
      let MarathikeyPDFHeader = ['अनुक्रमांक', 'CCTV नाव', 'CCTV स्थान','नोंदणी दिनांक', 'CCTV मॉडेल', 'वर्णन'];
      let ValueData =
        this.resultDownloadArr.reduce(
          (acc: any, obj: any) => [...acc, Object.values(obj).map((value) => value)], []
        );

      let objData: any
      objData= {
        'topHedingName': flag == 'excel' ? this.languageFlag == 'English' ? 'CCTV Location List' : 'CCTV स्थान सूची' : 'CCTV Location List',
        'createdDate': (flag == 'excel' ? this.languageFlag == 'English' ? 'Created on:' : 'रोजी तयार केले :' : 'Created on:')+ this.datepipe.transform(new Date(), 'yyyy-MM-dd, h:mm a')
      }
      
      let headerKeySize = [7, 15, 20, 30, 40,]
      flag == 'pdfFlag' ? this.downloadFileService.downLoadPdf(keyPDFHeader, ValueData, objData) : this.downloadFileService.allGenerateExcel(this.languageFlag == 'English' ?keyPDFHeader:MarathikeyPDFHeader, ValueData, objData, headerKeySize)
    }
  }

  downloadExcel(data: any){
    let apiKeys = ['srNo', 'cctvLocation', 'remark'];
    let keyCenterNo = "";
    // let keyCNo = String.fromCharCode(Math.ceil(apiKeys.length) + 64);

    if(apiKeys.length == 4){
      keyCenterNo = "D"
    }
    else{
      keyCenterNo = String.fromCharCode(Math.ceil(apiKeys.length / 2) + 64);
      keyCenterNo = keyCenterNo;
    }

    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Zp-Satara');

    worksheet.getCell('C4').value = 'CCTV Location List';
    worksheet.getCell('C4').alignment = { vertical: 'bottom' };
    worksheet.getCell('C4').font = { size: 12, bold: true, color: { argb: '000000',  } };

    worksheet.getCell('E5').value = 'Created on:' + this.datepipe.transform(new Date(), 'yyyy-MM-dd, h:mm a');
    worksheet.getCell('E5').alignment = { vertical: 'bottom' };
    worksheet.getCell('E5').font = { size: 12, bold: true, color: { argb: '000000',  } };

    let resObject: any = []; let resData: any = [];
    data.map((res: any, i:any)=> {
      resObject.push((i+1), res.cctvLocation, '', '', '', '', '', '',res.remark);
      resData.push(resObject);
      resObject = [];
    if(res.cctvDetailsModelResponse){
      res.cctvDetailsModelResponse.map((ele: any)=>{
        ele.registerDate = this.datepipe.transform(ele.registerDate, 'dd/MM/yyyy');
        resObject.push('', '', ele.cctvName, ele.cctvModel, ele.deviceId, ele.registerDate, ele.userName, ele.password);
        resData.push(resObject);
        resObject = [];
      });
    }
    });

    worksheet.addTable({
      name:'CCTV Location',
      ref: 'A7',
      columns: [
        {name: 'Sr. No'},
        {name: 'CCTV Location'},
        {name: 'CCTV Name'},
        {name: 'CCTV Model'},
        {name: 'Device Id'},
        {name: 'Registration Date'},
        {name: 'Username'},
        {name: 'Password'},
        {name: 'Remark'},
      ], 
      rows: resData,
      style: {
        theme: 'TableStyleLight11',
      },
    });

    var headerSize;
    headerSize = [7, 15, 15, 15, 15, 20, 15, 15, 15];
    for(var i = 0; i < headerSize.length; i++){
      worksheet.getColumn(i + 1).width = headerSize[i];
    }

    workbook.xlsx.writeBuffer().then((data: any)=>{
      const blob = new Blob([data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      FileSaver.saveAs(blob, 'CCTV Location');
    });
    this.getTableData();
  }

  clearForm() {
    this.filterForm.reset();
    this.districtArr = [];
    this.talukaArr = [];
    this.villageArr = [];
    this.centerArr = [];
    this.schoolArr = [];
    this.filterFormData();
    this.getTableData();
    this.getState();
  }

  openDialog(id?:any) {
    const dialogRef = this.dialog.open(AddCctvLocationComponent,{
      width: '1500px',
      disableClose: true,
      autoFocus: false,
      data :id
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == 'yes' && id) {
        this.pageNumber = this.pageNumber;
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
      title: this.webService.languageFlag == 'EN' ? 'Do You Want To Delete CCTV Location?' : 'तुम्हाला CCTV स्थान हटवायचे आहे का?',
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
        this.onDelete();
      }
      this.highLightFlag = false;
    });
  }

  onDelete(){
    let deleteObj = {
      "id": this.deleteObj.id,
      "deletedBy": this.webService.getUserId() || 0,
      "modifiedDate": new Date(),
      "lan": this.languageFlag
    }
    this.apiService.setHttp('DELETE', 'zp-satara/CCTVLocation/DeleteCCTVLocation', false, deleteObj, false, 'baseUrl');
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

  clearDependency(flag : any){
    if(flag == 'state'){
      this.filterForm.controls['districtId']?.setValue('');
      this.filterForm.controls['TalukaId']?.setValue('');
      this.filterForm.controls['centerId']?.setValue('');
      this.filterForm.controls['villageId']?.setValue('');
      this.filterForm.controls['SchoolId']?.setValue(''); 
      this.districtArr = [];
      this.talukaArr = [];
      this.centerArr = [];  
      this.villageArr = [];
      this.schoolArr = [];
    }
    else if(flag == 'district'){
      this.filterForm.controls['TalukaId']?.setValue('');
      this.filterForm.controls['centerId']?.setValue('');
      this.filterForm.controls['villageId']?.setValue('');
      this.filterForm.controls['SchoolId']?.setValue('');   
      this.talukaArr = [];
      this.centerArr = [];  
      this.villageArr = [];
      this.schoolArr = [];
    }
    else if(flag == 'TalukaId'){
      this.filterForm.controls['centerId']?.setValue(0);
      this.filterForm.controls['villageId']?.setValue('');
      this.filterForm.controls['SchoolId']?.setValue('');   
      this.centerArr = [];  
      this.villageArr = [];
      this.schoolArr = [];
    }else if (flag == 'centerId'){
      this.filterForm.controls['villageId']?.setValue(0);
      this.filterForm.controls['SchoolId']?.setValue('');
      this.villageArr = [];
      this.schoolArr = [];
    }else if (flag =='villageId'){
      this.filterForm.controls['SchoolId']?.setValue(0);
      this.schoolArr = [];
    }
  }

  convertKeys() {
    this.tableDataArray.map((x: any) => {
      if (x.cctvDetailsModelResponse.length) {
        x.cctvDetailsModelResponse = x.cctvDetailsModelResponse.map((obj: any) => {
          return Object.keys(obj).reduce(function (r: any, key: any) {
            var k = key.concat('E');
            r[k] = obj[key];
            return r;
          }, {})
        })
      } else {
        x.cctvDetailsModelResponse = []
      }
    })
    return this.tableDataArray
  }

 
}
