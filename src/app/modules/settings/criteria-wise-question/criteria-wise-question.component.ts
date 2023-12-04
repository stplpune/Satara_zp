import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddCriteriaWiseQuestionComponent } from './add-criteria-wise-question/add-criteria-wise-question.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MasterService } from 'src/app/core/services/master.service';
import { WebStorageService } from 'src/app/core/services/web-storage.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { ApiService } from 'src/app/core/services/api.service';

@Component({
  selector: 'app-criteria-wise-question',
  templateUrl: './criteria-wise-question.component.html',
  styleUrls: ['./criteria-wise-question.component.scss']
})
export class CriteriaWiseQuestionComponent implements OnInit{

  filterForm!: FormGroup;
  languageFlag: any;
  pageNumber: number = 1;
  totalCount!: number;
  tableDataArray = new Array();
  tableDatasize!: number;
  tableData: any;
  isWriteRight!: boolean;
  highLightFlag: any;
  stateArr = new Array();
  districtArr = new Array();

  displayedheadersEnglish = ['Sr. No.', 'Standard', 'Subject','Question Type', 'Educational Year','Action'];
  displayedheadersMarathi = ['अनुक्रमांक', 'इयत्ता', 'विषय','प्रश्नाचा प्रकार', 'शैक्षणिक वर्ष', 'कृती'];

  constructor(public dialog: MatDialog,
    private fb: FormBuilder,
    private apiService: ApiService,
    private masterService: MasterService,
    private webService: WebStorageService,
    private ngxSpinner: NgxSpinnerService,
    private commonMethodS: CommonMethodsService,
    private errors: ErrorsService,
    // private downloadFileService: DownloadPdfExcelService,
    ) {}

  ngOnInit(): void {
    this.defaultForm();
    this.getState();
    this.getTableData();
    this.languageFlag = this.webService.languageFlag;
    this.webService.langNameOnChange.subscribe(lang => {
      this.languageFlag = lang;
      this.languageChange();
    });
  }

  get f(){ return this.filterForm.controls;}

  defaultForm(){
    this.filterForm = this.fb.group({
      stateId: [0],
      districtId: [0],
      standardId: [0],
      educationalYearId : [0],
      subjectId: [0],
      questionTypeId: [0],
      textSearch: [''],
    })
  }

  languageChange() {
    this.highLightFlag = true;
    let displayedColumns = ['srNo', 'standard', this.languageFlag == 'English' ? 'subject' : 'm_Subject', this.languageFlag == 'English' ? 'questionType' : 'm_QuestionType', this.languageFlag == 'English' ? 'educationYear' : 'm_EducationYear','action'];
    this.tableData = {
      pageNumber: this.pageNumber,
      img: '', blink: '', badge: '', isBlock: 'isBlock', pagintion: true, defaultImg: "",
      displayedColumns: displayedColumns,
      tableData: this.tableDataArray,
      tableSize: this.tableDatasize,
      tableHeaders: this.languageFlag == 'English' ? this.displayedheadersEnglish : this.displayedheadersMarathi,
      edit: true, delete: true
    };
    this.highLightFlag ? this.tableData.highlightedrow = true : this.tableData.highlightedrow = false,
      this.apiService.tableData.next(this.tableData);
  }

  getState(){
    this.stateArr = [];
    this.masterService.getAllState('').subscribe({
        next: (res: any) => {
          if(res.statusCode == "200"){
            this.stateArr.push({"id": 0, "state": "All", "m_State": "सर्व"}, ...res.responseData);
            this.getDistrict();
          }
          else{  this.stateArr = []; }
        }
      });
  }

  getDistrict() {
    this.districtArr = [];
    if(this.filterForm.value.stateId > 0){
      this.masterService.getAllDistrict(this.webService.languageFlag, this.filterForm.value.stateId).subscribe({
        next: (res: any) => {
          if (res.statusCode == "200") {
            this.districtArr.push({"id": 0, "district": "All", "m_District": "सर्व"}, ...res.responseData);
          }
          else { this.districtArr = []; }
        },
      });
    }
    else{ this.districtArr = [];}
  }

  clearFilter(flag: string){
    if(flag == 'state'){
      this.f['districtId'].setValue(0);
    }
  }

  getTableData(flag?: string) {
    this.ngxSpinner.show();
    this.pageNumber = flag == 'filter' ? 1 : this.pageNumber;
    let formValue = this.filterForm.value;

    let obj = `StateId=${formValue.stateId}&districtId=${formValue.districtId || 0}&pageno=${this.pageNumber}&pagesize=10&lan=${this.languageFlag}
    &TextSearch=${formValue.textSearch || 0}&questionTypeId=${formValue.questionTypeId || 0}&SubjectId=${formValue.subjectId || 0}
    &StandardId=${formValue.standardId || 0}&EducationYearId=${formValue.educationalYearId || 0}`;
 
    this.apiService.setHttp('GET', 'zp-satara/AssessmentQuestion/GetAll?' + obj, false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.ngxSpinner.hide();
          this.tableDataArray = res.responseData;
          // this.totalCount = res.responseData1.pageCount;
          // this.tableDatasize = res.responseData1.pageCount;
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

  clearFilterForm() {
    this.defaultForm();
    this.getTableData();
    this.pageNumber = 1;
    this.districtArr = [];
  }

  childCompInfo(obj: any) {
    switch (obj.label) {
      case 'Pagination':
        this.pageNumber = obj.pageNumber;
        this.getTableData();
        break;
      case 'Edit':
        // this.openDialog(obj);
        break;
      case 'Delete':
        // this.globalDialogOpen(obj);
        break;
      case 'Block':
      // this.openBlockDialog(obj);
    }
  }

  openDialog() {
    const dialogRef = this.dialog.open(AddCriteriaWiseQuestionComponent,{
      width: '700px',
      disableClose:true,
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

}
