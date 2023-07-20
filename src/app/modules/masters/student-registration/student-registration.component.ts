import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { DownloadPdfExcelService } from 'src/app/core/services/download-pdf-excel.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { MasterService } from 'src/app/core/services/master.service';
import { ValidationService } from 'src/app/core/services/validation.service';
import { WebStorageService } from 'src/app/core/services/web-storage.service';
import { GlobalDetailComponent } from 'src/app/shared/components/global-detail/global-detail.component';
import { GlobalDialogComponent } from 'src/app/shared/components/global-dialog/global-dialog.component';
import { AddUpdateStudentRegistrationComponent } from './add-update-student-registration/add-update-student-registration.component';
// import { StudentDetailsComponent } from './student-details/student-details.component';
@Component({
  selector: 'app-student-registration',
  templateUrl: './student-registration.component.html',
  styleUrls: ['./student-registration.component.scss']
})
export class StudentRegistrationComponent {
  filterForm!: FormGroup;
  pageNumber: number = 1;
  searchContent = new FormControl('');
  tableDataArray = new Array();
  cardViewFlag: boolean = false;
  totalCount: number = 0;
  cardCurrentPage: number = 0;
  studentData = new Array();
  languageFlag!: string;
  tableDatasize!: number;
  talukaArr: any = [];
  centerArr: any = [];
  villageArr: any = [];
  schoolArr: any = [];
  isWriteRight!: boolean;
  highLightFlag: boolean =true;
  viewStatus="Table";
  displayedColumns = [ 'srNo','docPath', 'fullName', 'standard', 'parentMobileNo', 'gender', 'action'];
  marathiDisplayedColumns = ['srNo','docPath', 'm_FullName', 'm_Standard', 'parentMobileNo', 'm_Gender', 'action'];
  displayedheaders = ['Sr. No.','', ' Student Name', 'Standard', 'Parent Mobile No.', 'Gender', 'action'];
  marathiDisplayedheaders = ['अनुक्रमांक','', 'विद्यार्थ्याचे नाव', 'वर्ग', 'पालक मोबाईल क्र.', 'लिंग', 'कृती'];
  constructor(
    private dialog: MatDialog,
    private apiService: ApiService,
    private errors: ErrorsService,
    private commonMethods: CommonMethodsService,
    public webService: WebStorageService,
    private downloadPdfservice: DownloadPdfExcelService,
    private ngxSpinner: NgxSpinnerService,
    public validators: ValidationService,
    private masterService: MasterService,
    public datepipe: DatePipe,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.languageFlag = this.webService.languageFlag;
    this.filterFormData();
    this.getTaluka();
    this.webService.langNameOnChange.subscribe(lang => {
      this.languageFlag = lang;
      this.setTableData();
    });
    this.getTableData();   
    this.getIsWriteFunction(); 
  }

  getIsWriteFunction(){
    let print = this.webService?.getAllPageName().find((x: any) => {
      return x.pageURL == "student-registration"
     });
     (print.writeRight === true) ?  this.isWriteRight = true : this.isWriteRight = false     
  }

  filterFormData() {
    this.filterForm = this.fb.group({
      talukaId: [''],
      centerId: [''],
      villageId:[''],
      schoolId: [''],
      textSearch: ['']
    })
  }

  //#region ----------------------------------------------------- Get Table Data Logic Start here -----------------------------------------------

  getTableData(flag?: string) {
    this.ngxSpinner.show();
    this.pageNumber = flag == 'filter' ? 1 : this.pageNumber;
    let pageNo = this.pageNumber;
    let str = `?pageno=${pageNo}&pagesize=10&textSearch=${this.filterForm.value.textSearch?.trim() || ''}&TalukaId=${this.filterForm.value.talukaId || 0}&CenterId=${this.filterForm.value.centerId || 0}&VillageId=${this.filterForm.value.villageId || 0}&SchoolId=${this.filterForm.value.schoolId || 0}&lan=${this.languageFlag || ''}`;
    let reportStr =   `?pageno=1&pagesize=${this.totalCount * 10}&textSearch=${this.filterForm.value.textSearch?.trim() || ''}&TalukaId=${this.filterForm.value.talukaId || 0}&CenterId=${this.filterForm.value.centerId || 0}&VillageId=${this.filterForm.value.villageId || 0}&SchoolId=${this.filterForm.value.schoolId || 0}&lan=${this.languageFlag || ''}`;
    this.apiService.setHttp('GET', 'zp-satara/Student/GetAll' + (flag == 'reportFlag' ? reportStr : str), false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.ngxSpinner.hide();
          flag != 'reportFlag' ? this.tableDataArray = res.responseData.responseData1 : this.tableDataArray = this.tableDataArray;
          flag != 'reportFlag' ? this.tableDatasize = res.responseData.responseData2.pageCount : this.tableDatasize = this.tableDatasize;
          this.tableDataArray.map((res: any) => {
            let index = res.documentResponse.findIndex((ele: any) => ele.documentId == 1);
            res.docPath = res.documentResponse[index]?.docPath
          })
          this.totalCount = res.responseData.responseData2.pageCount;
          this.studentData = []
          let data: [] = flag == 'reportFlag' ? res.responseData.responseData1 : [];
          data.find((ele: any, i: any) => {
            let obj = {
              srNo: i + 1,
              id: ele.id,
              fullName: ele.fullName,
              gender: ele.gender,
              mobileNo: ele.parentMobileNo,
              standard: ele.standard,
              schoolName: ele.schoolName,
              caste: ele.caste,
              taluka: ele.taluka,
              center: ele.center,
            }
            this.studentData.push(obj);
          });
          if (this.studentData.length > 0 && flag == 'reportFlag') {
            let keyPDFHeader = ['SrNo', "ID", "Full Name", "Gender", "Contact No.", "Standard", "School Name", "Caste", "Taluka", "Center"];
            let ValueData =
              this.studentData.reduce(
                (acc: any, obj: any) => [...acc, Object.values(obj).map((value) => value)], []
              );// Value Name           
            let objData: any = {
              'topHedingName': 'Student List',
              'createdDate': 'Created on:' + this.datepipe.transform(new Date(), 'yyyy-MM-dd, h:mm a')
            }
            this.downloadPdfservice.downLoadPdf(keyPDFHeader, ValueData, objData);
          } else {
            flag == 'reportFlag' ? this.commonMethods.showPopup("No Data Found", 1) : '';
          }
        } else {
          this.ngxSpinner.hide();
          flag == 'reportFlag' ? this.commonMethods.showPopup("No Data Found", 1) : '';
          this.tableDataArray = [];
          this.tableDatasize = 0;
        }
        this.setTableData();       
      },
      error: ((err: any) => { this.ngxSpinner.hide(); this.errors.handelError(err.statusCode) })
    });
  }
  
  setTableData(){
    this.highLightFlag =true;
    let displayedColumns  = ['docPath', 'srNo', 'fullName', 'standard', 'parentMobileNo', 'gender']
    let marathiDisplayedColumns = ['docPath', 'srNo', 'm_FullName', 'm_Standard', 'parentMobileNo', 'm_Gender'];
    let tableData = {
      highlightedrow:true,
      pageNumber: this.pageNumber,
      img: 'docPath', blink: '', badge: '', isBlock: '', pagintion: this.tableDatasize > 10 ? true : false,
      displayedColumns: this.isWriteRight == true ? this.languageFlag == 'English' ? this.displayedColumns : this.marathiDisplayedColumns : this.languageFlag == 'English' ? displayedColumns : marathiDisplayedColumns,
      tableData: this.tableDataArray,
      tableSize: this.tableDatasize,
      tableHeaders: this.languageFlag == 'English' ? this.displayedheaders : this.marathiDisplayedheaders
    };
    this.highLightFlag?tableData.highlightedrow=true:tableData.highlightedrow=false,
    this.apiService.tableData.next(tableData);
  }
  //#endregion ----------------------------------------------------- Get Table Data Logic End here -----------------------------------------------

  childTableCompInfo(obj: any) {
    switch (obj.label) {
      case 'Pagination':
        this.pageNumber = obj.pageNumber;
        this.getTableData();
        break;
      case 'Edit':
        this.addUpdateStudent(JSON.stringify(obj));
        break;
      case 'Delete':
        this.deteleDialogOpen(obj);
        break;
      case 'View':
        this.openDetailsDialog(obj);
        break;
    }
  }

  addUpdateStudent(obj?: any) {
    const dialogRef = this.dialog.open(AddUpdateStudentRegistrationComponent, {
      width: '900px',
      data: obj,
      disableClose: true,
      autoFocus: false
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      obj = obj ? JSON.parse(obj) : ''
      if (result == 'yes' && obj) {
        this.pageNumber = obj.pageNumber;
        this.getTableData();
      } else if (result == 'yes') {
        this.pageNumber = 1;
        this.getTableData();
      }
      this.highLightFlag =false;
      this.setTableData();
    });
  }

  childGridCompInfo(obj: any) {
    switch (obj.label) {
      case 'Pagination':
        this.pageNumber = obj.pageNumber;
        this.getTableData();
        break;
      case 'Edit':
        this.addUpdateStudent(JSON.stringify(obj));
        break;
      case 'Delete':
        this.deteleDialogOpen(obj);
        break;
      case 'View':
        this.openDetailsDialog(obj);
        break;
    }
  }

  onPageChanged(event: any) {
    this.cardCurrentPage = event.pageIndex;
    this.selectGrid('Card');
  }

  selectGrid(label: string) {
    if (label == 'Table') {
      this.cardViewFlag = false;
      this.pageNumber = 1;
    } else if (label == 'Card') {
      this.cardViewFlag = true;
      this.pageNumber = 1;
    }
    this.getTableData();
  }

  clearForm() {
    this.filterForm.reset();
    this.centerArr=[];
    this.schoolArr =[];
    this.villageArr = [];
    this.getTaluka();
    this.getTableData();
  }

  openDetailsDialog(obj: any) {
    let index = obj.documentResponse.findIndex((ele: any) => ele.documentId == 1);
    var data = {
      headerImage: obj.documentResponse[index]?.docPath || "assets/images/user.png",
      header: this.webService.languageFlag == 'EN' ? obj.fullName : obj.m_FullName,
      subheader: this.webService.languageFlag == 'EN' ? obj.gender : obj.m_Gender,
      labelHeader: this.webService.languageFlag == 'EN' ? ['Father Name', 'Mother Name', 'Parent Mobile No.', 'Aadhaar No.', 'Standard', 'School Name'] : ['वडीलांचे नावं', 'आईचे नावं', 'पालक मोबाईल क्र.', 'आधार क्र.', 'इयत्ता', 'शाळेचे नाव'],
      labelKey: this.webService.languageFlag == 'EN' ? ['fatherFullName', 'motherName', 'parentMobileNo', 'aadharNo', 'standard', 'schoolName'] : ['m_FatherFullName', 'm_MotherName', 'parentMobileNo', 'aadharNo', 'standard', 'm_SchoolName'],
      Obj: obj,
      chart: true
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
      this.highLightFlag =false;
      this.setTableData();
    });
  }
  //#region -------------------------------------------------- Delete Logic Start Here ------------------------------------------------------

  deteleDialogOpen(obj: any) {
    let dialoObj = {
      header: this.languageFlag == 'English' ? 'Delete' : 'हटवा',
      title: this.languageFlag == 'English' ? 'Do you want to delete Student record?' : 'तुम्हाला विद्यार्थी रेकॉर्ड हटवायचा आहे का?',
      cancelButton: this.languageFlag == 'English' ? 'Cancel' : 'रद्द करा',
      okButton: this.languageFlag == 'English' ? 'Ok' : 'ओके'
    };
    const deleteDialogRef = this.dialog.open(GlobalDialogComponent, {
      width: '320px',
      data: dialoObj,
      disableClose: true,
      autoFocus: false
    });
    deleteDialogRef.afterClosed().subscribe((result: any) => {
      if (result == 'yes') {
        this.deleteRecord(obj.id)
      }
      this.highLightFlag =false;
      this.setTableData();
    });
  }

  deleteRecord(id: any) {
    let webStorageMethod = this.webService.createdByProps();
    let deleteObj = {
      "id": id,
      "modifiedBy": webStorageMethod.modifiedBy,
      "modifiedDate": webStorageMethod.modifiedDate,
      "lan": this.webService.languageFlag
    }
    this.apiService.setHttp('delete', 'zp-satara/Student/DeleteStudent', false, deleteObj, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.commonMethods.showPopup(res.statusMessage, 0);
          this.getTableData();
        } else {
          this.commonMethods.showPopup(res.statusMessage, 1);
        }
      },
      error: ((err: any) => { this.errors.handelError(err.statusCode) })
    });
  }
  //#endregion -------------------------------------------------- Delete Logic End Here ------------------------------------------------------

  downloadPdf() {
    this.getTableData('reportFlag');
  }

  getTaluka() {
    this.talukaArr = [];
    this.masterService.getAllTaluka('').subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.talukaArr.push({ "id": 0, "taluka": "All", "m_Taluka": "सर्व" }, ...res.responseData);
          this.filterForm.controls['talukaId'].setValue(0);         
          // this.talukaArr = res.responseData;
        } else {
          this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
          this.talukaArr = [];
        }
      },
      error: ((err: any) => { this.errors.handelError(err.statusCode) })
    });
  }

  getAllCenter() {
    this.centerArr = [];
    let Tid = this.filterForm.value.talukaId;
    if (Tid != 0) {
      this.masterService.getAllCenter('', Tid).subscribe({
        next: (res: any) => {
          if (res.statusCode == 200) {
            this.centerArr.push({ "id": 0, "center": "All", "m_Center": "सर्व" }, ...res.responseData);
            this.filterForm.controls['centerId'].setValue(0);           
          } else {
            this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
            this.centerArr = [];
          }
        },
        error: ((err: any) => { this.errors.handelError(err.statusCode) })
      });
    }
  }

  getVillage() {
    this.villageArr = [];
    let Tid = this.filterForm.value.talukaId;
    // let Cid = this.filterForm.value.centerId || 0;
    this.masterService.getAllVillage('', Tid).subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) { 
          this.villageArr.push({ "id": 0, "village": "All", "m_Village": "सर्व" }, ...res.responseData);
          this.filterForm.controls['villageId'].setValue(0);          
        } else {
          this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
          this.villageArr = [];
        }
      },
      error: ((err: any) => { this.errors.handelError(err.statusCode) })
    });
  }

  getAllSchoolsByCenterId() {
    this.schoolArr = [];
    let Tid = this.filterForm.value.talukaId;
    let Cid = this.filterForm.value.centerId;
    let Vid = this.filterForm.value.villageId;
      this.masterService.getAllSchoolByCriteria('', Tid, Vid, Cid).subscribe({
        next: (res: any) => {
          if (res.statusCode == 200) {
            this.schoolArr.push({ "id": 0, "schoolName": "All", "m_SchoolName": "सर्व" }, ...res.responseData);
            this.filterForm.controls['schoolId'].setValue(0);            
          } else {
            // this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
            this.schoolArr = [];
          }
        },
        error: ((err: any) => { this.errors.handelError(err.statusCode) })
      });
  }

  clearDropdown(name?: any) {
    this.filterForm.controls['textSearch'].setValue('');
    if (name == 'talukaId') {
      this.filterForm.controls['centerId'].setValue('');
      this.filterForm.controls['schoolId'].setValue('');
    } else if (name == 'centerId') {
      this.filterForm.controls['schoolId'].setValue('');
    }
  }

}
