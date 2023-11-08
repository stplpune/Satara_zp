import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, HostBinding, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { DownloadPdfExcelService } from 'src/app/core/services/download-pdf-excel.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { WebStorageService } from 'src/app/core/services/web-storage.service';
import { GlobalDetailComponent } from 'src/app/shared/components/global-detail/global-detail.component';
import { GlobalDialogComponent } from 'src/app/shared/components/global-dialog/global-dialog.component';
import { AddUpdateTeacherRegistrationComponent } from './add-update-teacher-registration/add-update-teacher-registration.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { ValidationService } from 'src/app/core/services/validation.service';
import { DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { MasterService } from 'src/app/core/services/master.service';

@Component({
  selector: 'app-teacher-registration',
  templateUrl: './teacher-registration.component.html',
  styleUrls: ['./teacher-registration.component.scss']
})
export class TeacherRegistrationComponent implements OnInit {
  pageNumber: number = 1;
  searchContent = new FormControl('');
  stateId = new FormControl(0);
  districtId = new FormControl(0);
  talukaId = new FormControl(0);
  clusterId = new FormControl(0);
  villageId = new FormControl(0);
  tableDataArray = new Array();
  totalCount: number = 0;
  cardCurrentPage: number = 0;
  deleteObj: any;
  resultDownloadArr = new Array();
  langTypeName: any;
  tableDatasize!: Number;
  tableData: any;
  displayedColumns = new Array();
  toggleControl = new FormControl(false);
  cardViewFlag: boolean = false;
  langChnge!: Subscription;
  displayedheadersEnglish = ['Sr. No.', '', 'Teacher Name', 'Teacher ID', 'Mobile No.', 'Email ID', 'Taluka', 'Cluster', 'Unblock/Block', 'action'];
  displayedheadersMarathi = ['अनुक्रमांक', '', 'शिक्षकाचे नाव', 'शिक्षक आयडी', 'मोबाईल क्र.', 'ई-मेल आयडी ', 'तालुका', 'केंद्र', 'अनब्लॉक/ब्लॉक', 'कृती'];
  isWriteRight!: boolean;
  highLightFlag: boolean = true;
  stateArr = new Array();
  districtArr = new Array();
  talukaArray = new Array();
  clusterArray = new Array();
  villageArray = new Array();
  viewStatus = 'Table';
  @HostBinding('class') className = '';
  constructor(private dialog: MatDialog, private overlay: OverlayContainer, private apiService: ApiService, private errors: ErrorsService,
    public webStorageS: WebStorageService, private downloadFileService: DownloadPdfExcelService, private commonMethodS: CommonMethodsService,
    private ngxSpinner: NgxSpinnerService, public validation: ValidationService, public datepipe: DatePipe, private masterService: MasterService) {
  }

  ngOnInit(): void {
    this.langChnge = this.webStorageS.langNameOnChange.subscribe(lang => {
      this.langTypeName = lang;
      this.languageChange();
    });
    this.getIsWriteFunction();
    this.getTableData();
    this.getState();
    // this.getDistrict();
    // this.getAllTaluka();

    this.toggleControl.valueChanges.subscribe((darkMode) => {
      const darkClassName = 'darkMode';
      this.className = darkMode ? darkClassName : '';
      if (darkMode) {
        this.overlay.getContainerElement().classList.add(darkClassName);
      } else {
        this.overlay.getContainerElement().classList.remove(darkClassName);
      }
    });
  }

  getIsWriteFunction() {
    let print = this.webStorageS?.getAllPageName().find((x: any) => {
      return x.pageURL == "teacher-registration"
    });
    (print.writeRight === true) ? this.isWriteRight = true : this.isWriteRight = false
  }

  languageChange() {
    // this.webStorageS.langNameOnChange.subscribe(lang => {
    //   this.langTypeName = lang;
    this.highLightFlag = true;
    let displayedColumnsReadMode = ['srNo', 'uploadImage', this.langTypeName == 'English' ? 'name' : 'm_Name', 'teacherCode', 'mobileNo', 'emailId', this.langTypeName == 'English' ? 'taluka' : 'm_Taluka', this.langTypeName == 'English' ? 'center' : 'm_Center'];
    this.displayedColumns = ['srNo', 'uploadImage', this.langTypeName == 'English' ? 'name' : 'm_Name', 'teacherCode', 'mobileNo', 'emailId', this.langTypeName == 'English' ? 'taluka' : 'm_Taluka', this.langTypeName == 'English' ? 'center' : 'm_Center', 'isBlock', 'action'];
    this.tableData = {
      pageNumber: this.pageNumber,
      img: 'uploadImage', blink: '', badge: '', isBlock: 'isBlock', pagintion: true, defaultImg: "defaultUserImg",
      email: 'emailId',
      displayedColumns: this.isWriteRight === true ? this.displayedColumns : displayedColumnsReadMode,
      tableData: this.tableDataArray,
      tableSize: this.tableDatasize,
      tableHeaders: this.langTypeName == 'English' ? this.displayedheadersEnglish : this.displayedheadersMarathi,
      edit: true
    };
    this.highLightFlag ? this.tableData.highlightedrow = true : this.tableData.highlightedrow = false,
      this.apiService.tableData.next(this.tableData);
    // });
  }

  onPagintion(pageNo: number) {
    this.pageNumber = pageNo;
    this.getTableData()
  }

  getTableData(flag?: string) {
    this.ngxSpinner.show();
    this.pageNumber = flag == 'filter' ? 1 : this.pageNumber;
    // if (flag == 'filter' && !this.searchContent.value) {
    //   this.ngxSpinner.hide();
    //   return
    // }
    // let tableDatasize!: Number;
    let pageNo = this.cardViewFlag ? (this.pageNumber) : this.pageNumber;

    let str = `pageno=${pageNo}&pagesize=10&textSearch=${this.searchContent.value}&DistrictId=1&TalukaId=${this.talukaId.value || 0}&CenterId=${this.clusterId.value || 0}&lan=${this.webStorageS.languageFlag}`;
    let reportStr = `pageno=${pageNo}&pagesize=${this.totalCount * 10}&textSearch=${this.searchContent.value}&DistrictId=1&TalukaId=${this.talukaId.value || 0}&CenterId=${this.clusterId.value || 0}&lan=${this.webStorageS.languageFlag}`;

    this.apiService.setHttp('GET', 'zp-satara/Teacher/GetAll?' + ((flag == 'pdfFlag' || flag == 'excel') ? reportStr : str), false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({

      next: (res: any) => {

        if (res.statusCode == "200") {
          this.ngxSpinner.hide();
          (flag != 'pdfFlag' && flag != 'excel') ? this.tableDataArray = res.responseData.responseData1 : this.tableDataArray = this.tableDataArray;

          // this.tableDataArray = res.responseData.responseData1;
          this.totalCount = res.responseData.responseData2.pageCount;
          this.tableDatasize = res.responseData.responseData2.pageCount;
          this.resultDownloadArr = [];
          let data: [] = (flag == 'pdfFlag' || flag == 'excel') ? res.responseData.responseData1 : [];
          flag == 'pdfFlag' ? this.downloadPdf(data, 'pdfFlag') : flag == 'excel' ? this.downloadPdf(data, 'excel') : '';
        } else {
          this.ngxSpinner.hide();
          this.tableDataArray = [];
          this.tableDatasize = 0;
          this.tableDatasize == 0 && flag == 'pdfFlag' ? this.commonMethodS.showPopup(this.webStorageS.languageFlag == 'EN' ? 'No Record Found' : 'रेकॉर्ड उपलब्ध नाही', 1) : '';
        }
        this.languageChange();
        // let displayedColumns = ['uploadImage','srNo', 'name', 'mobileNo', 'emailId', 'village', 'taluka', 'action'];
        // let displayedheaders = ['#','Sr. No.', 'Teacher Name', 'Mobile No.', 'Email ID', 'Village', 'Taluka', 'action'];
        // let tableData = {
        //   pageNumber: this.pageNumber,
        //   img: 'uploadImage', blink: '', badge: '', isBlock: '', pagintion: true,
        //   displayedColumns: displayedColumns, tableData: this.tableDataArray,
        //   tableSize: tableDatasize,
        //   tableHeaders: displayedheaders
        // };
        // this.apiService.tableData.next(tableData);
      },
      error: ((err: any) => { this.commonMethodS.checkEmptyData(err.statusText) == false ? this.errors.handelError(err.statusCode) : this.commonMethodS.showPopup(err.statusText, 1); })
      // error: ((err: any) => { this.errors.handelError(err) })
    });
  }

  getState(){
    this.stateArr = [
      {"id": 0, "state": "All", "m_State": "सर्व"},
      {"id": 1, "state": "Maharashtra", "m_State": "महाराष्ट्र"}
    ];
  }

  getDistrict() {
    this.masterService.getAllDistrict('').subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.districtArr.push({"id": 0, "district": "All", "m_District": "सर्व"}, ...res.responseData);
          // this.districtId.setValue(this.districtArr[0].id);
        }
        else {
          this.districtArr = [];
        }
      },
      error: ((err: any) => { this.commonMethodS.checkEmptyData(err.statusText) == false ? this.errors.handelError(err.statusCode) : this.commonMethodS.showPopup(err.statusText, 1); })
    });
  }

  getAllTaluka() {
    this.talukaArray = [];
    // let districtId = this.districtId.value;
    this.masterService.getAllTaluka(this.webStorageS.languageFlag).subscribe({
      next: ((res: any) => {
        if (res.statusCode == "200" && res.responseData.length) {
          this.talukaArray.push({ "id": 0, "taluka": "All", "m_Taluka": "सर्व" }, ...res.responseData);
        } else {
          this.commonMethodS.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethodS.showPopup(res.statusMessage, 1);
          this.talukaArray = [];
        }
      })
    })
  }

  getCluster() {
    this.clusterArray = [];
    let talukaFilterId = this.talukaId.value;

    this.masterService.getAllCenter(this.webStorageS.languageFlag, talukaFilterId).subscribe({
      next: ((res: any) => {
        if (res.statusCode == "200" && res.responseData.length) {
          this.clusterArray.push({ "id": 0, "center": "All", "m_Center": "सर्व" }, ...res.responseData);
        } else {
          this.commonMethodS.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethodS.showPopup(res.statusMessage, 1);
          this.clusterArray = [];
        }
      })
    });
  }

  getVillage() {
    this.villageArray = [];
    let centerId = this.clusterId.value;
    console.log("centerId : ", centerId);

    this.masterService.getAllVillage(this.webStorageS.languageFlag, centerId).subscribe({
      next: ((res: any) => {
        if (res.statusCode == "200" && res.responseData.length) {
          this.villageArray.push({ "id": 0, "village": "All", "m_Village": "सर्व" }, ...res.responseData);
        } else {
          this.commonMethodS.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethodS.showPopup(res.statusMessage, 1);
          this.clusterArray = [];
        }
      })
    })
  }

  //#endregion ---------------------------------------------- PDF Download start here ----------------------------------------// 
  // convert number in marathi

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
      let obj = {
        "Sr.No": (i + 1),
        "Name": flag == 'excel' ? this.langTypeName == 'English' ? ele.name : ele.m_Name : ele.name,
        "Teacher ID": ele.teacherCode,
        "Contact No.": ele.mobileNo,
        "Email ID": ele.emailId,
        "Taluka": flag == 'excel' ?this.langTypeName == 'English' ? ele.taluka : ele.m_Taluka:ele.taluka,
        "Cluster":flag == 'excel' ? this.langTypeName == 'English' ? ele.center : ele.m_Center: ele.center
      }
      // if(flag == 'excel'){
      //   let obj = {
      //     "Sr.No":this.langTypeName == 'English' ?(i + 1):this.convertToMarathiNumber(i+1),
      //     "Name":this.langTypeName == 'English'? ele.name :ele.m_Name,
      //     "Teacher ID" :ele.teacherCode ,
      //     "Contact No.": ele.mobileNo,
      //     "Email ID": ele.emailId,
      //     "Taluka":this.langTypeName == 'English'? ele.taluka : ele.m_Taluka,
      //     "Cluster":this.langTypeName == 'English'?  ele.center : ele.m_Center
      //   }
      //   this.resultDownloadArr.push(obj);
      // }else if(flag == 'pdfFlag'){
      //   let obj = {
      //     "Sr.No": i + 1,
      //     "Name": ele.name,
      //     "Teacher ID" : ele.teacherCode,
      //     "Contact No.": ele.mobileNo,
      //     "Email ID": ele.emailId,
      //     "Taluka": ele.taluka,
      //     "Cluster": ele.center
      //   }
      this.resultDownloadArr.push(obj);
      // }

    });
    // download pdf call
    if (this.resultDownloadArr?.length > 0) {
      let keyPDFHeader = ["Sr.No ", "Teacher Name", "Teacher ID", "Mobile No.", "Email ID", "Taluka", "Cluster"];
      let marathiKeyHeader = ['अनुक्रमांक', 'शिक्षकाचे नाव', 'शिक्षक आयडी', 'मोबाईल क्र.', 'ई-मेल आयडी ', 'तालुका', 'केंद्र', 'अनब्लॉक/ब्लॉक'];
      let ValueData =
        this.resultDownloadArr.reduce(
          (acc: any, obj: any) => [...acc, Object.values(obj).map((value) => value)], []
        );

      let objData: any;
      // if (flag == 'excel') {
      //   objData = {
      //     'topHedingName': this.langTypeName == 'English' ? 'Teacher List' : 'शिक्षकांची यादी',
      //     'createdDate': this.langTypeName == 'English' ? 'Created on:' + this.datepipe.transform(new Date(), 'yyyy-MM-dd, h:mm a') : 'रोजी तयार केले :' + this.datepipe.transform(new Date(), 'yyyy-MM-dd, h:mm a')
      //   }
      // } else if (flag == 'pdfFlag') {
      //   objData = {
      //     'topHedingName': 'Teacher List',
      //     'createdDate': 'Created on:' + this.datepipe.transform(new Date(), 'yyyy-MM-dd, h:mm a')
      //   }
      // }

      objData= {
        'topHedingName': flag == 'excel' ? this.langTypeName == 'English' ? 'Teacher List' : 'शिक्षकांची यादी' : 'Teacher List',
        'createdDate': (flag == 'excel' ? this.langTypeName == 'English' ? 'Created on:' : 'रोजी तयार केले :' : 'Created on:')+ this.datepipe.transform(new Date(), 'yyyy-MM-dd, h:mm a')
      }

      let headerKeySize = [15, 15, 10, 15, 20, 20];
      flag == 'pdfFlag' ? this.downloadFileService.downLoadPdf(keyPDFHeader, ValueData, objData) : this.downloadFileService.allGenerateExcel(this.langTypeName == 'English' ? keyPDFHeader : marathiKeyHeader, ValueData, objData, headerKeySize);
    }
  }
  //#endregion ---------------------------------------------- PDF Download end here ----------------------------------------// 

  childCompInfo(_obj: any) {
    switch (_obj.label) {
      case 'Pagination':
        this.pageNumber = _obj.pageNumber;
        this.getTableData();
        break;
      case 'Edit':
        this.addUpdateTeacher(_obj);
        break;
      case 'Delete':
        this.globalDialogOpen(_obj);
        break;
      case 'View':
        this.openDetailsDialog(_obj);
        break;
      case 'Block':
        this.openBlockDialog(_obj);
    }
  }

  openBlockDialog(obj?: any) {
    let userEng = obj.isBlock == false ? 'Block' : 'Unblock';
    let userMara = obj.isBlock == false ? 'ब्लॉक' : 'अनब्लॉक';
    let dialoObj = {
      img: 'assets/images/unblock-gif.gif',
      header: this.langTypeName == 'English' ? userEng + ' Teacher' : userMara + ' शिक्षक',
      title: this.langTypeName == 'English' ? 'Do You Want To ' + userEng + ' The Teacher?' : 'आपण शिक्षक ' + userMara + ' करू इच्छिता?',
      cancelButton: this.langTypeName == 'English' ? 'Cancel' : 'रद्द करा',
      okButton: this.langTypeName == 'English' ? 'Ok' : 'ओके'
    }
    const deleteDialogRef = this.dialog.open(GlobalDialogComponent, {
      width: '320px',
      data: dialoObj,
      disableClose: true,
      autoFocus: false
    })
    deleteDialogRef.afterClosed().subscribe((result: any) => {
      result == 'yes' ? this.blockOffice(obj) : this.getTableData();
      this.highLightFlag = false;
      this.languageChange();
    })
  }

  blockOffice(obj: any) {
    let webStorageMethod = this.webStorageS.createdByProps();
    let blockObj = {
      "refId": obj.id,
      "isBlock": !obj.isBlock,
      "blockDate": webStorageMethod.modifiedDate,
      "blockBy": this.webStorageS.getUserId(),
      "userTypeId": obj.teacherDetails?.designationLevelId,
      "subUserTypeId": obj.teacherDetails?.designationId
    }
    this.apiService.setHttp('put', 'zp-satara/user-registration/BlockUnblockUser', false, blockObj, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        res.statusCode == "200" ? (this.commonMethodS.showPopup(res.statusMessage, 0), this.getTableData()) : this.commonMethodS.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethodS.snackBar(res.statusMessage, 1);
      },
      error: (error: any) => {
        this.errors.handelError(error.status);
        this.commonMethodS.checkEmptyData(error.status) == false ? this.errors.handelError(error.status) : this.commonMethodS.snackBar(error.status, 1);
      }
    });
  }

  childGridInfo(obj: any) {
    switch (obj.label) {
      case 'Pagination':
        this.pageNumber = obj.pageNumber;
        this.getTableData();
        break;
      case 'Edit':
        this.addUpdateTeacher(obj);
        break;
      case 'Delete':
        this.globalDialogOpen(obj);
        break;
      case 'View':
        this.openDetailsDialog(obj);
        break;
      case 'Block':
        this.openBlockDialog(obj);
    }
  }

  addUpdateTeacher(obj?: any) {
    // let obj: any;
    const dialogRef = this.dialog.open(AddUpdateTeacherRegistrationComponent, {
      width: '900px',
      data: obj,
      disableClose: true,
      autoFocus: false
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result == 'Yes' && obj) {
        this.pageNumber = this.pageNumber;
        this.clearFilterData();
        // this.getTableData();
      }
      else if (result == 'Yes') {
        this.pageNumber = 1;
        this.clearFilterData();
      }
      this.highLightFlag = false;
      this.languageChange();
    });
  }

  globalDialogOpen(obj: any) {
    this.deleteObj = obj;
    let dialoObj = {
      header: 'Delete',
      title: this.webStorageS.languageFlag == 'EN' ? 'Do You Want To Delete Teacher Record?' : 'तुम्हाला शिक्षकाचा रेकॉर्ड हटवायचा आहे का?',
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
        this.onClickDelete();
      }
      this.highLightFlag = false;
      this.languageChange();
    })
  }

  onClickDelete() {
    let webStorageMethod = this.webStorageS.createdByProps();
    let deleteObj = {
      "id": this.deleteObj.id,
      "modifiedBy": webStorageMethod.modifiedBy,
      "modifiedDate": webStorageMethod.modifiedDate,
      "lan": this.webStorageS.languageFlag
    }
    this.apiService.setHttp('delete', 'zp-satara/Teacher/Delete', false, deleteObj, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.commonMethodS.showPopup(res.statusMessage, 0);
          this.getTableData();
        }
      }
    })
    error: (error: any) => {
      this.commonMethodS.checkEmptyData(error.statusText) == false ? this.errors.handelError(error.statusCode) : this.commonMethodS.showPopup(error.statusText, 1);
    }
  }

  clearFilterData() {
    if (this.searchContent.value != null && this.searchContent.value != '' || this.talukaId.value || this.clusterId.value) {
      this.searchContent.setValue('');
      this.stateId.setValue(0);
      this.districtId.setValue(0);
      this.districtArr = [];
      this.talukaArray = [];
      this.clusterArray = [];
      this.villageArray = [];
      this.talukaId.setValue(0);
      this.clusterId.setValue(0);
      this.getTableData();
    }
    else {
      this.getTableData();
    }
  }

  selectGrid(label: string) {
    this.viewStatus = label
    if (label == 'Table') {
      this.cardViewFlag = false;
      this.pageNumber = 1;
      this.cardCurrentPage = 0;
      this.clearFilterData();
    } else if (label == 'Card')
      this.cardViewFlag = true;

    this.clearFilterData();
  }

  onPageChanged(event: any) {
    this.cardCurrentPage = event.pageIndex;
    this.selectGrid('Card');
  }

  openDetailsDialog(obj: any) {
    var data = {
      headerImage: obj.uploadImage,
      header: this.webStorageS.languageFlag == 'EN' ? obj.name : obj.m_Name,
      subheader: this.webStorageS.languageFlag == 'EN' ? obj.gender : obj.m_Gender,
      labelHeader: this.webStorageS.languageFlag == 'EN' ? ['Mobile No.', 'Email ID', 'Village', 'Taluka', 'UserName', 'Password'] : ['मोबाईल क्र.', 'ई-मेल आयडी ', 'गाव', 'तालुका', 'वापरकर्तानाव', 'पासवर्ड'],
      labelKey: this.webStorageS.languageFlag == 'EN' ? ['mobileNo', 'emailId', 'village', 'taluka', 'userName', 'password'] : ['mobileNo', 'emailId', 'village', 'taluka', 'userName', 'password'],
      Obj: obj,
      chart: false,
      checkbox: this.webStorageS.languageFlag == 'EN' ? 'Subject' : 'विषय',
      schoolName: this.webStorageS.languageFlag == 'EN' ? 'School Name' : 'शाळेचे नाव'
    }
    const viewDialogRef = this.dialog.open(GlobalDetailComponent, {
      width: '900px',
      data: data,
      disableClose: true,
      autoFocus: false
    });
    viewDialogRef.afterClosed().subscribe((result: any) => {
      if (result == 'yes') {
        this.getTableData();
      }
      this.highLightFlag = false;
      this.languageChange();
    });
  }

  onChangeFilter(label: string) {
    switch (label) {
      case 'state':
        this.districtId.setValue(0);
        this.talukaId.setValue(0);
        this.clusterId.setValue(0);
        this.villageId.setValue(0);
        this.talukaArray = [];
        this.clusterArray = [];
        this.villageArray = [];
        break;
      case 'district':
        this.talukaId.setValue(0);
        this.clusterId.setValue(0);
        this.villageId.setValue(0);
        this.clusterArray = [];
        this.villageArray = [];
        break;
      case 'taluka':
        this.clusterId.setValue(0);
        this.villageId.setValue(0);
        this.villageArray = [];
        break;
      case 'cluster':
        this.villageId.setValue(0);
    }
  }
}
