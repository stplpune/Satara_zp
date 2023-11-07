import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'src/app/core/services/api.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { MasterService } from 'src/app/core/services/master.service';
import { GlobalDialogComponent } from 'src/app/shared/components/global-dialog/global-dialog.component';
import { AddUpdateSchoolRegistrationComponent } from './add-update-school-registration/add-update-school-registration.component';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { WebStorageService } from 'src/app/core/services/web-storage.service';
import { DownloadPdfExcelService } from 'src/app/core/services/download-pdf-excel.service';
import { GlobalDetailComponent } from 'src/app/shared/components/global-detail/global-detail.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { AesencryptDecryptService } from 'src/app/core/services/aesencrypt-decrypt.service';

@Component({
  selector: 'app-school-registration',
  templateUrl: './school-registration.component.html',
  styleUrls: ['./school-registration.component.scss']
})
export class SchoolRegistrationComponent implements OnInit {
  pageNumber: number = 1;
  tableDataArray = new Array();
  // searchContent = new FormControl('');
  districtId = new FormControl(0);
  talukaId = new FormControl(0);
  centerId = new FormControl(0);
  villageId = new FormControl(0);
  searchContent = new FormControl('');
  resultDownloadArr = new Array();
  districtArr = new Array();
  talukaArr = new Array();
  centerArr = new Array();
  villageArr = new Array();
  deleteObj: any;
  cardViewFlag: boolean = false;
  imgPath: any;
  totalCount: number = 0;
  langTypeName: any;
  displayedColumns = new Array();
  tableDatasize!: Number;
  tableData: any;
  isWriteRight!: boolean;
  highLightFlag: boolean = true;
  userId!: number;
  displayedheadersEnglish = ['Sr. No.', '', 'School Name', 'Taluka', 'Kendra', 'Village', 'Action'];
  displayedheadersMarathi = ['अनुक्रमांक', '', 'शाळेचे नाव', 'तालुका', 'केंद्र', 'गाव', 'कृती'];
  viewStatus = 'Table';
  constructor(private dialog: MatDialog,
    private apiService: ApiService,
    private errors: ErrorsService,
    private masterService: MasterService,
    private commonMethodS: CommonMethodsService,
    public webStorageS: WebStorageService,
    private downloadFileService: DownloadPdfExcelService,
    private ngxSpinner: NgxSpinnerService,
    public datepipe: DatePipe,
    private router: Router,
    private encryptdecrypt: AesencryptDecryptService,
  ) { }

  ngOnInit() {
    this.getIsWriteFunction();
    this.getTableData();
    this.getDistrict();
    // this.getofficeReport();
    this.userId = this.webStorageS.getUserTypeId();

    this.webStorageS.langNameOnChange.subscribe(lang => {
      this.langTypeName = lang;
      this.languageChange();
    });
  }

  getIsWriteFunction() {
    let print = this.webStorageS?.getAllPageName().find((x: any) => {
      return x.pageURL == "school-registration"
    });
    (print.writeRight === true) ? this.isWriteRight = true : this.isWriteRight = false
  }

  // onPagintion(pageNo: number) {
  //   this.pageNumber = pageNo;
  //   this.getTableData();
  // }

  //#region ------------------------------------------- School Registration Table Data start here ----------------------------------------// 

  languageChange() {
    this.highLightFlag = true;
    let displayedColumnsReadMode = ['srNo', 'uploadImage', this.langTypeName == 'English' ? 'schoolName' : 'm_SchoolName', this.langTypeName == 'English' ? 'taluka' : 'm_Taluka', this.langTypeName == 'English' ? 'center' : 'm_Center', this.langTypeName == 'English' ? 'village' : 'm_Village'];
    this.displayedColumns = ['srNo', 'uploadImage', this.langTypeName == 'English' ? 'schoolName' : 'm_SchoolName', this.langTypeName == 'English' ? 'taluka' : 'm_Taluka', this.langTypeName == 'English' ? 'center' : 'm_Center', this.langTypeName == 'English' ? 'village' : 'm_Village', 'action'];
    this.tableData = {
      pageNumber: this.pageNumber,
      img: 'uploadImage', blink: '', badge: '', isBlock: '', pagintion: true, defaultImg: "defaultSchoolImg",
      displayedColumns: this.isWriteRight === true ? this.displayedColumns : displayedColumnsReadMode,
      tableData: this.tableDataArray,
      tableSize: this.tableDatasize,
      tableHeaders: this.langTypeName == 'English' ? this.displayedheadersEnglish : this.displayedheadersMarathi,
      edit: true
    };
    this.highLightFlag ? this.tableData.highlightedrow = true : this.tableData.highlightedrow = false,
      this.apiService.tableData.next(this.tableData);
  }

  getTableData(flag?: string) {
    // this.tableDataArray = [];
    this.ngxSpinner.show();
    this.pageNumber = flag == 'filter' ? 1 : this.pageNumber;
    let pageNo = this.cardViewFlag ? (this.pageNumber) : this.pageNumber;
    let str = `?pageno=${pageNo}&pagesize=10&DistrictId=${this.districtId.value ? this.districtId.value : 0}
    &TalukaId=${this.talukaId.value ? this.talukaId.value : 0}&VillageId=${this.villageId.value ? this.villageId.value : 0}&CenterId=${this.centerId.value ? this.centerId.value : 0}&TextSearch=${this.searchContent.value ? this.searchContent.value : ''}&lan=${this.webStorageS.languageFlag}`;

    let reportStr = `?pageno=1&pagesize=` + (this.totalCount * 10) + `&DistrictId=${this.districtId.value ? this.districtId.value : 0}
    &TalukaId=${this.talukaId.value ? this.talukaId.value : 0}&VillageId=${this.villageId.value ? this.villageId.value : 0}&CenterId=${this.centerId.value ? this.centerId.value : 0}&TextSearch=${this.searchContent.value ? this.searchContent.value : ''}&lan=${this.webStorageS.languageFlag}`;

    this.apiService.setHttp('GET', 'zp-satara/School/GetAll' + ((flag == 'pdfFlag' || flag == 'excel') ? reportStr : str), false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({

      next: (res: any) => {
        if (res.statusCode == "200") {
          this.ngxSpinner.hide();
          (flag != 'pdfFlag' && flag != 'excel') ? this.tableDataArray = res.responseData.responseData1 : this.tableDataArray = this.tableDataArray;
          this.totalCount = res.responseData.responseData2.pageCount;
          this.tableDatasize = res.responseData.responseData2.pageCount;
          this.resultDownloadArr = [];
          let data: [] = (flag == 'pdfFlag' || flag == 'excel') ? res.responseData.responseData1 : [];
          flag == 'pdfFlag' ? this.downloadPdf(data, 'pdfFlag') : flag == 'excel' ? this.downloadPdf(data, 'excel') : '';
        }
        else {
          this.ngxSpinner.hide();
          this.tableDataArray = [];
          this.tableDatasize = 0;
          this.tableDatasize == 0 && flag == 'pdfFlag' ? this.commonMethodS.showPopup(this.webStorageS.languageFlag == 'EN' ? 'No Record Found' : 'रेकॉर्ड उपलब्ध नाही', 1) : '';
        }
        this.languageChange();
      },
      error: ((err: any) => { this.commonMethodS.checkEmptyData(err.statusText) == false ? this.errors.handelError(err.statusCode) : this.commonMethodS.showPopup(err.statusText, 1); })
    });
  }
  //#endregion ------------------------------------------- School Registration Table Data end here ----------------------------------------// 

  //#endregion ---------------------------------------------- PDF Download start here ----------------------------------------// 

  //convert number into marathi

  // private marathiDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  // convertToMarathiNumber(number: number): string {
  //   const englishNumberString = number.toString();
  //   let marathiNumberString = '';
  //   for (let i = 0; i < englishNumberString.length; i++) {
  //     const digit = parseInt(englishNumberString[i], 10);
  //     marathiNumberString += this.marathiDigits[digit];
  //   }
  //   return marathiNumberString;
  // }


  downloadPdf(data: any, flag?: string) {
    console.log("flag", flag);
    console.log("data", data);

    this.resultDownloadArr = [];
    data.find((ele: any, i: any) => {
      let obj = {
        srNo:  (i + 1),
        schoolName: flag == 'excel' ? this.langTypeName == 'English' ? ele.schoolName : ele.m_SchoolName : ele.schoolName,
        taluka: flag == 'excel' ? this.langTypeName == 'English' ? ele.taluka : ele.m_Taluka : ele.taluka,
        center: flag == 'excel' ? this.langTypeName == 'English' ? ele.center : ele.m_Center : ele.center,
        village: flag == 'excel' ? this.langTypeName == 'English' ? ele.village : ele.m_Village : ele.village,
      }
      // if(flag == 'excel'){
      //   let obj = {
      //     srNo: this.langTypeName == 'English' ? (i + 1) : this.convertToMarathiNumber(i+1),
      //     schoolName: this.langTypeName == 'English' ? ele.schoolName : ele.m_SchoolName,
      //     taluka:  this.langTypeName == 'English' ? ele.taluka : ele.m_Taluka,
      //     center:this.langTypeName == 'English' ? ele.center : ele.m_Center,
      //     village:this.langTypeName == 'English' ? ele.village : ele.m_Village,
      //   }
      //   this.resultDownloadArr.push(obj);
      // }else if( flag == 'pdfFlag'){
      //   let obj = {
      //     srNo: i + 1,
      //     schoolName: ele.schoolName,
      //     taluka: ele.taluka,
      //     center: ele.center,
      //     village: ele.village,
      //   }
      this.resultDownloadArr.push(obj);
      // }

    });
    // download pdf call
    if (this.resultDownloadArr?.length > 0) {
      let keyPDFHeader = ["Sr.No", "School Name", "Taluka", "Kendra", "Village"];
      let marathikeyHeader = ['अनुक्रमांक', 'शाळेचे नाव', 'तालुका', 'केंद्र', 'गाव']
      let ValueData =
        this.resultDownloadArr.reduce(
          (acc: any, obj: any) => [...acc, Object.values(obj).map((value) => value)], []
        );
      let objData: any
      // if (flag == 'excel') {
      //   objData = {
      //     'topHedingName': this.langTypeName == 'English' ? 'School List' : 'शाळेची यादी',
      //     'createdDate': this.langTypeName == 'English' ? 'Created on:' + this.datepipe.transform(new Date(), 'yyyy-MM-dd, h:mm a') : 'रोजी तयार केले :' + this.datepipe.transform(new Date(), 'yyyy-MM-dd, h:mm a')
      //   }
      // } else if (flag == 'pdfFlag') {
      //   objData = {
      //     'topHedingName': 'School List',
      //     'createdDate': 'Created on:' + this.datepipe.transform(new Date(), 'yyyy-MM-dd, h:mm a')
      //   }
      // }

      objData= {
        'topHedingName': flag == 'excel' ? this.langTypeName == 'English' ? 'School List' : 'शाळेची यादी' : 'School List',
        'createdDate': (flag == 'excel' ? this.langTypeName == 'English' ? 'Created on:' : 'रोजी तयार केले :' : 'Created on:')+ this.datepipe.transform(new Date(), 'yyyy-MM-dd, h:mm a')
      }

      let headerKeySize = [7, 40, 15, 15, 15,];
      flag == 'pdfFlag' ? this.downloadFileService.downLoadPdf(keyPDFHeader, ValueData, objData) : this.downloadFileService.allGenerateExcel(this.langTypeName == 'English' ? keyPDFHeader : marathikeyHeader, ValueData, objData, headerKeySize);
    }
  }
  //#endregion ---------------------------------------------- PDF Download end here ----------------------------------------// 


  //#region ---------------------------------------------- School Registration Dropdown start here ----------------------------------------// 
  getDistrict() {
    this.masterService.getAllDistrict('').subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.districtArr.push({"id": 0, "district": "All", "m_District": "सर्व"}, ...res.responseData) // this.districtArr = res.responseData;
          // this.districtId.setValue(this.districtArr[0].id);
          this.getTaluka();
        }
        else {
          this.districtArr = [];
        }
      },
      error: ((err: any) => { this.commonMethodS.checkEmptyData(err.statusText) == false ? this.errors.handelError(err.statusCode) : this.commonMethodS.showPopup(err.statusText, 1); })
    });
  }

  getTaluka() {
    // let districtId = this.districtId.value;
    this.masterService.getAllTaluka('').subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.talukaArr.push({ "id": 0, "taluka": "All", "m_Taluka": "सर्व" }, ...res.responseData);
        }
        else {
          this.talukaArr = [];
        }
      }
    });
  }

  getCenter() {
    this.centerArr = [];
    let talukaId: any = this.talukaId.value;
    this.masterService.getAllCenter('', talukaId).subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.centerArr.push({ "id": 0, "center": "All", "m_Center": "सर्व" }, ...res.responseData);
          this.centerId.setValue(0);
        }
        else {
          this.centerArr = [];
        }
      }
    });
  }


  getVillage() {
    this.villageArr = []
    let centerId = this.centerId.value;
    this.masterService.getAllVillage('', centerId).subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.villageArr = res.responseData;
          let obj = { id: 0, village: 'All', m_Village: 'सर्व' }
          this.villageArr.unshift(obj)
          this.villageId.setValue(0);
        }
        else {
          this.villageArr = [];
        }
      }
    });
  }
  //#endregion ------------------------------------------- School Registration Dropdown start here ----------------------------------------// 

  childCompInfo(obj: any) {
    switch (obj.label) {
      case 'Pagination':
        this.pageNumber = obj.pageNumber;
        this.getTableData();
        break;
      case 'Edit':
        this.addUpdateSchool(obj, 'school');
        break;
      case 'Delete':
        this.globalDialogOpen(obj);
        break;
      case 'View':
        this.openDetailsDialog(obj);
        break;
    }
  }

  childGridInfo(obj: any) {
    switch (obj.label) {
      case 'Pagination':
        this.pageNumber = obj.pageNumber;
        this.getTableData();
        break;
      case 'Edit':
        this.addUpdateSchool(obj);
        break;
      case 'Delete':
        this.globalDialogOpen(obj);
        break;
      case 'View':
        this.openDetailsDialog(obj);
        break;
    }
  }
  //#region ------------------------------------------- Open Dialog Box Function start here ----------------------------------------// 
  addUpdateSchool(obj?: any, flag?: any) {
    let data = {
      flag : flag,
      obj : obj
    }
    const dialogRef = this.dialog.open(AddUpdateSchoolRegistrationComponent, {
      width: '850px',
      data: data,
      disableClose: true,
      // autoFocus: false
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result == 'yes' && obj) {
        this.onClear();
        this.getDistrict();
        this.getTableData();
        this.pageNumber = obj.pageNumber;
      }
      else if (result == 'yes') {
        this.getDistrict();
        this.getTableData();
        this.onClear();
        this.pageNumber = 1;
      }
      this.highLightFlag = false;
      this.languageChange();
    });
  }

  globalDialogOpen(obj: any) {
    this.deleteObj = obj;
    let dialoObj = {
      header: 'Delete',
      title: this.webStorageS.languageFlag == 'EN' ? 'Do you want to delete School record?' : 'तुम्हाला शाळेचा रेकॉर्ड हटवायचा आहे का?',
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

  openDetailsDialog(obj: any) {
    let eventId: any = this.encryptdecrypt.encrypt(`${obj?.id}`);
    this.router.navigate(['/view-profile-school'], {
      queryParams: {
        id: eventId
      },
    })
    return;
    var data = {
      // headerImage: obj.uploadImage || "assets/images/user.png",
      headerImage: obj.uploadImage || "assets/images/School_svg.svg",
      header: this.webStorageS.languageFlag == 'EN' ? obj.schoolName : obj.m_SchoolName,
      subheader: this.webStorageS.languageFlag == 'EN' ? obj.schoolType : obj.m_SchoolType,
      labelHeader: this.webStorageS.languageFlag == 'EN' ? ['District', 'Taluka', 'Kendra Name', 'Village', 'Lowest Class', 'Highest Class', 'Total Students'] : ['जिल्हा', 'तालुका', 'केंद्राचे नाव', 'गाव', 'सुरुवातीचा वर्ग ', 'शेवटचा वर्ग', 'एकूण विद्यार्थी'],
      labelKey: this.webStorageS.languageFlag == 'EN' ? ['district', 'taluka', 'center', 'village', 'lowestClass', 'highestClass', 'studentCount'] : ['m_District', 'm_Taluka', 'm_Center', 'm_Village', 'lowestClass', 'highestClass', 'studentCount'],
      Obj: obj,
      chart: false,
      multipleImage: true
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
  //#endregion ------------------------------------------- Open Dialog Box Function end here ----------------------------------------// 

  onClear() {
    if (this.districtId.value || this.talukaId.value || this.villageId.value) {
      this.districtId.setValue(0);
      this.talukaId.setValue(0);
      this.centerId.setValue(0);
      this.villageId.setValue(0);
      this.searchContent.setValue('');
      // this.talukaArr = [];
      this.villageArr = [];
      this.centerArr = [];
      this.getTableData();
      this.pageNumber = 1;
    }
  }

  //#region ---------------------------------------------- Delete Record Logic start here ----------------------------------------//  
  onClickDelete() {
    let webStorageMethod = this.webStorageS.createdByProps();
    let deleteObj = {
      "id": this.deleteObj.id,
      "modifiedBy": webStorageMethod.modifiedBy,
      "modifiedDate": webStorageMethod.modifiedDate,
      "lan": this.webStorageS.languageFlag
    }
    this.apiService.setHttp('delete', 'zp-satara/School/Delete', false, deleteObj, false, 'baseUrl');
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
  //#endregion ---------------------------------------------- Delete Record Logic end here ----------------------------------------//  

  selectGrid(label: string) {
    this.viewStatus = label;
    if (label == 'Table') {
      this.cardViewFlag = false;
      this.pageNumber = 1;
      this.getTableData();
    } else if (label == 'Card')
      this.cardViewFlag = true;
    this.getTableData();
  }

  clearDropdown(dropdown: string) {
    if (dropdown == 'Taluka') {
      this.villageId.setValue(0);
      this.centerId.setValue(0);
      this.villageArr = [];
      this.centerArr = [];
    } else if (dropdown == 'centerId') {
      this.villageId.setValue(0);
    }
  }

}
