import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ChartComponent } from 'ng-apexcharts';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { MasterService } from 'src/app/core/services/master.service';
import { WebStorageService } from 'src/app/core/services/web-storage.service';
import { ChartOptions } from '../dashbaord2.component';

@Component({
  selector: 'app-dashboard2-dashboard-detail',
  templateUrl: './dashboard2-dashboard-detail.component.html',
  styleUrls: ['./dashboard2-dashboard-detail.component.scss']
})
export class Dashboard2DashboardDetailComponent {
  filterForm !:FormGroup;
  academicYearId = new FormControl('');
  standardId = new FormControl('');
  subjectId = new FormControl('');
  examId = new FormControl('');

  pageNumber = 1;
  chartObj:any;
  tableDataArray = new Array();
  tableDatasize:any;
  viewDetailsObj:any;
  acYear = new Array();
  standardResp = new Array();
  subjectResp = new Array();
  selectedLang:any;
  graphResponse: any;
  questionArr: any;

  @ViewChild("questionwiseChart") schoolwiseChart!: ChartComponent;
  public questionwiseChartOptions!: Partial<ChartOptions> | any;

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
      this.defaultFormat();
      this.GetAllStandard();
      this.getSubject();
    });
     this.chartObj = JSON.parse(localStorage.getItem('selectedChartObjDashboard2') || '');
     console.log(this.chartObj);
     this.getTableData();
     this.getYearArray();
    //  this.schoolwiseBarChart();

     setTimeout(() => {
      this.getProgressIndicatorData();
     }, 2000);

    //  console.log(this.webStorage.getLoggedInLocalstorageData());
     
  }

  defaultFormat(){
  this.filterForm = this.fb.group({
    acYearId:[''],
    classId:[this.viewDetailsObj ? this.viewDetailsObj?.standardId: 0],
    subjectId:[0]
  });
  }

  getYearArray() {
    this.acYear = [];
    this.masterService.getAcademicYears().subscribe((res: any) => {
      this.acYear = res.responseData;
      this.academicYearId.setValue(this.webStorage.getLoggedInLocalstorageData().educationYearId);
    })
  }

  GetAllStandard() {
    this.masterService.GetAllStandardClassWise(this.selectedLang).subscribe({
      next: (res: any) => {
        if (res.statusCode == '200') {
          this.standardResp = [{ id: 0, standard: "All", m_Standard: "सर्व" }, ...res.responseData];
          this.viewDetailsObj ? this.standardId.setValue(this.viewDetailsObj?.standardId) : '';
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
          this.subjectId.setValue(this.subjectResp[1].id);
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
        this.viewDetailsObj = obj;
        console.log("viewDetailsObj", this.viewDetailsObj);
        this.GetAllStandard();
        setTimeout(() => {
          this.getProgressIndicatorData();
        }, 2000);
    
        //this.openDetailsDialog(obj);
        break;
    }
  }

  getTableData(){
    // console.log("this.chartObj", this.chartObj);
    
    this.chartObj.PageNo=1 
    this.chartObj.RowCount=10;
    this.ngxSpinner.show();

    let str = `StateId=${this.chartObj?.StateId || 0}&DistrictId=${this.chartObj?.DistrictId || 0}&TalukaId=${this.chartObj?.TalukaId || 0}&CenterId=${this.chartObj?.CenterId || 0}&VillageId=${this.chartObj?.VillageId || 0}&SchoolId=${this.chartObj?.SchoolId || 0}&StandardId=${this.chartObj?.StandardId || 0}&SubjectId=${this.chartObj?.SubjectId || 0}&EvaluatorId=${this.chartObj?.EvaluatorId || 0}&GraphLevelId=${this.chartObj?.GraphLevelId || 0}&ExamTypeId=${this.chartObj?.ExamTypeId || 0}&EducationYearId=${this.chartObj?.EducationYearId || 0}&GraphType=${this.chartObj?.graphName || ''}&PageNo=${this.pageNumber}&PageSize=10&lan=${this.selectedLang}`;

    this.apiService.setHttp('GET', 'zp-satara/Dashboard/GetStudentListForProgressIndicatorWeb?' + str, false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({

      next: (res: any) => {
        if (res.statusCode == "200") {
          this.ngxSpinner.hide();
          this.tableDataArray = res.responseData.responseData1;
          this.viewDetailsObj = res.responseData.responseData1[0];
          this.GetAllStandard();
          console.log("viewDetailsObj", this.viewDetailsObj);
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


  schoolwiseBarChart(critearr?: any) { //xAxiaArray?: any, yAxisArray?: anyz
    console.log(critearr);
    
    this.questionwiseChartOptions = {
      series: critearr,
      chart: {
        type: 'bar',
        stacked: true,
        stackType: "150%",
        height: 300,
        toolbar: {
          show: false
        },
        events: {}
      },
      title: {
        text: "akshar",
        align: "left"
      },
      colors: [
        '#50c77b',
        // '#2b908f',
        // '#f9a3a4',
        // '#90ee7e',
        // '#f48024',
      ],
      plotOptions: {
        bar: {
          horizontal: false,
          distributed: true,
        },
      },
      // dataLabels: {
      //   enabled: true,
      // },
      legend: {
        show: false
      },
      xaxis: {
        categories: ['Nitin R ghorpade (Teacher)'],  //'Officer'
        axisTicks: {
          show: false
        },
        style: {
          fontSize: '12px',
          fontFamily: 'Noto Sans Devanagari, sans-serif',
          cssClass: 'apexcharts-xaxis-label',
        },
      },
      grid: {
        show:true,
        xaxis: {
            lines: {
                show: false
            }
        },
        yaxis: {
          lines: {
              show: false
          }
      }
      },
      yaxis: {
        min: -1,
        labels: {
          formatter: function (val: any) {
            return val < 0 ? '' : val.toFixed(0); // y axis  values 0 1 2
          }
        },
        axisTicks: {
          show: true,
        },
      }
    }
    console.log("questionwiseChartOptions",this.questionwiseChartOptions)
  }

  getProgressIndicatorData(){
    // zp-satara/Dashboard/GetStudentProgressIndicatorDataWeb?StudentId=8006&AssessedClassId=1&SubjectId=1&ExamTypeId=0&EducationYearId=1&lan=EN
    let str = `StudentId=${this.viewDetailsObj?.studentId}&AssessedClassId=${this.standardId.value}&SubjectId=${this.subjectId.value}&ExamTypeId=0&EducationYearId=${this.academicYearId.value}&lan=${this.selectedLang}`
    this.apiService.setHttp('get', 'zp-satara/Dashboard/GetStudentProgressIndicatorDataWeb?' + str, false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        this.graphResponse =  res.responseData?.responseData1;
        console.log("res: ", this.graphResponse);
      }
    });
  }

  barChartData(){
    console.log("this.graphResponse", this.graphResponse);
    
    let examId = this.examId.value;
    this.questionArr = [];
    this.graphResponse.map((x: any) => {

      if(examId == x.examTypeId){
        x.criteriaModel.map((res: any) => {
          let GrdeArr: any = [];
          res.assessedDataModel.map((gr:any)=>GrdeArr.push(gr.grade))
          let obj = {
            questionId: res.questionId,
            question: res.question,
            m_Question: res.m_Question,
            gradeArr: GrdeArr,
            // max: Math.max(...GrdeArr),
            parameterArr: res.parameterModel
          }
          this.questionArr.push(obj);
        });          
      }
    });  

  let arrayData=new Array();
  this.questionArr.forEach((chart:any)=>{
    const data=[{
      name: 'Percentage',
      // data: chart?.data.concat([2]),
      data: chart?.gradeArr,
      // max: chart.max
    }]
    arrayData.push(data)
  });

  console.log("this.questionArr", arrayData, this.questionArr);
  this.schoolwiseBarChart(arrayData);
  }



}
