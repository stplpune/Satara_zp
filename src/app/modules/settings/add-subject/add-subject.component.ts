import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddAssessmentSubjectComponent } from './add-assessment-subject/add-assessment-subject.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormBuilder, FormGroup } from '@angular/forms';
import { WebStorageService } from 'src/app/core/services/web-storage.service';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { DownloadPdfExcelService } from 'src/app/core/services/download-pdf-excel.service';
import { DatePipe } from '@angular/common';
import { MasterService } from 'src/app/core/services/master.service';

@Component({
  selector: 'app-add-subject',
  templateUrl: './add-subject.component.html',
  styleUrls: ['./add-subject.component.scss']
})
export class AddSubjectComponent {
  filterForm!: FormGroup;
  languageFlag: any;
  pageNumber: number = 1;
  totalCount!: number;
  tableDataArray = new Array();
  tableDatasize!: number;
  highLightFlag: any;
  displayedColumns = new Array();
  isWriteRight!: boolean;
  districtArr = new Array();
  stateArr = new Array();
  displayedheaders = ['Sr. No.', 'State', 'District', 'Subject', 'action'];
  marathiDisplayedheaders = ['अनुक्रमांक', 'राज्य', 'जिल्हा', 'विषय', 'कृती'];

  constructor(public dialog: MatDialog,
    private fb: FormBuilder,
    private apiService: ApiService,
    private ngxSpinner: NgxSpinnerService,
    private webService: WebStorageService,
    private commonMethods: CommonMethodsService,
    private errors: ErrorsService,
    private downloadFileService: DownloadPdfExcelService,
    private datepipe: DatePipe,
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
        textSearch: ['']
      })
    }

    getTableData(flag?: any){
    this.ngxSpinner.show();
    this.pageNumber = flag == 'filter' ? 1 : this.pageNumber;
    let pageNo = this.pageNumber;
    // zp-satara/AssessmentSubject/GetAll?StateId=0&DistrictId=0&TextSearch=l&PageNo=1&PageSize=10&lan=EN

    let str = `StateId=${this.filterForm.value.stateId || 0}&DistrictId=${this.filterForm.value.districtId || 0}&TextSearch=${this.filterForm.value.textSearch?.trim() || ''}&PageNo=${pageNo}&PageSize=10&lan=${this.languageFlag || ''}`;
    let reportStr = `?pageno=1&pagesize=${this.totalCount * 10}&textSearch=${this.filterForm.value.textSearch?.trim() || ''}&TalukaId=${this.filterForm.value.talukaId || 0}&CenterId=${this.filterForm.value.centerId || 0}&VillageId=${this.filterForm.value.villageId || 0}&SchoolId=${this.filterForm.value.schoolId || 0}&lan=${this.languageFlag || ''}`;

    this.apiService.setHttp('GET', 'zp-satara/AssessmentSubject/GetAll?' + ((flag == 'pdfFlag' || flag == 'excel') ? reportStr : str), false, false, false, 'baseUrl');
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
    let displayedColumnsReadMode = ['srNo', this.languageFlag == 'English' ? 'state' : 'm_State', this.languageFlag == 'English' ? 'district' : 'm_District', this.languageFlag == 'English' ? 'subjectName' : 'm_SubjectName'];
    this.displayedColumns = ['srNo', this.languageFlag == 'English' ? 'state' : 'm_State', this.languageFlag == 'English' ? 'district' : 'm_District', this.languageFlag == 'English' ? 'subjectName' : 'm_SubjectName', 'action'];
    let tableData = {
      highlightedrow: true,
      edit: true,
      delete: false,
      pageNumber: this.pageNumber,
      img: '', blink: '', badge: '', isBlock: '', pagintion: this.tableDatasize > 10 ? true : false,
      displayedColumns: this.isWriteRight === true ? this.displayedColumns : displayedColumnsReadMode,
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
        schoolName: flag == 'excel' ? this.languageFlag == 'English' ? ele.schoolName : ele.m_SchoolName : ele.schoolName,
        taluka: flag == 'excel' ? this.languageFlag == 'English' ? ele.taluka : ele.m_Taluka : ele.taluka,
        center: flag == 'excel' ? this.languageFlag == 'English' ? ele.center : ele.m_Center : ele.center,
        village: flag == 'excel' ? this.languageFlag == 'English' ? ele.village : ele.m_Village : ele.village,
      }
      resultDownloadArr.push(obj);

    });
    // download pdf call
    if (resultDownloadArr?.length > 0) {
      let keyPDFHeader = ['Sr.No', 'State', 'District', 'Subject'];
      let marathikeyHeader = ['अनुक्रमांक', 'राज्य', 'जिल्हा', 'विषय']
      let ValueData =
        resultDownloadArr.reduce(
          (acc: any, obj: any) => [...acc, Object.values(obj).map((value) => value)], []
        );
      let objData: any;

      objData= {
        'topHedingName': flag == 'excel' ? this.languageFlag == 'English' ? 'Subject List' : 'विषयाची यादी' : 'Subject List',
        'createdDate': (flag == 'excel' ? this.languageFlag == 'English' ? 'Created on:' : 'रोजी तयार केले :' : 'Created on:')+ this.datepipe.transform(new Date(), 'yyyy-MM-dd, h:mm a')
      }

      let headerKeySize = [7, 40, 15, 15, 15,];
      flag == 'pdfFlag' ? this.downloadFileService.downLoadPdf(keyPDFHeader, ValueData, objData) : this.downloadFileService.allGenerateExcel(this.languageFlag == 'English' ? keyPDFHeader : marathikeyHeader, ValueData, objData, headerKeySize);
    }
  }

  getState(){
    this.stateArr = [
      {"id": 0, "state": "All", "m_State": "सर्व"},
      {"id": 1, "state": "Maharashtra", "m_State": "महाराष्ट्र"}
    ];
  }

  getDistrict() {
    this.districtArr = [];
    // let stateId = this.filterForm.value.stateId;
    this.masterService.getAllDistrict('').subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.districtArr.push({"id": 0, "district": "All", "m_District": "सर्व"}, ...res.responseData);
          this.filterForm.controls['districtId'].setValue(0);
        }
        else {
          this.districtArr = [];
        }
      },
      error: ((err: any) => { this.commonMethods.checkEmptyData(err.statusText) == false ? this.errors.handelError(err.statusCode) : this.commonMethods.showPopup(err.statusText, 1); })
    });
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
      // case 'Delete':
      //   this.deteleDialogOpen(obj);
      //   break;
      // case 'View':
      //   this.openDetailsDialog(obj);
      //   break;
    }
  }

  openDialog(obj?: any) {
    console.log("obj: ", obj);
    
    const dialogRef = this.dialog.open(AddAssessmentSubjectComponent, {
      width: '500px',
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
      this.getTableData();
    });
  }

  onClear(){
    this.districtArr = [];
    this.formField();
    this.getTableData();
  }
}



