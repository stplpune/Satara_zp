import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddAssessmentConfigurationComponent } from './add-assessment-configuration/add-assessment-configuration.component';
import { FormBuilder, FormGroup, NgForm } from '@angular/forms';
// import { ApiService } from 'src/app/core/services/api.service';
import { MasterService } from 'src/app/core/services/master.service';
import { WebStorageService } from 'src/app/core/services/web-storage.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { GlobalDialogComponent } from 'src/app/shared/components/global-dialog/global-dialog.component';
import { DownloadPdfExcelService } from 'src/app/core/services/download-pdf-excel.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-assessment-configuration',
  templateUrl: './assessment-configuration.component.html',
  styleUrls: ['./assessment-configuration.component.scss']
})
export class AssessmentConfigurationComponent {
  filterForm!: FormGroup;
  languageFlag: any;
  pageNumber: number = 1;
  totalCount!: number;
  tableDataArray = new Array();
  tableDatasize!: number;
  tableData: any;
  isWriteRight!: boolean;
  highLightFlag: any;
  districtArr = new Array();
  stateArr = new Array();
  assessmentTypeArr = new Array();
  groupClassArr = new Array();
  standardArr = new Array();
  subjectArr = new Array();
  questionArr = new Array();
  educationYearArr = new Array();
  loginData = this.webService.getLoggedInLocalstorageData();
  displayedheadersEnglish = ['Sr. No.', 'District', 'Standard', 'Subject', 'Question Type', 'Assessment Criteria', 'Educational Year', 'Unblock/Block','Action'];
  displayedheadersMarathi = ['अनुक्रमांक', 'जिल्हा', 'इयत्ता', 'विषय', 'प्रश्न प्रकार', 'मूल्यांकन निकष', 'शैक्षणिक वर्ष', 'अनब्लॉक/ब्लॉक', 'कृती'];
  @ViewChild('formDirective') private formDirective!: NgForm;

  constructor(public dialog: MatDialog,
    private fb: FormBuilder,
    private apiService: ApiService,
    private masterService: MasterService,
    private webService: WebStorageService,
    private ngxSpinner: NgxSpinnerService,
    private commonMethodS: CommonMethodsService,
    private errors: ErrorsService,
    private downloadFileService: DownloadPdfExcelService,
    private datepipe: DatePipe) {}

    ngOnInit(){
      this.getIsWriteFunction();
      this.formField();
      this.getTableData();
      this.getState(); 
      this.getSubject(); this.getEducatioYear();  this.getQuestion(); this.getStandard();
      this.languageFlag = this.webService.languageFlag;
      this.webService.langNameOnChange.subscribe(lang => {
        this.languageFlag = lang;
        this.languageChange();
      });
    }

    getIsWriteFunction() {
      let print = this.webService?.getAllPageName().find((x: any) => {
        return x.pageURL == "assessment-configuration"
      });
      (print.writeRight === true) ? this.isWriteRight = true : this.isWriteRight = false
    }

    formField(){
      this.filterForm = this.fb.group({
        stateId: [this.loginData ? this.loginData.stateId : 0],
        districtId: [this.loginData ? this.loginData.districtId : 0],
        groupId: [0],
        standardId: [0],
        subjectId: [0],
        assessmentTypeId: [0],
        educationalYearId : [this.loginData ? this.loginData.educationYearId : 0],
        questionTypeId: [0],
      })
    }

    //#region ------------------------------------------- Assessment Table Data start here ----------------------------------------// 
  getTableData(flag?: string) {
    this.ngxSpinner.show();
    this.pageNumber = flag == 'filter' ? 1 : this.pageNumber;
    let formValue = this.filterForm.value;

    let str = `pageno=${this.pageNumber}&pagesize=10&lan=${this.languageFlag}&assessmentType=${formValue.assessmentTypeId || 0}&questionTypeId=${formValue.questionTypeId || 0}&SubjectId=${formValue.subjectId || 0}&StandardId=${formValue.standardId || 0}&EducationYearId=${formValue.educationalYearId || 0}&districtId=${formValue.districtId || 0}&StateId=${formValue.stateId || 0}`;
    let reportStr = `pageno=1&pagesize=`+ (this.totalCount * 10) +`&lan=${this.languageFlag}&assessmentType=${formValue.assessmentTypeId || 0}&questionTypeId=${formValue.questionTypeId || 0}&SubjectId=${formValue.subjectId || 0}&StandardId=${formValue.standardId || 0}&EducationYearId=${formValue.educationalYearId || 0}&districtId=${formValue.districtId || 0}&StateId=${formValue.stateId || 0}`;

    this.apiService.setHttp('GET', 'zp-satara/AssessmentConfiguration/GetAll?' + ((flag == 'pdfFlag' || flag == 'excel') ? reportStr : str), false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({

      next: (res: any) => {
        if (res.statusCode == "200") {
          this.ngxSpinner.hide();
          (flag != 'pdfFlag' && flag != 'excel') ? this.tableDataArray = res.responseData : this.tableDataArray = this.tableDataArray;
          this.totalCount = res.responseData1.pageCount;
          this.tableDatasize = res.responseData1.pageCount;
          // this.resultDownloadArr = [];
          let data: [] = (flag == 'pdfFlag' || flag == 'excel') ? res.responseData : [];
          flag == 'pdfFlag' ? this.downloadPdf(data, 'pdfFlag') : flag == 'excel' ? this.downloadPdf(data, 'excel') : '';
        }
        else {
          this.ngxSpinner.hide();
          this.tableDataArray = [];
          this.tableDatasize = 0;
          this.tableDatasize == 0 && flag == 'pdfFlag' ? this.commonMethodS.showPopup(this.webService.languageFlag == 'EN' ? 'No Record Found' : 'रेकॉर्ड उपलब्ध नाही', 1) : '';
        }
        this.languageChange();
      },
      error: ((err: any) => { this.commonMethodS.checkEmptyData(err.statusText) == false ? this.errors.handelError(err.statusCode) : this.commonMethodS.showPopup(err.statusText, 1); })
    });
  }

  languageChange() {
    this.highLightFlag = true;
    let displayedColumnsReadMode = ['srNo', this.languageFlag == 'English' ? 'district' : 'm_District', 'standard', this.languageFlag == 'English' ? 'subjectName' : 'm_SubjectName', this.languageFlag == 'English' ? 'questionType' : 'm_QuestionType', this.languageFlag == 'English' ? 'question' : 'm_Question', this.languageFlag == 'English' ? 'educationYear' : 'm_EducationYear'];
    let displayedColumns = ['srNo', this.languageFlag == 'English' ? 'district' : 'm_District', 'standard', this.languageFlag == 'English' ? 'subjectName' : 'm_SubjectName', this.languageFlag == 'English' ? 'questionType' : 'm_QuestionType', this.languageFlag == 'English' ? 'question' : 'm_Question', this.languageFlag == 'English' ? 'educationYear' : 'm_EducationYear', 'isBlock','action'];
    this.tableData = {
      pageNumber: this.pageNumber,
      img: '', blink: '', badge: '', isBlock: 'isBlock', pagintion: true, defaultImg: "",
      displayedColumns: this.isWriteRight === true ? displayedColumns : displayedColumnsReadMode,
      // displayedColumns: displayedColumns,
      tableData: this.tableDataArray,
      tableSize: this.tableDatasize,
      tableHeaders: this.languageFlag == 'English' ? this.displayedheadersEnglish : this.displayedheadersMarathi,
      edit: true, delete: true
    };
    this.highLightFlag ? this.tableData.highlightedrow = true : this.tableData.highlightedrow = false,
      this.apiService.tableData.next(this.tableData);
  }
  //#endregion ------------------------------------------- Assessment Table Data end here ----------------------------------------//

  downloadPdf(data: any, flag?: string){
    let resultDownloadArr: any = [];
    data?.find((ele: any, i: any) => {
      let obj = {
        srNo:  (i + 1),
        standard: ele.standard,
        subjectName: flag == 'excel' ? this.languageFlag == 'English' ? ele.subjectName : ele.m_SubjectName : ele.subjectName,
        question: flag == 'excel' ? this.languageFlag == 'English' ? ele.questionType : ele.m_QuestionType : ele.questionType,
        criteria: flag == 'excel' ? this.languageFlag == 'English' ? ele.question : ele.m_Question : ele.question,
        educationYear: ele.educationYear,
      }
      resultDownloadArr.push(obj);
    });
    // download pdf call
    if (resultDownloadArr?.length > 0) {
      let keyPDFHeader = ['Sr. No.', 'Standard', 'Subject', 'Question Type', 'Assessment Criteria', 'Educational Year'];
      let marathikeyHeader = ['अनुक्रमांक', 'इयत्ता', 'विषय', 'प्रश्नाचा प्रकार', 'मूल्यांकन निकष', 'शैक्षणिक वर्ष']
      let ValueData =
        resultDownloadArr.reduce(
          (acc: any, obj: any) => [...acc, Object.values(obj).map((value) => value)], []
        );
      let objData: any;

      objData= {
        'topHedingName': flag == 'excel' ? this.languageFlag == 'English' ? 'Assesment Criteria List' : 'मूल्यांकन निकष यादी' : 'Assesment Criteria List',
        'createdDate': (flag == 'excel' ? this.languageFlag == 'English' ? 'Created on:' : 'रोजी तयार केले :' : 'Created on:')+ this.datepipe.transform(new Date(), 'yyyy-MM-dd, h:mm a')
      }

      let headerKeySize = [7, 10, 50, 25, 40, 20];
      flag == 'pdfFlag' ? this.downloadFileService.downLoadPdf(keyPDFHeader, ValueData, objData) : this.downloadFileService.allGenerateExcel(this.languageFlag == 'English' ? keyPDFHeader : marathikeyHeader, ValueData, objData, headerKeySize);
    }
  }

  //#region ---------------------------------------------- Filter Dropdown start here ----------------------------------------------
    getState(){
      this.stateArr = [];
      this.masterService.getAllState('').subscribe({
          next: (res: any) => {
            if(res.statusCode == "200"){
              this.stateArr.push({"id": 0, "state": "All", "m_State": "सर्व"}, ...res.responseData);
              this.loginData ? (this.filterForm.controls['stateId'].setValue(this.loginData?.stateId), this.getDistrict()) : this.filterForm.controls['stateId'].setValue(0);
            }
            else{
              this.stateArr = [];
            }
          }
        });
    }
  
    getDistrict() {
      this.districtArr = [];
      let stateId = this.filterForm.value.stateId;
      if(stateId > 0){
        this.masterService.getAllDistrict(this.webService.languageFlag, stateId).subscribe({
          next: (res: any) => {
            if (res.statusCode == "200") {
              this.districtArr.push({"id": 0, "district": "All", "m_District": "सर्व"}, ...res.responseData);
              this.loginData ? this.filterForm.controls['districtId'].setValue(this.loginData?.districtId) : this.filterForm.controls['districtId'].setValue(0);
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

    getStandard(){
      this.standardArr = [];
      this.masterService.GetAllStandardClassWise(this.webService.languageFlag).subscribe({
        next: (res: any) => {
          if (res.statusCode == "200") {
            this.standardArr.push({"groupId": 0, "standard": "All", "m_Standard": "सर्व"}, ...res.responseData);
          }
          else {
            this.standardArr = [];
          }
        }
      });
    }

    getSubject() {
      this.subjectArr = [];
      this.masterService.getAllSubject(this.webService.languageFlag).subscribe({
        next: (res: any) => {
          if (res.statusCode == "200") {
            this.subjectArr.push({"id": 0, "subject": "All", "m_Subject": "सर्व"}, ...res.responseData);
          }
          else {
            this.subjectArr = [];
          }
        },
      });
    }

    getQuestion() {
      this.questionArr = [];
      this.masterService.getAllQuestionType(this.webService.languageFlag).subscribe({
        next: (res: any) => {
          if (res.statusCode == "200") {
            this.questionArr.push({"id": 0, "questionType": "All", "m_QuestionType": "सर्व"}, ...res.responseData);
          }
          else {
            this.questionArr = [];
          }
        },
      });
    }

    getEducatioYear() {
      this.educationYearArr = [];
      this.masterService.getAcademicYears(this.webService.languageFlag).subscribe({
        next: (res: any) => {
          if (res.statusCode == "200") {
            this.educationYearArr.push({"id": 0, "eductionYear": "All", "eductionYear_M": "सर्व"}, ...res.responseData);
          }
          else {
            this.educationYearArr = [];
          }
        },
      });
    }
  //#endregion ---------------------------------------------- Filter Dropdown end here ----------------------------------------------

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
        case 'Block':
        this.openBlockDialog(obj);
      }
    }

  openDialog(obj?: any) {
    const dialogRef = this.dialog.open(AddAssessmentConfigurationComponent,{
      width: '600px',
      data: obj?.id,
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if(result == 'yes' && obj){
        this.pageNumber = obj.pageNumber
        this.getTableData();
        this.formField();;

      }
      else if(result == 'yes'){
        this.pageNumber = 1;
        this.getTableData();
        this.formField();
      }
    });
  }

  //#region -------------------------------------------------- Delete Record start here -----------------------------------------------------
  globalDialogOpen(obj: any) {
    let dialoObj = {
      header: 'Delete',
      title: this.webService.languageFlag == 'EN' ? 'Do you want to delete Question Type?' : 'तुम्हाला प्रश्न प्रकार हटवायचा आहे का?',
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
        this.onClickDelete(obj);
      }
      this.highLightFlag = false;
      this.languageChange();
    })
  }

  onClickDelete(obj?: any) {
    let webStorageMethod = this.webService.createdByProps();
    let deleteObj = {
      "id": obj.id,
      "modifiedBy": webStorageMethod.modifiedBy,
      "modifiedDate": webStorageMethod.modifiedDate,
      "lan": this.webService.languageFlag
    }
    this.apiService.setHttp('delete', 'zp-satara/AssessmentConfiguration/DeleteCriteria', false, deleteObj, false, 'baseUrl');
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
    });
  }
  //#endregion ----------------------------------------------- Delete Record end here -------------------------------------------------------

  clearFilterForm() {
    this.formDirective?.resetForm();
    this.formField();
    this.getState();
    this.getTableData();
    this.pageNumber = 1;
    this.districtArr = [];
  }

  //#region ------------------------------------------------- Block/Unblock start here -----------------------------------------------------
  openBlockDialog(obj?: any){
    let userEng = obj.isBlock == false ?'Block' : 'Unblock';
    let userMara = obj.isBlock == false ?'ब्लॉक' : 'अनब्लॉक';
    let dialoObj = {
      img: 'assets/images/unblock-gif.gif',
      header: this.languageFlag == 'English' ? userEng + ' Question Type' : userMara + ' प्रश्नाचा प्रकार',
      title: this.languageFlag == 'English' ? 'Do You Want To '+userEng+' Assessment Criteria?' : 'आपण मूल्यांकन निकष '+userMara+' करू इच्छिता?',
      cancelButton: this.languageFlag == 'English' ? 'Cancel' : 'रद्द करा',
      okButton: this.languageFlag == 'English' ? 'Ok' : 'ओके'
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
    let blockObj = {
      "id": obj.id,
      "isBlock": !obj.isBlock,
      "blockBy": this.webService.getUserId(),
      "blockDate": this.webService.createdByProps().modifiedDate,
      "lan": this.languageFlag
    }
    this.apiService.setHttp('put', 'zp-satara/AssessmentConfiguration/BlockUnblockCriteria', false, blockObj, false, 'baseUrl');
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
  //#endregion ---------------------------------------------- Block/Unblock end here -------------------------------------------------------

  changeDropdown(label: string){
    if(label == 'state'){
      this.filterForm.controls['districtId'].setValue(0);
    }
  }
}

