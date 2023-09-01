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
import { ValidationService } from 'src/app/core/services/validation.service';
import { GlobalDialogComponent } from 'src/app/shared/components/global-dialog/global-dialog.component';

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
  CCTVLocation = new Array();
  deleteObj: any;
  totalDetailRows: number = 0;

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
    this.getTaluka();;
    this.getCCTVLocation();
  }

  getIsWriteFunction() {
    let print = this.webService?.getAllPageName().find((x: any) => {
      return x.pageURL == "item"
    });
    (print.writeRight === true) ? this.isWriteRight = true : this.isWriteRight = false
  }

  filterFormData() {
    this.filterForm = this.fb.group({  
      centerId : [''],
      TalukaId: [''],
      villageId: [''],  
      SchoolId: [''],
      cctvLocation :[''],
      textSearch : ['']
    
    });
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
    
    
    if (id != 0) {
      this.masterService.getAllCenter('', id).subscribe({
        next: (res: any) => {
          if (res.statusCode == 200) {
            this.centerArr.push({ "id": 0, "center": "All", "m_Center": "सर्व" }, ...res.responseData);            
            
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
    let formValue = this.filterForm?.value
    this.ngxSpinner.show();
    this.pageNumber = flag == 'filter' ? 1 : this.pageNumber;
    
    let str = `TalukaId=${formValue?.TalukaId || 0}&CenterId=${formValue?.centerId || 0}&VillageId=${formValue?.villageId || 0}&SchoolId=${formValue?.SchoolId || 0}&CCTVLocationId=${formValue?.cctvLocation || 0}&TextSearch=${formValue?.textSearch?.trim() || 0}&PageNo=${this.pageNumber}&PageSize=10&lan=${this.languageFlag}`
    let reportStr = `TalukaId=${formValue?.TalukaId || 0}&CenterId=${formValue?.centerId || 0}&VillageId=${formValue?.villageId || 0}&SchoolId=${formValue?.SchoolId || 0}&CCTVLocationId=${formValue?.cctvLocation || 0}&TextSearch=${formValue?.textSearch?.trim() || 0}&PageNo=${this.pageNumber}&PageSize=${this.tableDatasize * 10}&lan=${this.languageFlag}`
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
    let displayedColumnsReadMode = ['srNo', 'cctvName', this.languageFlag == 'English' ? 'cctvLocation' : 'm_CCTVLocation', 'registrationDate', 'cctvModel','remark'];
    let displayedColumns = ['srNo','cctvName', this.languageFlag == 'English' ? 'cctvLocation' : 'm_CCTVLocation', 'registrationDate','cctvModel','remark', 'action'];

    let tableData = {
      highlightedrow: true,
      pageNumber: this.pageNumber,
      img: 'docPath', blink: '', badge: '', isBlock: '', pagintion: this.tableDatasize > 10 ? true : false,
      displayedColumns: this.isWriteRight == true ? displayedColumns : displayedColumnsReadMode,
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
      let MarathikeyPDFHeader = ['अनुक्रमांक', 'सीसीटीव्हीचे नाव', 'सीसीटीव्ही स्थान','नोंदणी दिनांक', 'सीसीटीव्ही मॉडेल', 'वर्णन'];
      let ValueData =
        this.resultDownloadArr.reduce(
          (acc: any, obj: any) => [...acc, Object.values(obj).map((value) => value)], []
        );

      let objData: any
      objData= {
        'topHedingName': flag == 'excel' ? this.languageFlag == 'English' ? 'CCTV Location List' : 'सीसीटीव्ही स्थान सूची' : 'CCTV Location List',
        'createdDate': (flag == 'excel' ? this.languageFlag == 'English' ? 'Created on:' : 'रोजी तयार केले :' : 'Created on:')+ this.datepipe.transform(new Date(), 'yyyy-MM-dd, h:mm a')
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

  openDialog(id?:any) {
    const dialogRef = this.dialog.open(AddCctvLocationComponent,{
      width: '900px',
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
      title: this.webService.languageFlag == 'EN' ? 'Do You Want To Delete CCTV Location?' : 'तुम्हाला सीसीटीव्ही स्थान हटवायचे आहे का?',
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
    if(flag == 'TalukaId'){
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
