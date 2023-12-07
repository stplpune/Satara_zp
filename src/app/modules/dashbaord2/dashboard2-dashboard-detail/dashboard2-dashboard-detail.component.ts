import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { MasterService } from 'src/app/core/services/master.service';
import { WebStorageService } from 'src/app/core/services/web-storage.service';

@Component({
  selector: 'app-dashboard2-dashboard-detail',
  templateUrl: './dashboard2-dashboard-detail.component.html',
  styleUrls: ['./dashboard2-dashboard-detail.component.scss']
})
export class Dashboard2DashboardDetailComponent {
  filterForm !:FormGroup
  pageNumber = 1;
  chartObj:any;
  tableDataArray = new Array();
  tableDatasize:any;
  viewDetailsObj:any;
  acYear = new Array();
  standardResp = new Array();
  subjectResp = new Array();
  selectedLang:any

  constructor(
    private fb:FormBuilder,
    private apiService: ApiService,
    private ngxSpinner: NgxSpinnerService,
    public webStorage: WebStorageService,
    private errors: ErrorsService,
    private masterService: MasterService,
    private commonMethodS: CommonMethodsService,
  ) { }

  ngOnInit() {
    this.webStorage.langNameOnChange.subscribe((lang) => {
      this.selectedLang = lang;
      this.GetAllStandard();
      this.getSubject();
    });
     this.chartObj = JSON.parse(localStorage.getItem('selectedChartObjDashboard2') || '');
     console.log(this.chartObj);
     this.getTableData();
     this.defaultFormat();
     this.getYearArray();
    
     
  }

  defaultFormat(){
  this.filterForm = this.fb.group({
    acYearId:[''],
    classId:[0],
    subjectId:[0]
  })
  }

  getYearArray() {
    this.acYear = [];
    this.masterService.getAcademicYears().subscribe((res: any) => {
      this.acYear = res.responseData;
      //this.f['acYearId'].patchValue(this.educationYear);
    })
  }

  GetAllStandard() {
    this.masterService.GetAllStandardClassWise(this.selectedLang).subscribe({
      next: (res: any) => {
        if (res.statusCode == '200') {
          this.standardResp = [{ id: 0, standard: "All", m_Standard: "सर्व" }, ...res.responseData];
        }
      },
      error: (() => {
        this.standardResp = [];
      })
    });
  }

  getSubject() {
    this.masterService.getAllSubject(this.selectedLang).subscribe({
      next: (res: any) => {
        if (res.statusCode == '200') {
          this.subjectResp = [{ id: 0, subject: "All", m_Subject: "सर्व" }, ...res.responseData];
        }
      },
      error: (() => {
        this.subjectResp = [];
      })
    });
  }

  childCompInfo(obj: any) {
    switch (obj.label) {
      case 'Pagination':
        this.pageNumber = obj.pageNumber;
        this.getTableData();
        break;
      // case 'Edit':
      //   this.addUpdateSchool(obj, 'school');
      //   break;
      // case 'Delete':
      //   this.globalDialogOpen(obj);
      //   break;
      case 'View':
        console.log(obj);
        this.viewDetailsObj = obj;
        //this.openDetailsDialog(obj);
        break;
    }
  }

  getTableData(){
    this.chartObj.PageNo=1 
    this.chartObj.RowCount=10
    this.ngxSpinner.show();
    this.apiService.setHttp('GET', 'zp-satara/Dashboard/GetStudentListForProgressIndicatorWeb?', false, false, this.chartObj, 'baseUrl');
    this.apiService.getHttp().subscribe({

      next: (res: any) => {
        if (res.statusCode == "200") {
          this.ngxSpinner.hide();
          this.tableDataArray = res.responseData.responseData1;
          this.viewDetailsObj = res.responseData.responseData1[0];
          this.tableDatasize = res.responseData.responseData2[0].totalCount;
          this.setTableData();
        }
        else {
          this.ngxSpinner.hide();
        }
      },
      error: ((err: any) => { this.ngxSpinner.hide(); this.commonMethodS.checkEmptyData(err.statusText) == false ? this.errors.handelError(err.statusCode) : this.commonMethodS.showPopup(err.statusText, 1); })
    });
  }


  setTableData() {
   // this.highLightFlag = true;
    let displayedColumns = ['srNo', 'fullName', 'standard', 'gender']
  //  let marathiDisplayedColumns = ['docPath', 'srNo', 'm_FullName', 'm_Standard', 'mobileNo', 'm_Gender'];
   let displayedheaders = ['SrNo', 'Full Name', 'Standard', 'Gender']
    let tableData = {
      highlightedrow: true,
      edit: true,
      delete: false,
      pageNumber: this.pageNumber,
      img: '', blink: '', badge: '', isBlock: '', pagintion: this.tableDatasize > 10 ? true : false,
      displayedColumns: displayedColumns,  // this.isWriteRight == true ? this.languageFlag == 'English' ? this.displayedColumns : this.marathiDisplayedColumns : this.languageFlag == 'English' ? displayedColumns : marathiDisplayedColumns,
      tableData: this.tableDataArray,
      tableSize: this.tableDatasize,
      tableHeaders: displayedheaders
    };
 //   this.highLightFlag ? tableData.highlightedrow = true : tableData.highlightedrow = false,
      this.apiService.tableData.next(tableData);
  }

}
