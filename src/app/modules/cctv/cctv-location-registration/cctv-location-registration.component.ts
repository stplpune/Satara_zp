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
import { Observable } from 'rxjs';
import { MasterService } from 'src/app/core/services/master.service';

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
  $districts?: Observable<any>;
  talukaArr = new Array();
  villageArr = new Array();
  centerArr = new Array();
  schoolArr = new Array();

  // displayedColumns = ['srNo', 'category', 'subCategory', 'itemName', 'description', 'action'];
  // marathiDisplayedColumns = ['srNo', 'm_Category', 'm_SubCategory', 'm_ItemName', 'description', 'action'];
  displayedheaders = ['Sr. No.', 'CCTV Name', 'CCTV Location', 'Registration Date', 'CCTV Model','Remark', 'action'];
  marathiDisplayedheaders = ['अनुक्रमांक', 'सीसीटीव्हीचे नाव', 'सीसीटीव्ही स्थान','नोंदणी दिनांक', 'सीसीटीव्ही मॉडेल', 'वर्णन', 'कृती'];

  constructor(public dialog: MatDialog,
    public webService: WebStorageService,
    private fb: FormBuilder,
    private ngxSpinner: NgxSpinnerService,
    private apiService: ApiService,
    private commonMethods: CommonMethodsService,
    private errors: ErrorsService,
    private downloadFileService: DownloadPdfExcelService,
    public datepipe: DatePipe,
    private masterService: MasterService
     ) {}


  ngOnInit() {
    this.languageFlag = this.webService.languageFlag;
    this.webService.langNameOnChange.subscribe(lang => {
      this.languageFlag = lang;
      this.setTableData();
    });
    this.filterFormData();
    this.getTableData();    
    this.getDistrict();
  }


  filterFormData() {
    this.filterForm = this.fb.group({
      districtId: [''],
      centerId : [''],
      TalukaId: [''],
      villageId: [''],     
      SchoolId: ['']
    });
  }

  getDistrict() {
    this.$districts = this.masterService.getAlllDistrict(this.languageFlag);
    console.log("district",this.$districts);
    
    // this.studentReportForm.controls['districtId'].setValue(1);
    this.getTaluka();
  }

  getTaluka() {
    this.talukaArr = [];
    this.masterService.getAllTaluka('').subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.talukaArr.push({ "id": 0, "taluka": "All", "m_Taluka": "सर्व" }, ...res.responseData);
          // this.logInDetails ? this.studentReportForm.controls['talukaId'].setValue(this.logInDetails?.talukaId): this.studentReportForm.controls['talukaId'].setValue(0), this.getAllCenter();
        } else {
          this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
          this.talukaArr = [];
        }
      },
      // error: ((err: any) => { this.errors.handelError(err.statusCode || err.status) })
    });
  }

  getAllCenter() {
    this.centerArr = [];
    let id = this.filterForm.value.TalukaId;
    console.log("Id",id);
    
    if (id != 0) {
      this.masterService.getAllCenter('', id).subscribe({
        next: (res: any) => {
          if (res.statusCode == 200) {
            this.centerArr.push({ "id": 0, "center": "All", "m_Center": "सर्व" }, ...res.responseData);
            console.log("this.centerArr",this.centerArr);
            
            // this.logInDetails ? this.studentReportForm.controls['centerId'].setValue(this.logInDetails?.centerId): this.studentReportForm.controls['centerId'].setValue(0), this.getVillage();
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
      this.masterService.getAllVillage('', Cid).subscribe({
        next: (res: any) => {
          if (res.statusCode == 200) {
            this.villageArr.push({ "id": 0, "village": "All", "m_Village": "सर्व" }, ...res.responseData);
            // this.logInDetails ? this.studentReportForm.controls['villageId'].setValue(this.logInDetails?.villageId): this.studentReportForm.controls['villageId'].setValue(0), this.getAllSchoolsByCenterId();
          } else {
            this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
            this.villageArr = [];
          }
        },
        // error: ((err: any) => { this.errors.handelError(err.statusCode || err.status) })
      });
    }

    getAllSchoolsByCenterId() {
      this.schoolArr = [];
      let Tid = this.filterForm.value.talukaId || 0;
      let Cid = this.filterForm.value.centerId || 0;
      let Vid = this.filterForm.value.villageId || 0;
      this.masterService.getAllSchoolByCriteria('', Tid, Vid, Cid).subscribe({
        next: (res: any) => {
          if (res.statusCode == 200) {
            this.schoolArr.push({ "id": 0, "schoolName": "All", "m_SchoolName": "सर्व" }, ...res.responseData);
            // this.logInDetails ? this.studentReportForm.controls['schoolId'].setValue(this.logInDetails?.schoolId): this.studentReportForm.controls['schoolId'].setValue(0);
          } else {
            this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
            this.schoolArr = [];
          }
        },
        // error: ((err: any) => { this.errors.handelError(err.statusCode || err.status) })
      });
    }

    // http://apisatara.shikshandarpan.com/zp-satara/CCTV/GetAllCCTV?DistrictId=1&TalukaId=1&VillageId=1&SchoolId=1&PageNo=1&PageSize=10&lan=EN
  
  getTableData(flag?: string) {
    let formValue = this.filterForm?.value
    this.ngxSpinner.show();
    this.pageNumber = flag == 'filter' ? 1 : this.pageNumber;
    
    let str = `DistrictId=${formValue?.districtId || 0}&TalukaId=${formValue?.TalukaId || 0}&VillageId=${formValue?.villageId || 0}&SchoolId=${formValue?.SchoolId || 0}&PageNo=${this.pageNumber}&PageSize=10&lan=${this.languageFlag}`
    let reportStr = `DistrictId=${formValue?.districtId || 0}&TalukaId=${formValue?.TalukaId || 0}&VillageId=${formValue?.villageId || 0}&SchoolId=${formValue?.SchoolId || 0}&PageNo=${this.pageNumber}&PageSize=10&lan=${this.languageFlag}`
    this.apiService.setHttp('GET', 'zp-satara/CCTV/GetAllCCTV?' + ((flag == 'pdfFlag' || flag == 'excel') ? reportStr : str), false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          console.log("respone",res);
          
          this.ngxSpinner.hide();
          (flag != 'pdfFlag' && flag != 'excel') ? this.tableDataArray = res.responseData.responseData1 : this.tableDataArray = this.tableDataArray;
          // (flag != 'excel') ? this.tableDataArray = res.responseData.responseData1 : this.tableDataArray = this.tableDataArray; 
          // this.tableDatasize = res.responseData.responseData2.pageCount
          let data: [] = (flag == 'pdfFlag' || flag == 'excel') ? res.responseData.responseData1 : [];
          flag == 'pdfFlag' ? this.downloadPdf(data, 'pdfFlag') : flag == 'excel' ? this.downloadPdf(data, 'excel') : '';
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
    let displayedColumnsReadMode = ['srNo', 'cctvName', this.languageFlag == 'English' ? 'cctvLocation' : 'm_CCTVLocation', 'registrationDate', 'cctvModel'];
    let displayedColumns = ['srNo','cctvName', this.languageFlag == 'English' ? 'cctvLocation' : 'm_CCTVLocation', 'registrationDate','cctvModel', 'action'];

    let tableData = {
      highlightedrow: true,
      pageNumber: this.pageNumber,
      img: 'docPath', blink: '', badge: '', isBlock: '', pagintion: this.tableDatasize > 10 ? true : false,
      displayedColumns: this.isWriteRight == true ? displayedColumns : displayedColumnsReadMode,
      tableData: this.tableDataArray,
      tableSize: this.tableDatasize,
      tableHeaders: this.languageFlag == 'English' ? this.displayedheaders : this.marathiDisplayedheaders,
      edit: true, delete: true,
    };
    this.highLightFlag ? tableData.highlightedrow = true : tableData.highlightedrow = false,
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

  childTableCompInfo(obj: any) {
    switch (obj.label) {
      case 'Pagination':
        this.pageNumber = obj.pageNumber;
        this.getTableData();
        break;
      case 'Edit':
        // this.addUpdateItem(obj);
        break;
      case 'Delete':
        // this.globalDialogOpen(obj);
        break;
      case 'View':
        // this.openDetailsDialog(obj);
        break;
    }
  }

  downloadPdf(data?: any, flag?: string) {
    this.resultDownloadArr = [];
    data.find((ele: any, i: any) => {    

      let obj: any;
      if (flag == 'excel') {
        obj = {
          srNo: this.languageFlag == 'English' ? (i + 1) : this.convertToMarathiNumber(i + 1),
          cctvName: ele.cctvName,
          cctvLocation: this.languageFlag == 'English' ? ele.cctvLocation : ele.m_CCTVLocation,
          registrationDate: ele.registrationDate,
          cctvModel: ele.cctvModel,
        }

      } else if (flag == 'pdfFlag') {
        obj = {
          srNo: i + 1,
          category: ele.cctvName,
          subCategory: ele.cctvLocation,
          itemName: ele.registrationDate,
          description: ele.cctvModel,
        }
      }
      this.resultDownloadArr.push(obj);
    });

    if (this.resultDownloadArr?.length > 0) {
      let keyPDFHeader = ['Sr. No.', 'CCTV Name', 'CCTV Location', 'Registration Date', 'CCTV Model','Remark'];;
      let MarathikeyPDFHeader = ['अनुक्रमांक', 'सीसीटीव्हीचे नाव', 'सीसीटीव्ही स्थान','नोंदणी दिनांक', 'सीसीटीव्ही मॉडेल', 'वर्णन'];
      let ValueData =
        this.resultDownloadArr.reduce(
          (acc: any, obj: any) => [...acc, Object.values(obj).map((value) => value)], []
        );

      let objData: any
      if (flag == 'excel') {
        objData = {
          'topHedingName':this.languageFlag == 'English' ? 'CCTV Location List':'सीसीटीव्ही स्थान सूची',
          'createdDate':this.languageFlag == 'English'?'Created on:'+this.datepipe.transform(new Date(), 'yyyy-MM-dd, h:mm a') : 'रोजी तयार केले :'+this.datepipe.transform(new Date(), 'yyyy-MM-dd, h:mm a')
        }
      } else if (flag == 'pdfFlag') {
        objData = {
          'topHedingName': 'CCTV Location List',
          'createdDate': 'Created on:' + this.datepipe.transform(new Date(), 'yyyy-MM-dd, h:mm a')
        }
      }
      let headerKeySize = [7, 15, 20, 30, 40,]
      flag == 'pdfFlag' ? this.downloadFileService.downLoadPdf(keyPDFHeader, ValueData, objData) : this.downloadFileService.allGenerateExcel(this.languageFlag == 'English' ?keyPDFHeader:MarathikeyPDFHeader, ValueData, objData, headerKeySize)
    }
  }

  clearForm() {
    this.filterForm.reset();
    this.villageArr = [];
    this.centerArr = [];
    this.schoolArr = [];
    this.getTableData();
  }



  openDialog() {
    const dialogRef = this.dialog.open(AddCctvLocationComponent,{
      width: '500px',
      disableClose: true,
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

 
}
