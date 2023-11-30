import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { AesencryptDecryptService } from 'src/app/core/services/aesencrypt-decrypt.service';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { DownloadPdfExcelService } from 'src/app/core/services/download-pdf-excel.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { MasterService } from 'src/app/core/services/master.service';
import { ValidationService } from 'src/app/core/services/validation.service';
import { WebStorageService } from 'src/app/core/services/web-storage.service';
import { GlobalDetailComponent } from 'src/app/shared/components/global-detail/global-detail.component';
import { GlobalDialogComponent } from 'src/app/shared/components/global-dialog/global-dialog.component';
// import { AddUpdateStudentRegistrationComponent } from './add-update-student-registration/add-update-student-registration.component';
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
  stateArr: any = [];
  districtArr: any = [];
  talukaArr: any = [];
  centerArr: any = [];
  villageArr: any = [];
  schoolArr: any = [];
  isWriteRight!: boolean;
  highLightFlag: boolean = true;
  studentDetails: any;
  viewStatus = "Table";
  loginData = this.webService.getLoggedInLocalstorageData();
  displayedColumns = ['srNo', 'docPath', 'fullName', 'standard', 'mobileNo', 'gender', 'action'];
  marathiDisplayedColumns = ['srNo', 'docPath', 'm_FullName', 'm_Standard', 'mobileNo', 'm_Gender', 'action'];
  displayedheaders = ['Sr. No.', '', ' Student Name', 'Standard', 'Parent Mobile No.', 'Gender', 'action'];
  marathiDisplayedheaders = ['अनुक्रमांक', '', 'विद्यार्थ्याचे नाव', 'वर्ग', 'पालक मोबाईल क्र.', 'लिंग', 'कृती'];
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
    private fb: FormBuilder,
    private router: Router,
    private encDec: AesencryptDecryptService
  ) { }

  ngOnInit() {
    this.languageFlag = this.webService.languageFlag;
    this.filterFormData();
    this.getState();
    this.webService.langNameOnChange.subscribe(lang => {
      this.languageFlag = lang;
      this.setTableData();
    });
    this.getTableData();
    this.getIsWriteFunction();
  }

  getIsWriteFunction() {
    let print = this.webService?.getAllPageName().find((x: any) => {
      return x.pageURL == "student-registration"
    });
    (print.writeRight === true) ? this.isWriteRight = true : this.isWriteRight = false
  }

  filterFormData() {
    this.filterForm = this.fb.group({
      stateId: [0],
      districtId: [''],
      talukaId: [''],
      centerId: [''],
      villageId: [''],
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
    let reportStr = `?pageno=1&pagesize=${this.totalCount * 10}&textSearch=${this.filterForm.value.textSearch?.trim() || ''}&TalukaId=${this.filterForm.value.talukaId || 0}&CenterId=${this.filterForm.value.centerId || 0}&VillageId=${this.filterForm.value.villageId || 0}&SchoolId=${this.filterForm.value.schoolId || 0}&lan=${this.languageFlag || ''}`;
    this.apiService.setHttp('GET', 'zp-satara/Student/GetAll' + ((flag == 'pdfFlag' || flag == 'excel') ? reportStr : str), false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.ngxSpinner.hide();
          (flag != 'pdfFlag' && flag != 'excel') ? this.tableDataArray = res.responseData.responseData1 : this.tableDataArray = this.tableDataArray;
          (flag != 'pdfFlag' && flag != 'excel') ? this.tableDatasize = res.responseData.responseData2.pageCount : this.tableDatasize = this.tableDatasize;

          this.tableDataArray.map((res: any) => {
            let index = res.documentResponse.findIndex((ele: any) => ele.documentId == 1);
            res.docPath = res.documentResponse[index]?.docPath
          })
          this.totalCount = res.responseData.responseData2.pageCount;
          this.studentData = []
          let data: [] = (flag == 'pdfFlag' || flag == 'excel') ? res.responseData.responseData1 : [];
          flag == 'pdfFlag' ? this.downloadPDF(data, 'pdfFlag') : flag == 'excel' ? this.downloadPDF(data, 'excel') : '';
        } else {
          this.ngxSpinner.hide();
          (flag == 'pdfFlag' || flag == 'excel') ? this.commonMethods.showPopup("No Data Found", 1) : '';
          this.tableDataArray = [];
          this.tableDatasize = 0;
        }
        this.setTableData();
      },
      error: ((err: any) => { this.ngxSpinner.hide(); this.errors.handelError(err.statusCode) })
    });
  }

  downloadPDF(data?: any, flag?: string) {
    this.studentData = [];
    data.find((ele: any, i: any) => {
      let obj = {
        srNo: i + 1,
        id: ele.id,
        fullName: flag == 'excel' ? this.languageFlag == 'English' ? ele.fullName : ele.m_FullName : ele.fullName,
        gender: flag == 'excel' ? this.languageFlag == 'English' ? ele.gender : ele.m_Gender : ele.gender,
        mobileNo: ele.mobileNo,
        standard: ele.standard,
        schoolName: flag == 'excel' ? this.languageFlag == 'English' ? ele.schoolName : ele.m_SchoolName : ele.schoolName,
        caste: flag == 'excel' ? this.languageFlag == 'English' ? ele.caste : ele.m_Caste : ele.caste,
        taluka: flag == 'excel' ? this.languageFlag == 'English' ? ele.taluka : ele.m_Taluka : ele.taluka,
        center: flag == 'excel' ? this.languageFlag == 'English' ? ele.center : ele.m_Center : ele.center,
      }
      this.studentData.push(obj);
    });
    if (this.studentData.length > 0) {
      let keyPDFHeader = ['SrNo', "ID", "Full Name", "Gender", "Contact No.", "Standard", "School Name", "Caste", "Taluka", "Center"];
      let MarathikeyPDFHeader = ['अनुक्रमांक', 'आयडी', 'विद्यार्थ्याचे नाव', 'लिंग', 'मोबाईल क्र.', 'मानक', 'शाळेचे नाव', 'जात', 'तालुका', 'केंद्र'];

      let ValueData =
        this.studentData.reduce(
          (acc: any, obj: any) => [...acc, Object.values(obj).map((value) => value)], []
        );// Value Name           
      // let objData: any = {
      //   'topHedingName': 'Student List',
      //   'createdDate': 'Created on:' + this.datepipe.transform(new Date(), 'yyyy-MM-dd, h:mm a')
      // }

      let objData = {
        'topHedingName': flag == 'excel' ? this.languageFlag == 'English' ? 'Student List' : 'विद्यार्थी यादी' : 'Student List',
        'createdDate': (flag == 'excel' ? this.languageFlag == 'English' ? 'Created on:' : 'रोजी तयार केले :' : 'Created on:') + this.datepipe.transform(new Date(), 'yyyy-MM-dd, h:mm a')
      }
      let headerKeySize = [7, 7, 30, 10, 10, 10, 30, 10, 10, 10];
      flag == 'pdfFlag' ? this.downloadPdfservice.downLoadPdf(keyPDFHeader, ValueData, objData) : this.downloadPdfservice.allGenerateExcel(this.languageFlag == 'English' ? keyPDFHeader : MarathikeyPDFHeader, ValueData, objData, headerKeySize);
    }
  }

  setTableData() {
    this.highLightFlag = true;
    let displayedColumns = ['docPath', 'srNo', 'fullName', 'standard', 'mobileNo', 'gender']
    let marathiDisplayedColumns = ['docPath', 'srNo', 'm_FullName', 'm_Standard', 'mobileNo', 'm_Gender'];
    let tableData = {
      highlightedrow: true,
      edit: true,
      delete: false,
      pageNumber: this.pageNumber,
      img: 'docPath', blink: '', badge: '', isBlock: '', pagintion: this.tableDatasize > 10 ? true : false,
      displayedColumns: this.isWriteRight == true ? this.languageFlag == 'English' ? this.displayedColumns : this.marathiDisplayedColumns : this.languageFlag == 'English' ? displayedColumns : marathiDisplayedColumns,
      tableData: this.tableDataArray,
      tableSize: this.tableDatasize,
      tableHeaders: this.languageFlag == 'English' ? this.displayedheaders : this.marathiDisplayedheaders
    };
    this.highLightFlag ? tableData.highlightedrow = true : tableData.highlightedrow = false,
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
        this.addUpdateStudent(obj);
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
    if (obj) {
      let id: any = obj.id;
      let formdata: any = this.encDec.encrypt(`${id}`);
      this.router.navigate(['/add-student'], {
        queryParams: { id: formdata },
      });
    } else {
      this.router.navigate(['/add-student'])
    }


    // const dialogRef = this.dialog.open(AddUpdateStudentRegistrationComponent, {
    //   width: '900px',
    //   data: obj,
    //   disableClose: true,
    //   autoFocus: false
    // });
    // dialogRef.afterClosed().subscribe((result: any) => {
    //   obj = obj ? JSON.parse(obj) : ''
    //   if (result == 'yes' && obj) {
    //     this.pageNumber = obj.pageNumber;
    //     this.getTableData();
    //   } else if (result == 'yes') {
    //     this.pageNumber = 1;
    //     this.getTableData();
    //   }
    //   this.highLightFlag =false;
    //   this.setTableData();
    // });
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
    this.districtArr = [];
    this.talukaArr = [];
    this.centerArr = [];
    this.schoolArr = [];
    this.villageArr = [];
    this.filterFormData();
    this.getState();
    this.getTableData();
  }

  openDetailsDialog(obj: any) {
    let id = obj.id;
    this.apiService.setHttp('get', 'zp-satara/Student/GetById?Id=' + id + '&lan=' + this.webService.languageFlag, false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.studentDetails = res.responseData;

          let index = this.studentDetails?.documentResponse.findIndex((ele: any) => ele.documentId == 1);
          var data = {
            headerImage: this.studentDetails?.documentResponse[index]?.docPath || "assets/images/user.png",
            header: this.webService.languageFlag == 'EN' ? this.studentDetails?.fullName : this.studentDetails?.m_FullName,
            subheader: this.webService.languageFlag == 'EN' ? this.studentDetails?.gender : this.studentDetails?.m_Gender,
            labelHeader: this.webService.languageFlag == 'EN' ? ['Gaurdian Name', 'Relation', 'Parent Mobile No.', 'Aadhaar No.', 'Standard', 'School Name'] : ['पालकाचे नाव', 'नाते', 'पालक मोबाईल क्र.', 'आधार क्र.', 'इयत्ता', 'शाळेचे नाव'],
            labelKey: this.webService.languageFlag == 'EN' ? ['gaurdianName', 'relation', 'mobileNo', 'aadharNo', 'standard', 'schoolName'] : ['m_GaurdianName', 'm_Relation', 'mobileNo', 'aadharNo', 'standard', 'm_SchoolName'],
            Obj: this.studentDetails,
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
            this.highLightFlag = false;
            this.setTableData();
          });
        }else{
          this.commonMethods.showPopup(res.statusMessage, 1);
        }
      },
      error: ((err: any) => { this.errors.handelError(err.statusCode) })
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
      this.highLightFlag = false;
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

  // downloadPdf() {
  //   this.getTableData('reportFlag');
  // }

  getState(){
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
    });
  }

  getDistrict() {
    this.districtArr = [];
    let stateId: any = this.filterForm.value.stateId;
    if(stateId > 0){
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
    else{
      this.districtArr = [];
    }
  }

  getTaluka() {
    this.talukaArr = [];
    let districtId: any = this.filterForm.value.districtId;
    if(districtId > 0){
      this.masterService.getAllTaluka('', districtId).subscribe({
        next: (res: any) => {
          if (res.statusCode == 200) {
            this.talukaArr.push({ "id": 0, "taluka": "All", "m_Taluka": "सर्व" }, ...res.responseData);
            this.loginData ? (this.filterForm.controls['talukaId'].setValue(this.loginData?.talukaId), this.getAllCenter()): this.filterForm.controls['talukaId'].setValue(0);
          } else {
            this.talukaArr = [];
          }
        },
      });
    }
    else{
      this.talukaArr = [];
    }
  }

  getAllCenter() {
    this.centerArr = [];
    let Tid: any = this.filterForm.value.talukaId;
    if (Tid > 0) {
      this.masterService.getAllCenter('', Tid).subscribe({
        next: (res: any) => {
          if (res.statusCode == 200) {
            this.centerArr.push({ "id": 0, "center": "All", "m_Center": "सर्व" }, ...res.responseData);
            this.loginData ? (this.filterForm.controls['centerId'].setValue(this.loginData?.centerId), this.getVillage()): this.filterForm.controls['centerId'].setValue(0);
          } else {
            this.centerArr = [];
          }
        },
      });
    }
    else{
      this.centerArr = [];
    }
  }

  getVillage() {
    this.villageArr = [];
    let Cid = this.filterForm.value.centerId || 0;
    if(Cid > 0){
      this.masterService.getAllVillage('', Cid).subscribe({
        next: (res: any) => {
          if (res.statusCode == 200) {
            this.villageArr.push({ "id": 0, "village": "All", "m_Village": "सर्व" }, ...res.responseData);
            this.loginData ? (this.filterForm.controls['villageId'].setValue(this.loginData?.villageId), this.getAllSchoolsByCenterId()) : this.filterForm.controls['villageId'].setValue(0);
          } else {
            this.villageArr = [];
          }
        },
      });
    }
    else{
      this.villageArr = [];
    }
  }

  getAllSchoolsByCenterId() {
    this.schoolArr = [];
    let Tid = this.filterForm.value.talukaId;
    let Cid = this.filterForm.value.centerId;
    let Vid = this.filterForm.value.villageId;
    if(Tid > 0 && Cid > 0 && Vid > 0){
      this.masterService.getAllSchoolByCriteria('', Tid, Vid, Cid).subscribe({
        next: (res: any) => {
          if (res.statusCode == 200) {
            this.schoolArr.push({ "id": 0, "schoolName": "All", "m_SchoolName": "सर्व" }, ...res.responseData);
            this.loginData ? this.filterForm.controls['schoolId'].setValue(this.loginData?.schoolId) : this.filterForm.controls['schoolId'].setValue(0);
          } else {
            // this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
            this.schoolArr = [];
          }
        },
      });
    }
    else{
      this.schoolArr = [];
    }
  }

  clearDropdown(flag?: any) {
    if (flag == 'stateId') {
      this.filterForm.controls['districtId'].setValue('');
      this.filterForm.controls['talukaId'].setValue('');
      this.filterForm.controls['centerId'].setValue('');
      this.filterForm.controls['villageId'].setValue('');
      this.filterForm.controls['schoolId'].setValue('');
      this.talukaArr = [];
      this.centerArr = [];
      this.villageArr = [];
      this.schoolArr = [];
    }else if (flag == 'districtId') {
      this.filterForm.controls['talukaId'].setValue('');
      this.filterForm.controls['centerId'].setValue('');
      this.filterForm.controls['villageId'].setValue('');
      this.filterForm.controls['schoolId'].setValue('');
      this.centerArr = [];
      this.villageArr = [];
      this.schoolArr = [];
    }else if (flag == 'talukaId') {
      this.filterForm.controls['centerId'].setValue('');
      this.filterForm.controls['villageId'].setValue('');
      this.filterForm.controls['schoolId'].setValue('');
      this.villageArr = [];
      this.schoolArr = [];
    } else if (flag == 'centerId') {
      this.filterForm.controls['villageId'].setValue('');
      this.filterForm.controls['schoolId'].setValue('');
      this.schoolArr = [];
    }
    else{
      this.filterForm.controls['schoolId'].setValue('');
    }
  }

}
