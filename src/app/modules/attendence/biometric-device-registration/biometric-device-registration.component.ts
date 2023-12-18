import { Component } from '@angular/core';
import { AddBiometricDeviceRegistrationComponent } from './add-biometric-device-registration/add-biometric-device-registration.component';
import { MatDialog } from '@angular/material/dialog';
import { MasterService } from 'src/app/core/services/master.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { WebStorageService } from 'src/app/core/services/web-storage.service';
import { ValidationService } from 'src/app/core/services/validation.service';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiService } from 'src/app/core/services/api.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { DownloadPdfExcelService } from 'src/app/core/services/download-pdf-excel.service';
import { DatePipe } from '@angular/common';
import { GlobalDialogComponent } from 'src/app/shared/components/global-dialog/global-dialog.component';

@Component({
  selector: 'app-biometric-device-registration',
  templateUrl: './biometric-device-registration.component.html',
  styleUrls: ['./biometric-device-registration.component.scss']
})
export class BiometricDeviceRegistrationComponent {
  displayedColumns = new Array();
  filterForm !: FormGroup;
  loginData = this.webStorageS.getLoggedInLocalstorageData();
  stateArr = new Array();
  districtArr = new Array();
  talukaArr = new Array();
  centerArr = new Array();
  villageArr = new Array();
  schoolArr = new Array();
  isWriteRight!: boolean;
  pageNumber: number = 1;
  tableDataArray = new Array();
  totalCount!: number;
  tableDatasize!: number;
  langTypeName: any;
  tableData: any;
  highLightFlag!: boolean;
  displayedheadersEnglish = ['Sr. No.', 'School Name', 'Device Name', 'Serial Number', 'IP Address', 'Connection Type', 'Action'];
  displayedheadersMarathi = ['अनुक्रमांक', 'शाळेचे नाव', 'डिव्हाइसचे नाव', 'क्रम संख्या','आयपी ॲड्रेस', 'कनेक्शन प्रकार', 'कृती'];

  constructor(public dialog: MatDialog,
    private masterService: MasterService,
    public webStorageS: WebStorageService,
    private fb: FormBuilder,
    public validationService: ValidationService,
    private commonMethodS: CommonMethodsService,
    private ngxSpinner: NgxSpinnerService, 
    private apiService: ApiService,
    private errors: ErrorsService,
    private excelpdfService: DownloadPdfExcelService,
    private datepipe: DatePipe
    ) { }

  ngOnInit() {
    this.getIsWriteFunction();
    this.formField();
    this.getTableData();
    this.getState();
    this.webStorageS.langNameOnChange.subscribe(lang => {
      this.langTypeName = lang;
      this.languageChange();
    });
  }

  getIsWriteFunction() {
    let print = this.webStorageS?.getAllPageName().find((x: any) => {
      return x.pageURL == "biometric-device-registration"
    });
    (print.writeRight === true) ? this.isWriteRight = true : this.isWriteRight = false
  }

  formField() {
    this.filterForm = this.fb.group({
      stateId: [this.loginData ? this.loginData?.stateId : 0],
      districtId: [this.loginData ? this.loginData?.districtId : 0],
      talukaId: [this.loginData  ? this.loginData.talukaId : 0],
      centerId: [this.loginData ? this.loginData.centerId : 0],
      villageId: [this.loginData ? this.loginData.villageId : 0],
      schoolId: [this.loginData ? this.loginData.schoolId : 0],
      textSearch: ['']
    })
  }

  //#region ------------------------------------------- table start here --------------------------------------------------------------------
  getTableData(flag?: string){
    this.ngxSpinner.show();
    this.pageNumber = flag == 'filter' ? 1 : this.pageNumber;
    let formValue = this.filterForm.value;
    let str = `StateId=${formValue?.stateId || 0}&DistrictId=${formValue?.districtId || 0}&TalukaId=${formValue?.talukaId || 0}&CenterId=${formValue?.centerId || 0}&VillageId=${formValue?.villageId || 0}&SchoolId=${formValue?.schoolId || 0}&textSearch=${(formValue?.textSearch.trim() || '')}&pageno=${this.pageNumber}&pagesize=10&lan=${this.webStorageS.languageFlag}`;
    let reportStr = `StateId=${formValue?.stateId || 0}&DistrictId=${formValue?.districtId || 0}&TalukaId=${formValue?.talukaId || 0}&CenterId=${formValue?.centerId || 0}&VillageId=${formValue?.villageId || 0}&SchoolId=${formValue?.schoolId || 0}&textSearch=${(formValue?.textSearch.trim() || '')}&pageno=${this.pageNumber}&pagesize=${this.totalCount * 10}&lan=${this.webStorageS.languageFlag}`;

    this.apiService.setHttp('GET', 'zp-satara/BioMetricDevice/GetAllDevice?' + ((flag == 'excel' || flag == 'pdfFlag') ? reportStr : str), false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.ngxSpinner.hide();
          flag != 'excel' && flag != 'pdfFlag' ? this.tableDataArray = res.responseData.responseData1 : this.tableDataArray = this.tableDataArray;
          this.totalCount = res.responseData.responseData2.pageCount;
          this.tableDatasize = res.responseData.responseData2.pageCount;

          let data: [] = (flag == 'pdfFlag' || flag == 'excel') ? res.responseData.responseData1 : [];
          flag == 'pdfFlag' ? this.pdfDownload(data, 'pdfFlag') : flag == 'excel' ? this.pdfDownload(data, 'excel') : '';
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
    let displayedColumnsReadMode = ['srNo', this.langTypeName == 'English' ? 'schoolName' : 'm_SchoolName', this.langTypeName == 'English' ? 'deviceName' : 'm_DeviceName', 'serialNumber', 'ipAddress', 'connectionType'];
    this.displayedColumns = ['srNo', this.langTypeName == 'English' ? 'schoolName' : 'm_SchoolName', this.langTypeName == 'English' ? 'deviceName' : 'm_DeviceName', 'serialNumber', 'ipAddress', 'connectionType', 'action'];
    this.tableData = {
      pageNumber: this.pageNumber,
      img: '', blink: '', badge: '', isBlock: '', pagintion: this.tableDatasize > 10 ? true : false, defaultImg: "",
      date: '',
      displayedColumns: this.isWriteRight === true ? this.displayedColumns : displayedColumnsReadMode,
      tableData: this.tableDataArray,
      tableSize: this.tableDatasize,
      tableHeaders: this.langTypeName == 'English' ? this.displayedheadersEnglish : this.displayedheadersMarathi,
      edit: true, delete: true,
    };
    this.highLightFlag ? this.tableData.highlightedrow = true : this.tableData.highlightedrow = false,
      this.apiService.tableData.next(this.tableData);
  }

  //#endregion ---------------------------------------- table end here ----------------------------------------------------------------------

  //#region ------------------------------------------- download PDF Excel start here ------------------------------------------------------
  pdfDownload(data?: any, flag?: string) {
    let resultDownloadArr: any = [];
    data.find((ele: any, i: any) => {
      let obj: any;
      obj = {
        "Sr.No": i + 1,
        "School Name": flag == 'excel' ? this.langTypeName == 'English' ? ele.schoolName : ele.m_SchoolName : ele.schoolName,
        "Device Name": flag == 'excel' ? this.langTypeName == 'English' ? ele.deviceName : ele.m_DeviceName : ele.deviceName,
        "Serial Number": ele.serialNumber,
        "IP Address": ele.ipAddress,
        "Connection Type": ele.connectionType,
      }
      resultDownloadArr.push(obj);
    });

    if (resultDownloadArr?.length > 0) {
      let keyPDFHeader = ['Sr. No.', 'School Name', 'Device Name', 'Serial Number', 'IP Address', 'Connection Type'];
      let MarathikeyPDFHeader =  ['अनुक्रमांक', 'शाळेचे नाव', 'डिव्हाइसचे नाव', 'क्रम संख्या','आयपी अॅड्रेस', 'कनेक्शन प्रकार'];
      let ValueData = resultDownloadArr.reduce(
          (acc: any, obj: any) => [...acc, Object.values(obj).map((value) => value)], []
        );        
      let objData: any
      objData = {
        'topHedingName': flag == 'excel' ? this.langTypeName == 'English' ? 'Biometric Device List' : 'बायोमेट्रिक डिव्हाइस यादी' : 'Biometric Device List',
        'createdDate': (flag == 'excel' ? this.langTypeName == 'English' ? 'Created on:' : 'रोजी तयार केले :' : 'Created on:')+ this.datepipe.transform(new Date(), 'yyyy-MM-dd, h:mm a')
      }
      let headerKeySize = [7, 40, 20, 20, 20, 20, 15, 20]
      flag == 'pdfFlag' ? this.excelpdfService.downLoadPdf(keyPDFHeader, ValueData, objData) : this.excelpdfService.allGenerateExcel(this.langTypeName == 'English' ? keyPDFHeader : MarathikeyPDFHeader, ValueData, objData, headerKeySize)
    }
  }
  //#endregion ---------------------------------------- download PDF Excel end here --------------------------------------------------------

  //#region ------------------------------------------- dropdown with dependencies start here ------------------------------------------------
  getState() {
    this.masterService.getAllState('').subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.stateArr.push({ "id": 0, "state": "All", "m_State": "सर्व" }, ...res.responseData);
          this.loginData ? (this.filterForm.controls['stateId'].setValue(this.loginData.stateId), this.getDistrict()) : this.filterForm.controls['stateId'].setValue(0);
        }
        else {
          this.stateArr = [];
        }
      }
    });
  }

  getDistrict() {
    this.districtArr = [];
    let stateId = this.filterForm.value.stateId;
    if (stateId > 0) {
      this.masterService.getAllDistrict('', stateId).subscribe({
        next: (res: any) => {
          if (res.statusCode == "200") {
            this.districtArr.push({ "id": 0, "district": "All", "m_District": "सर्व" }, ...res.responseData);
            this.loginData ? (this.filterForm.controls['districtId'].setValue(this.loginData.districtId), this.getTaluka()) : this.filterForm.controls['districtId'].setValue(0);
          }
          else {
            this.districtArr = [];
          }
        },
      });
    } else {
      this.districtArr = [];
    }
  }

  getTaluka() {
    this.talukaArr = [];
    let districtId = this.filterForm.value.districtId;
    if (districtId > 0) {
      this.masterService.getAllTaluka('', districtId).subscribe({
        next: (res: any) => {
          if (res.statusCode == "200") {
            this.talukaArr.push({ "id": 0, "taluka": "All", "m_Taluka": "सर्व" }, ...res.responseData);
            this.loginData ? (this.filterForm.controls['talukaId'].setValue(this.loginData.talukaId), this.getAllCenter()) : this.filterForm.controls['talukaId'].setValue(0);
          } else {
            this.talukaArr = [];
          }
        }
      });
    } else {
      this.talukaArr = [];
    }
  }

  getAllCenter() {
    this.centerArr = [];
    let id = this.filterForm.controls['talukaId'].value;
    if (id != 0) {
      this.masterService.getAllCenter('', id).subscribe({
        next: (res: any) => {
          if (res.statusCode == "200") {
            this.centerArr.push({ "id": 0, "center": "All", "m_Center": "सर्व" }, ...res.responseData);
            this.loginData ? (this.filterForm.controls['centerId'].setValue(this.loginData.centerId), this.getVillage()) : this.filterForm.controls['centerId'].setValue(0);
          } else {
            this.centerArr = [];
          }
        }
      });
    } else {
      this.centerArr = [];
    }
  }

  getVillage() {
    this.villageArr = [];
    let Cid = this.filterForm.controls['centerId'].value;
    if (Cid != 0) {
      this.masterService.getAllVillage('', Cid).subscribe({
        next: (res: any) => {
          if (res.statusCode == 200) {
            this.villageArr.push({ "id": 0, "village": "All", "m_Village": "सर्व" }, ...res.responseData);
            this.loginData ? (this.filterForm.controls['villageId'].setValue(this.loginData.villageId), this.getAllSchools()) : this.filterForm.controls['villageId'].setValue(0);
          } else {
            this.villageArr = [];
          }
        }
      });
    } else {
      this.villageArr = [];
    }
  }

  getAllSchools() {
    this.schoolArr = [];
    let Tid = this.filterForm.controls['talukaId'].value;
    let Cid = this.filterForm.controls['centerId'].value || 0;
    let Vid = this.filterForm.controls['villageId'].value || 0;
    if(Tid > 0 && Cid > 0 && Vid > 0){
      this.masterService.getAllSchoolByCriteria('', Tid, Vid, Cid).subscribe({
        next: (res: any) => {
          if (res.statusCode == 200) {
            this.schoolArr.push({ "id": 0, "schoolName": "All", "m_SchoolName": "सर्व" }, ...res.responseData);
            this.loginData ? this.filterForm.controls['schoolId'].setValue(this.loginData.schoolId) : this.filterForm.controls['schoolId'].setValue(0);
          } else {
            this.schoolArr = [];
          }
        }
      });
    }else{
      this.schoolArr = [];
    }
  }
  //#endregion ---------------------------------------- dropdown with dependencies end here --------------------------------------------------

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

  onClearFilter(){
    this.formField();
    this.getState();
    this.districtArr = [];
    this.talukaArr = [];
    this.centerArr = [];
    this.villageArr = [];
    this.schoolArr = [];
    this.getTableData();
  }

  openDialog(obj?: any) {
    const dialogRef = this.dialog.open(AddBiometricDeviceRegistrationComponent, {
      width: '600px',
      disableClose: true,
      autoFocus: false,
      data: obj
    });
    dialogRef.afterClosed().subscribe(result => {
      if(result == 'yes' && obj){
        this.onClearFilter();
        this.pageNumber = obj?.pageNumber;
      }else if(result == 'yes'){
        this.onClearFilter();
        this.pageNumber = 1;
      }
      this.highLightFlag = false;
      this.languageChange();
    });
  }

  //#region ------------------------------------------------ delete record start here --------------------------------------------------------
  globalDialogOpen(obj: any) {
    let dialoObj = {
      img: 'assets/images/trash.gif',
      header: 'Delete',
      title: this.webStorageS.languageFlag == 'EN' ? 'Do you want to delete Biometric Device?' : 'तुम्हाला बायोमेट्रिक उपकरण हटवायची आहे का?',
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
    this.apiService.setHttp('delete', 'zp-satara/BioMetricDevice/Delete', false, deleteObj, false, 'baseUrl');
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
  //#endregion --------------------------------------------- delete record end here ----------------------------------------------------------

  //#region ------------------------------------------------ onChange dropdown start here ----------------------------------------------------
  onChangeDropD(label: string) {
    switch (label) {
      case 'state':
        this.filterForm.controls['districtId'].setValue(0);
        this.filterForm.controls['talukaId'].setValue(0);
        this.filterForm.controls['centerId'].setValue(0);
        this.filterForm.controls['villageId'].setValue(0);
        this.filterForm.controls['schoolId'].setValue(0);
        this.talukaArr = [];
        this.centerArr = [];
        this.villageArr = [];
        this.schoolArr = [];
        break;
      case 'district':
        this.filterForm.controls['talukaId'].setValue(0);
        this.filterForm.controls['centerId'].setValue(0);
        this.filterForm.controls['villageId'].setValue(0);
        this.filterForm.controls['schoolId'].setValue(0);
        this.centerArr = [];
        this.villageArr = [];
        this.schoolArr = [];
        break;
      case 'taluka':
        this.filterForm.controls['centerId'].setValue(0);
        this.filterForm.controls['villageId'].setValue(0);
        this.filterForm.controls['schoolId'].setValue(0);
        this.villageArr = [];
        this.schoolArr = [];
        break;
      case 'center':
        this.filterForm.controls['villageId'].setValue(0);
        this.filterForm.controls['schoolId'].setValue(0);
        this.schoolArr = [];
        break;
      case 'village':
        this.filterForm.controls['schoolId'].setValue(0);
        break;
    }
  }
  //#endregion --------------------------------------------- onChange dropdown end here ------------------------------------------------------ 
}


