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

@Component({
  selector: 'app-assessment-configuration',
  templateUrl: './assessment-configuration.component.html',
  styleUrls: ['./assessment-configuration.component.scss']
})
export class AssessmentConfigurationComponent {
  displayedColumns: string[] = ['position', 'name', 'QuestionType', 'AssementType','EducationalYear','Action'];
  dataSource = ELEMENT_DATA;
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
  displayedheadersEnglish = ['Sr. No.', 'Standard/Group', 'Question Type', 'Assessment Type', 'Educational Year', 'Action'];
  displayedheadersMarathi = ['अनुक्रमांक', 'इयत्ता/गट', 'प्रश्नाचा प्रकार', 'मूल्यांकन प्रकार', 'शैक्षणिक वर्ष', 'कृती'];
  @ViewChild('formDirective') private formDirective!: NgForm;

  constructor(public dialog: MatDialog,
    private fb: FormBuilder,
    private apiService: ApiService,
    private masterService: MasterService,
    private webService: WebStorageService,
    private ngxSpinner: NgxSpinnerService,
    private commonMethodS: CommonMethodsService,
    private errors: ErrorsService) {}

    ngOnInit(){
      this.formField();
      this.getTableData();
      this.getState(); this.getAssessmentType(); this.getSubject(); this.getEducatioYear();  this.getQuestion();
      this.languageFlag = this.webService.languageFlag;
      this.webService.langNameOnChange.subscribe(lang => {
        this.languageFlag = lang;
        this.languageChange();
      });
    }

    formField(){
      this.filterForm = this.fb.group({
        stateId: [0],
        districtId: [0],
        groupId: [0],
        standardId: [0],
        subjectId: [0],
        assessmentType: [0],
        educationalYear : [0],
        questionTypeId: [0],
      })
    }

    //#region ------------------------------------------- School Registration Table Data start here ----------------------------------------// 
  getTableData(flag?: string) {
    this.ngxSpinner.show();
    this.pageNumber = flag == 'filter' ? 1 : this.pageNumber;
    let formValue = this.filterForm.value;

    let str = `pageno=${this.pageNumber}&pagesize=10&lan=${this.languageFlag}&assessmentType=${formValue.assessmentType || 0}&standardId=${formValue.standardId || 0}&SubjectId=${formValue.subjectId || 0}&groupId=${formValue.groupId || 0}&districtId=${formValue.districtId || 0}&StateId=${formValue.stateId || 0}`;
    let reportStr = `pageno=1&pagesize=`+ (this.totalCount * 10) +`&lan=${this.languageFlag}&assessmentType=${formValue.assessmentType || 0}&standardId=${formValue.standardId || 0}&SubjectId=${formValue.subjectId || 0}&groupId=${formValue.groupId || 0}&districtId=${formValue.districtId || 0}&StateId=${formValue.stateId || 0}`;

    this.apiService.setHttp('GET', 'zp-satara/AssessmentConfiguration/GetAll?' + ((flag == 'pdfFlag' || flag == 'excel') ? reportStr : str), false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({

      next: (res: any) => {
        if (res.statusCode == "200") {
          this.ngxSpinner.hide();
          (flag != 'pdfFlag' && flag != 'excel') ? this.tableDataArray = res.responseData : this.tableDataArray = this.tableDataArray;
          this.totalCount = res.responseData1.pageCount;
          this.tableDatasize = res.responseData1.pageCount;
          // this.resultDownloadArr = [];
          // let data: [] = (flag == 'pdfFlag' || flag == 'excel') ? res.responseData.responseData1 : [];
          // flag == 'pdfFlag' ? this.downloadPdf(data, 'pdfFlag') : flag == 'excel' ? this.downloadPdf(data, 'excel') : '';
        }
        else {
          this.ngxSpinner.hide();
          this.tableDataArray = [];
          this.tableDatasize = 0;
          // this.tableDatasize == 0 && flag == 'pdfFlag' ? this.commonMethodS.showPopup(this.webService.languageFlag == 'EN' ? 'No Record Found' : 'रेकॉर्ड उपलब्ध नाही', 1) : '';
        }
        this.languageChange();
      },
      error: ((err: any) => { this.commonMethodS.checkEmptyData(err.statusText) == false ? this.errors.handelError(err.statusCode) : this.commonMethodS.showPopup(err.statusText, 1); })
    });
  }

  languageChange() {
    this.highLightFlag = true;
    // let displayedColumnsReadMode = ['srNo', 'groupClass', this.languageFlag == 'English' ? 'question' : 'm_Question', this.languageFlag == 'English' ? 'assessmentType' : 'm_AssessmentType', this.languageFlag == 'English' ? 'educationYear' : 'm_EducationYear'];
    this.displayedColumns = ['srNo', 'groupClass', this.languageFlag == 'English' ? 'question' : 'm_Question', this.languageFlag == 'English' ? 'assessmentType' : 'm_AssessmentType', this.languageFlag == 'English' ? 'educationYear' : 'm_EducationYear', 'action'];
    this.tableData = {
      pageNumber: this.pageNumber,
      img: '', blink: '', badge: '', isBlock: '', pagintion: true, defaultImg: "",
      // displayedColumns: this.isWriteRight === true ? this.displayedColumns : displayedColumnsReadMode,
      displayedColumns: this.displayedColumns,
      tableData: this.tableDataArray,
      tableSize: this.tableDatasize,
      tableHeaders: this.languageFlag == 'English' ? this.displayedheadersEnglish : this.displayedheadersMarathi,
      edit: true, delete: true
    };
    this.highLightFlag ? this.tableData.highlightedrow = true : this.tableData.highlightedrow = false,
      this.apiService.tableData.next(this.tableData);
  }
  //#endregion ------------------------------------------- School Registration Table Data end here ----------------------------------------//

    getState(){
      this.masterService.getAllState('').subscribe({
          next: (res: any) => {
            if(res.statusCode == "200"){
              this.stateArr.push({"id": 0, "state": "All", "m_State": "सर्व"}, ...res.responseData);
              this.getDistrict()
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

    getAssessmentType() {
      this.assessmentTypeArr = [];
      this.masterService.getAssementType(this.webService.languageFlag).subscribe({
        next: (res: any) => {
          if (res.statusCode == "200") {
            this.assessmentTypeArr.push({"id": 0, "assessmentType": "All", "m_AssessmentType": "सर्व"}, ...res.responseData);
          }
          else {
            this.assessmentTypeArr = [];
          }
        },
      });
    }

    onChangeAssementType(){
      this.filterForm.value.assessmentType == 1 ? this.getGroupClass() : this.getStandard();
    }

    getGroupClass(){
      this.groupClassArr = [];
      this.masterService.getAllGroupClass(this.webService.languageFlag).subscribe({
        next: (res: any) => {
          if (res.statusCode == "200") {
            this.groupClassArr.push({"id": 0, "groupClass": "All", "m_GroupClass": "सर्व"}, ...res.responseData);
          }
          else {
            this.groupClassArr = [];
          }
        }
      });
    }

    getStandard(){
      this.standardArr = [];
      this.masterService.GetAllStandardClassWise(this.webService.languageFlag).subscribe({
        next: (res: any) => {
          if (res.statusCode == "200") {
            this.standardArr.push({"id": 0, "standard": "All", "m_Standard": "सर्व"}, ...res.responseData);
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

  openDialog(obj?: any) {
    console.log("obj:", obj);
    
    const dialogRef = this.dialog.open(AddAssessmentConfigurationComponent,{
      width: '600px',
      data: obj,
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
      if(result == 'yes' && obj){
        this.pageNumber = obj.pageNumber
      }
      else{
        this.pageNumber = 1;
      }
        this.clearFilterForm();
        this.getState();
        this.getTableData();
        this.languageChange();
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
    this.apiService.setHttp('delete', 'zp-satara/AssessmentConfiguration/DeleteQuestionMaster', false, deleteObj, false, 'baseUrl');
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
    this.getTableData();
    this.pageNumber = 1;
    this.districtArr = [];
  }
}
  export interface PeriodicElement {
    name: any;
    position: any;
    QuestionType: any;
    AssementType: any;
    EducationalYear:any;
    Action:any;
  }
  
  const ELEMENT_DATA: PeriodicElement[] = [
    {position:1, name:'1st - 2nd',QuestionType:'Single Select',AssementType:'BaseWise',EducationalYear:'2022-2023',Action:''},
    {position:2, name:'1st - 2nd',QuestionType:'Single Select',AssementType:'BaseWise',EducationalYear:'2022-2023',Action:''},
    {position:3, name:'1st - 2nd',QuestionType:'Single Select',AssementType:'BaseWise',EducationalYear:'2022-2023',Action:''},
    {position:4, name:'1st - 2nd',QuestionType:'Single Select',AssementType:'BaseWise',EducationalYear:'2022-2023',Action:''},
    {position:5, name:'1st - 2nd',QuestionType:'Single Select',AssementType:'BaseWise',EducationalYear:'2022-2023',Action:''},
  ];