import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddExamMasterComponent } from './add-exam-master/add-exam-master.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ApiService } from 'src/app/core/services/api.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { WebStorageService } from 'src/app/core/services/web-storage.service';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { DownloadPdfExcelService } from 'src/app/core/services/download-pdf-excel.service';
import { DatePipe } from '@angular/common';
import { MasterService } from 'src/app/core/services/master.service';
import { GlobalDialogComponent } from 'src/app/shared/components/global-dialog/global-dialog.component';
import { ValidationService } from 'src/app/core/services/validation.service';
@Component({
  selector: 'app-add-test',
  templateUrl: './add-test.component.html',
  styleUrls: ['./add-test.component.scss']
})
export class AddTestComponent {
  filterForm!: FormGroup;
  languageFlag: any;
  pageNumber: number = 1;
  totalCount!: number;
  tableDataArray = new Array();
  tableDatasize!: number;
  highLightFlag: any;
  displayedColumns = new Array();
  // isWriteRight!: boolean;
  districtArr = new Array();
  stateArr = new Array();
  displayedheaders = ['Sr. No.', 'State', 'District', 'Exam', 'From Month' , 'To Month','action'];
  marathiDisplayedheaders = ['अनुक्रमांक', 'राज्य', 'जिल्हा', 'परीक्षा', 'महिन्यापासून', 'महिन्यापर्यंत', 'कृती'];

  constructor(public dialog: MatDialog,
    private fb: FormBuilder,
    private apiService: ApiService,
    private ngxSpinner: NgxSpinnerService,
    private webService: WebStorageService,
    private commonMethods: CommonMethodsService,
    private errors: ErrorsService,
    private downloadFileService: DownloadPdfExcelService,
    private datepipe: DatePipe,
    public validationService: ValidationService,
    private masterService: MasterService) { }

    ngOnInit(){
      this.languageFlag = this.webService.languageFlag;
      this.webService.langNameOnChange.subscribe(lang => {
        this.languageFlag = lang;
        this.setTableData();
      });
      this.getState();
      this.formField();
      this.getTableData();
    }

    formField(){
      this.filterForm = this.fb.group({
        stateId: [0],
        districtId: [0],
        textSearch: [''],
        date: ['']
      })
    }

    getTableData(flag?: any){
      this.ngxSpinner.show();
      this.pageNumber = flag == 'filter' ? 1 : this.pageNumber;
      let pageNo = this.pageNumber;
      
      let str = `StateId=${this.filterForm.value.stateId || 0}&DistrictId=${this.filterForm.value.districtId || 0}&TextSearch=${this.filterForm.value.textSearch?.trim() || ''}&PageNo=${pageNo}&PageSize=10&lan=${this.languageFlag || ''}`;
      let reportStr = `StateId=${this.filterForm.value.stateId || 0}&DistrictId=${this.filterForm.value.districtId || 0}&TextSearch=${this.filterForm.value.textSearch?.trim() || ''}&PageNo=1&PageSize=${this.totalCount * 10}&lan=${this.languageFlag || ''}`;
    
      this.apiService.setHttp('GET', 'zp-satara/ExamType/GetAll?' + ((flag == 'pdfFlag' || flag == 'excel') ? reportStr : str), false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => {
          if (res.statusCode == 200){
            this.ngxSpinner.hide();
            (flag != 'pdfFlag' && flag != 'excel') ? this.tableDataArray = res.responseData.responseData1 : this.tableDataArray = this.tableDataArray;
            (flag != 'pdfFlag' && flag != 'excel') ? this.tableDatasize = res.responseData.responseData2.pageCount : this.tableDatasize = this.tableDatasize;
  
            let data: [] = (flag == 'pdfFlag' || flag == 'excel') ? res.responseData.responseData1 : [];
            flag == 'pdfFlag' ? this.downloadPdf(data, 'pdfFlag') : flag == 'excel' ? this.downloadPdf(data, 'excel') : '';
          }
          else{
            this.ngxSpinner.hide();
            (flag == 'pdfFlag' || flag == 'excel') ? this.commonMethods.showPopup("No Data Found", 1) : '';
            this.tableDataArray = [];
            this.tableDatasize = 0;
          }
          this.setTableData();
        },
        error: ((err: any) => { this.ngxSpinner.hide(); this.errors.handelError(err.statusCode) })
      })
    }

    setTableData() {
      this.highLightFlag = true;
      // let displayedColumnsReadMode = ['srNo', this.languageFlag == 'English' ? 'state' : 'm_State', this.languageFlag == 'English' ? 'district' : 'm_District', this.languageFlag == 'English' ? 'examType' : 'm_ExamType'];
      this.displayedColumns = ['srNo', this.languageFlag == 'English' ? 'state' : 'm_State', this.languageFlag == 'English' ? 'district' : 'm_District', this.languageFlag == 'English' ? 'examType' : 'm_ExamType', 'fromMonthFormatdate', 'toMonthFormatdate',  'action'];
      let tableData = {
        highlightedrow: true,
        edit: true,
        delete: true,
        pageNumber: this.pageNumber,
        img: '', blink: '', badge: '', isBlock: '', pagintion: this.tableDatasize > 10 ? true : false,
        // displayedColumns: this.isWriteRight == true ? this.displayedColumns : displayedColumnsReadMode,
        displayedColumns: this.displayedColumns,
        tableData: this.tableDataArray,
        tableSize: this.tableDatasize,
        tableHeaders: this.languageFlag == 'English' ? this.displayedheaders : this.marathiDisplayedheaders
      };
      this.highLightFlag ? tableData.highlightedrow = true : tableData.highlightedrow = false,
        this.apiService.tableData.next(tableData);
    }

    downloadPdf(data: any, flag?: string) {
      let resultDownloadArr: any = [];
      data.find((ele: any, i: any) => {
        let obj = {
          srNo:  (i + 1),
          state: flag == 'excel' ? this.languageFlag == 'English' ? ele.state : ele.m_State : ele.state,
          district: flag == 'excel' ? this.languageFlag == 'English' ? ele.district : ele.m_District : ele.district,
          exam: flag == 'excel' ? this.languageFlag == 'English' ? ele.examType : ele.m_ExamType : ele.examType,
        }
        resultDownloadArr.push(obj);
  
      });
      // download pdf call
      if (resultDownloadArr?.length > 0) {
        let keyPDFHeader = ['Sr.No', 'State', 'District', 'Exam'];
        let marathikeyHeader = ['अनुक्रमांक', 'राज्य', 'जिल्हा', 'परीक्षा']
        let ValueData =
          resultDownloadArr.reduce(
            (acc: any, obj: any) => [...acc, Object.values(obj).map((value) => value)], []
          );
        let objData: any;
  
        objData= {
          'topHedingName': flag == 'excel' ? this.languageFlag == 'English' ? 'Exam List' : 'परिक्षेची यादी' : 'Subject List',
          'createdDate': (flag == 'excel' ? this.languageFlag == 'English' ? 'Created on:' : 'रोजी तयार केले :' : 'Created on:')+ this.datepipe.transform(new Date(), 'yyyy-MM-dd, h:mm a')
        }
  
        let headerKeySize = [7, 40, 15, 15, 15,];
        flag == 'pdfFlag' ? this.downloadFileService.downLoadPdf(keyPDFHeader, ValueData, objData) : this.downloadFileService.allGenerateExcel(this.languageFlag == 'English' ? keyPDFHeader : marathikeyHeader, ValueData, objData, headerKeySize);
      }
    }

    getState(){
      this.stateArr = [];
      this.masterService.getAllState('').subscribe({
        next: (res: any) => {
          if(res.statusCode == "200"){
            this.stateArr.push({"id": 0, "state": "All", "m_State": "सर्व"}, ...res.responseData);
          }
          else{
            this.stateArr = [];
          }
        }
      })
    }
  
    getDistrict() {
      this.districtArr = [];
      let stateId = this.filterForm.value.stateId;
      if(stateId != 0){
        this.masterService.getAllDistrict('', stateId).subscribe({
          next: (res: any) => {
            if (res.statusCode == "200") {
              this.districtArr.push({"id": 0, "district": "All", "m_District": "सर्व"}, ...res.responseData);
              this.filterForm.controls['districtId'].setValue(0);
            }
            else {
              this.districtArr = [];
            }
          },
        });  
      }
    }

    childTableCompInfo(obj: any) {
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
    const dialogRef = this.dialog.open(AddExamMasterComponent, {
      width: '800px',
      data: obj,
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if(result == 'yes' && obj){
        this.getTableData();
        this.pageNumber = obj.pageNumber;
      }
      else if(result == 'yes'){
        this.onClear();
        this.pageNumber = 1;
      }
      this.highLightFlag = false;
      this.setTableData();
    });
  }

  globalDialogOpen(obj: any) {
    let dialoObj = {
      header: 'Delete',
      title: this.webService.languageFlag == 'EN' ? 'Do you want to delete Exam record?' : 'तुम्हाला परीक्षेचा रेकॉर्ड हटवायचा आहे का?',
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
      this.setTableData();
    })
  }

  onClickDelete(obj: any){
    let webStorageMethod = this.webService.createdByProps();
    let deleteObj = {
      "id": obj.id,
      "deletedBy": this.webService.getUserId(),
      "modifiedDate": webStorageMethod.modifiedDate,
      "lan": this.webService.languageFlag
    }
    this.apiService.setHttp('delete', 'zp-satara/ExamType/DeleteExamType', false, deleteObj, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.commonMethods.showPopup(res.statusMessage, 0);
          this.getTableData();
        }
      },
      error: (error: any) => {
        this.commonMethods.checkEmptyData(error.statusText) == false ? this.errors.handelError(error.statusCode) : this.commonMethods.showPopup(error.statusText, 1);
      }
    });
  }

  onClear(){
    this.districtArr = [];
    this.formField();
    this.getTableData();
  }

  clearDropdown(flag?: string){
    if(flag == 'state' ){
      this.filterForm.controls['districtId']?.setValue('');
      this.districtArr = [];
    }
  }
}


