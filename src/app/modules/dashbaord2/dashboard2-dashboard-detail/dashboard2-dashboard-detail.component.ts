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
  chartArray = new Array;
  questionArr: any;
  talukaLabel: any;
  districtLabel: any;
  stateData = new Array();
  districtData = new Array();
  talukaArr = new Array();
  centerArr = new Array();
  schoolArr = new Array();
  villageArr = new Array();
  standardArr = new Array();
  mainFilterForm!: FormGroup
  subjectArr = new Array();
  StudentData: any;
  districtLable: any;
  talukaLable: any;
  centerLable: any;
  villageLable: any;
  schoolLable: any;
  evaluatorDataArray = new Array();
  get mf() { return this.mainFilterForm.controls }
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
    this.formData();
    this.getState();
    this.getEvaluator();
    this.getSubjectMain();
    this.webStorage.langNameOnChange.subscribe((lang) => {
      this.selectedLang = lang;
      this.setTableData();
      this.defaultFormat();
      this.GetAllStandard();
      this.getSubject();
    });
     this.chartObj = JSON.parse(localStorage.getItem('selectedChartObjDashboard2') || '');
     this.getTableData();
     this.getYearArray();     
     console.log("chartObj: ", this.chartObj);
     
  }

  formData() {
    this.mainFilterForm = this.fb.group({
      acYearId:[''],
      stateId:[''],
      districtId:[''],
      talukaId: [0],
      villageId:[0],
      centerId: [0],
      schoolId: [0],
      standardId: [''],
      subjectId: [0],
      evaluatorId: [0],
      examTypeId: [0]
    });
  }


  getState(){
    this.stateData = [];
    this.masterService.getAllState(this.selectedLang).subscribe((res:any)=>{
     this.stateData = res.responseData;
     this.chartObj?.StateId ? (this.mf['stateId'].setValue(this.chartObj?.StateId),this.getDistrict()) :''
    })
  }
  getDistrict() {
    this.districtData = [];
    this.masterService.getAllDistrict('', this.mainFilterForm.controls['stateId'].value).subscribe((res: any) => {
      this.districtData = res.responseData;
      this.chartObj?.DistrictId ? (this.mf['districtId'].setValue(this.chartObj?.DistrictId),this.getTaluka()) :''

    });
  }

  getTaluka() {
    this.districtLable = this.districtData.find((res: any) => res.id == this.mf['districtId'].value);
    console.log("districtLable", this.districtLable);
    
    this.talukaArr = [];
    let districtId = this.mainFilterForm.controls['districtId'].value
    if(districtId != 0){
      this.masterService.getAllTaluka('', districtId).subscribe({
        next: (res: any) => {
          if (res.statusCode == 200) {
            this.talukaArr.push({ "id": 0, "taluka": "All", "m_Taluka": "सर्व" }, ...res.responseData);
            this.mainFilterForm.controls['talukaId'].setValue(0);
            this.chartObj?.TalukaId ? (this.mf['talukaId'].setValue(this.chartObj?.TalukaId), this.getAllCenter()) : this.getAllCenter();
            // this.talukaArr = res.responseData;
          } else {
            this.commonMethodS.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethodS.showPopup(res.statusMessage, 1);
            this.talukaArr = [];
          }
        },
        // error: ((err: any) => { this.errors.handelError(err.statusCode) })
      });
    }
   
  }

  getAllCenter() {
    this.talukaLable = this.talukaArr.find((res: any) => res.id == this.mf['talukaId'].value);
    console.log("talukaLable", this.talukaLable);
    this.centerArr = [];
    let Tid = this.mainFilterForm.value.talukaId;
    if (Tid != 0) {
      this.masterService.getAllCenter('', Tid).subscribe({
        next: (res: any) => {
          if (res.statusCode == 200) {
            this.centerArr.push({ "id": 0, "center": "All", "m_Center": "सर्व" }, ...res.responseData);
            this.mainFilterForm.controls['centerId'].setValue(0);
            this.chartObj?.CenterId ? (this.mf['centerId'].setValue(this.chartObj?.CenterId), this.getVillage()) : this.getVillage();
          } else {
            this.commonMethodS.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethodS.showPopup(res.statusMessage, 1);
            this.centerArr = [];
          }
        },
        // error: ((err: any) => { this.errors.handelError(err.statusCode) })
      });
    }
  }

  getVillage() {
    this.centerLable = this.centerArr.find((res: any) => res.id == this.mf['centerId'].value);
    console.log("centerLable", this.centerLable);

    this.villageArr = [];
    let centerId = this.mainFilterForm.value.centerId;
    if(centerId != 0){
      this.masterService.getAllVillage('', centerId).subscribe({
        next : (res : any)=>{
          if(res.statusCode == "200"){
            this.villageArr.push({ "id": 0, "village": "All", "m_Village": "सर्व" }, ...res.responseData);
            this.chartObj?.VillageId ? (this.mf['villageId'].setValue(this.chartObj?.VillageId), this.getAllSchoolsByCenterId()) :'';

          } else{
            this.villageArr = [];
          }
        },
        // error: ((err: any) => { this.errors.handelError(err.statusCode) })
      });
    }
  }

  getAllSchoolsByCenterId() {    
    this.villageLable = this.villageArr.find((res: any) => res.id == this.mf['villageId'].value);
    console.log("villageLable", this.villageLable);

    this.schoolArr = [];
    let Tid = this.mainFilterForm.value.talukaId;
    let Cid = this.mainFilterForm.value.centerId;
    let Vid = this.mainFilterForm.value.villageId;
    if (Vid != 0) {  //removed - when navigate from  high low school table not patch schoolname in heading  
      this.masterService.getAllSchoolByCriteria('',Tid, Vid,Cid).subscribe({
        next: (res: any) => {
          if (res.statusCode == 200) {
            this.schoolArr.push({ "id": 0, "schoolName": "All", "m_SchoolName": "सर्व" }, ...res.responseData);
            this.mainFilterForm.controls['schoolId'].setValue(0);
            this.chartObj?.SchoolId ? (this.mf['schoolId'].setValue(this.chartObj?.SchoolId), this.getStandard()) : '';
          } else {
            // this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
            this.schoolArr = [];
          }
        },
        // error: ((err: any) => { this.errors.handelError(err.statusCode) })
      });
    }
  }

 

  getStandard() {
    this.schoolLable = this.schoolArr.find((res: any) => res.id == this.mf['schoolId'].value);
    console.log("schoolLable", this.schoolLable);

    this.standardArr =[];
    let schoolId = this.mainFilterForm.value.schoolId;
    if(schoolId != 0){
      this.masterService.GetStandardBySchool(schoolId, '').subscribe({
        next: (res: any) => {
          if (res.statusCode == 200) {
            this.standardArr = [];
            this.standardArr.push({ "id": 0, "standard": "All", "m_Standard": "सर्व" }, ...res.responseData);
            this.chartObj?.StandardId ? (this.mf['standardId'].setValue(this.chartObj?.StandardId), this.getSubjectMain()) : '';
          } else {
            this.commonMethodS.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethodS.showPopup(res.statusMessage, 1);
            this.standardArr = [];
          }
        },
        // error: ((err: any) => { this.errors.handelError(err.statusCode) })
      });
    }
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
      this.chartObj?.EducationYearId ? this.mf['acYearId'].setValue(this.chartObj?.EducationYearId) :''
    })
  }

  GetAllStandard() {
    this.standardResp = []
    this.masterService.GetAllStandardClassWise(this.selectedLang).subscribe({
      next: (res: any) => {
        if (res.statusCode == '200') {
          // this.standardResp = [{ id: 0, standard: "All", m_Standard: "सर्व" }, ...res.responseData];
          this.standardResp = res.responseData;
          this.viewDetailsObj ? this.standardId.setValue(this.viewDetailsObj?.standardId) : '';
        }
      },
      error: (() => {
        this.standardResp = [];
      })
    });
  }

  getSubject() {
    this.subjectResp = [];
    this.masterService.getAllSubject(this.selectedLang).subscribe({
      next: (res: any) => {
        if (res.statusCode == '200') {
          // this.subjectResp = [{ id: 0, subject: "All", m_Subject: "सर्व" }, ...res.responseData];
          this.subjectResp = res.responseData;
          this.subjectId.setValue(this.subjectResp[0].id);
        }
      },
      error: (() => {
        this.subjectResp = [];
      })
    });
  }
  getSubjectMain() {
    this.subjectArr = [];
      this.masterService.getAllSubject('').subscribe({
        next: (res: any) => {
          if (res.statusCode == 200) {
            this.subjectArr.push({ "id": 0, "subject": "All", "m_Subject": "सर्व" }, ...res.responseData);
            this.chartObj?.SubjectId ? this.filterForm.controls['subjectId'].setValue(this.chartObj?.SubjectId) : '';
          } else {
            this.commonMethodS.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethodS.showPopup(res.statusMessage, 1);
            this.subjectArr = [];
          }
        },
        error: ((err: any) => { this.errors.handelError(err.statusCode) })
      });
  }

  getEvaluator() {
    this.apiService.setHttp('get', 'zp-satara/master/GetAllEvaluator?flag_lang=' + this.selectedLang, false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == '200') {
          this.evaluatorDataArray = res.responseData;
          this.chartObj?.EvaluatorId ? this.mf['evaluatorId'].setValue(this.chartObj?.EvaluatorId) : '';
        } else {
          this.evaluatorDataArray = [];
        }
      },
      error: (() => { this.evaluatorDataArray = []; })
    })

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
        this.chartArray = [];
        this.GetAllStandard();
        setTimeout(() => {
          this.getProgressIndicatorData();
        }, 2000);
    
        //this.openDetailsDialog(obj);
        break;
    }
  }

  getTableData(flag?: string){
    let formData = this.mainFilterForm.value;
    this.chartObj.PageNo=1;
    this.chartObj.RowCount=10;
    this.ngxSpinner.show();
    let str = `StateId=${this.chartObj?.StateId || 0}&DistrictId=${this.chartObj?.DistrictId || 0}&TalukaId=${this.chartObj?.TalukaId || 0}&CenterId=${this.chartObj?.CenterId || 0}&VillageId=${this.chartObj?.VillageId || 0}&SchoolId=${this.chartObj?.SchoolId || 0}&StandardId=${this.chartObj?.StandardId || 0}&SubjectId=${this.chartObj?.SubjectId || 0}&EvaluatorId=${this.chartObj?.EvaluatorId || 0}&GraphLevelId=${this.chartObj?.GraphLevelId || 0}&ExamTypeId=${this.chartObj?.ExamTypeId || 0}&EducationYearId=${this.chartObj?.EducationYearId || 0}&GraphType=${this.chartObj?.graphName || ''}&PageNo=${this.pageNumber}&PageSize=10&lan=${this.selectedLang}`;
    let mainFilterstr = `StateId=${formData.stateId || 0}&DistrictId=${formData.districtId || 0}&TalukaId=${formData.talukaId || 0}&CenterId=${formData.centerId || 0}&VillageId=${formData.villageId || 0}&SchoolId=${formData.schoolId || 0}&StandardId=${formData?.standardId || 0}&SubjectId=${formData?.subjectId || 0}&EvaluatorId=${formData?.evaluatorId || 0}&GraphLevelId=${this.chartObj?.GraphLevelId || 0}&ExamTypeId=${this.chartObj?.ExamTypeId || 0}&EducationYearId=${formData.acYearId || 0}&GraphType=${this.chartObj?.graphName || ''}&PageNo=${this.pageNumber}&PageSize=10&lan=${this.selectedLang}`;
    let URL = (flag == undefined ? str : mainFilterstr)
    this.apiService.setHttp('GET', 'zp-satara/Dashboard/GetStudentListForProgressIndicatorWeb?' + URL, false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.tableDataArray = res.responseData?.responseData1;
          this.viewDetailsObj = res.responseData?.responseData1[0];
          this.ngxSpinner.hide();
          this.GetAllStandard();
          this.chartArray = [];
          setTimeout(() => {
            if(this.tableDataArray.length){
              this.getProgressIndicatorData();
            }
          }, 2000);
          this.tableDatasize = res.responseData.responseData2[0].totalCount;
        }
        else {
          this.ngxSpinner.hide();
          this.tableDataArray = [];
          this.tableDatasize = 0;
          this.viewDetailsObj = null
          this.StudentData = null

        }
        this.setTableData();
      },
      error: ((err: any) => { this.ngxSpinner.hide(); this.commonMethodS.checkEmptyData(err.statusText) == false ? this.errors.handelError(err.statusCode) : this.commonMethodS.showPopup(err.statusText, 1); })
    });
  }


  setTableData() {
   // this.highLightFlag = true;
    let displayedColumns = ['srNo', this.selectedLang == 'English' ? 'fullName' :'m_FullName', this.selectedLang == 'English' ? 'standard' : 'm_Standard', this.selectedLang == 'English' ? 'gender' : 'm_Gender']
  //  let marathiDisplayedColumns = ['docPath', 'srNo', 'm_FullName', 'm_Standard', 'mobileNo', 'm_Gender'];
   let displayedheaders = ['SrNo', 'Full Name', 'Standard', 'Gender']
   let displayedheadersMarathi = ['अ.क्र.', 'नाव', 'इयत्ता', 'लिंग']

    let tableData = {
      edit: true,
      delete: false,
      pageNumber: this.pageNumber,
      img: '', blink: '', badge: '', isBlock: '', pagintion: this.tableDatasize > 10 ? true : false,
      highlightedrow:true,
      pageName:'Profile',
      displayedColumns: displayedColumns,  // this.isWriteRight == true ? this.languageFlag == 'English' ? this.displayedColumns : this.marathiDisplayedColumns : this.languageFlag == 'English' ? displayedColumns : marathiDisplayedColumns,
      tableData: this.tableDataArray,
      tableSize: this.tableDatasize,
      tableHeaders: this.selectedLang == 'English' ? displayedheaders : displayedheadersMarathi
    };
 //   this.highLightFlag ? tableData.highlightedrow = true : tableData.highlightedrow = false,
      this.apiService.tableData.next(tableData);
  }


  schoolwiseBarChart(critearr?: any, _maxgrade?:any, categoryArr?: any) { 
   let yAxisMaxValue = critearr?.parameterArr[critearr.parameterArr.length - 1].optionGrade;   
    let seriesArray=new Array();
    const colurArray=['#b51d31', '#E98754'];
    if(critearr?.data?.length ){
      critearr?.data.forEach((x:any, i: number)=>{
        
        const obj={
          x: [categoryArr[i]['label']],
          // y: [-1, x] , // set Level Of which student answer ,
          y: (critearr?.questionTypeId == 3 || critearr?.questionTypeId == 4) ? [-1, x] : [0, x ], // set Level Of which student answer ,
          fillColor: categoryArr[i]['flag']? colurArray[1]:colurArray[0],
          assDate:categoryArr[i]['date'],
          parameter: categoryArr[i]['parameter']
        }
        seriesArray.push(obj)
      })
      this.questionwiseChartOptions = {
        series: [
          {
            // name: "blue",
            data: seriesArray
          },
        ],
        chart: {
          type: "rangeBar",
          height: 350,
          toolbar: {
            show: false
          }
        },      
        plotOptions: {
          bar: {
            horizontal: false,
          },
        },
        dataLabels: {
          enabled: true,
          formatter: function (val: any) {
            return val;
          },
          // offsetY: -20,
          style: {
            fontSize: "12px",
            colors: ["#fff"],
          }        
        },
        xaxis: {
          // categories: categoryArr,  //'Officer'
          parameters: this.selectedLang == 'English' ? ['Evaluator', 'Assessment Date', 'Selected Level'] : ['मूल्यांकनकर्ता', 'मूल्यांकन तारीख', 'निवडलेला स्तर'],
          axisTicks: {
            show: false
          },
        },
        yaxis: {
              // min: -1,
              max: critearr?.questionTypeId == 3 || critearr?.questionTypeId == 4 ? _maxgrade : yAxisMaxValue, // set Last Parameter in this criteria
              labels: {
                formatter: function (val: any) {
                  return val < 0 ? '' : val.toFixed(0); // y axis  values 0 1 2
                }
              },
            //   labels: {
            //   tickAmount: 2,
            //   formatter: (value: any, _i: any) => {
            //     console.log(value.toFixed(3))
            //     const v=value.toFixed(0)
            //     let val = v ==(-1) ? '' : v ==(+0) ?'No':v ==1?'Yes':'';
            //     return val
            //   },
            // },
              axisTicks: {
                show: true,
              },
            },
            grid: {
              show: false
          },
          
            
            tooltip: {
              custom: function ({ series, seriesIndex, dataPointIndex, w }: any) {
                console.log(series);
                
                return (
                  '<div class="arrow_box" style="padding:2px;z-index:+999">' +
                  "<div>" + w.config.xaxis.parameters[0] + " :  <b> " +w?.config?.series[seriesIndex]?.data[dataPointIndex].x[0]  + '</b>'+ "</div>" +
                  "<div>" + w.config.xaxis.parameters[1] + " :  <b> " + w?.config?.series[seriesIndex]?.data[dataPointIndex].assDate + "</b> "+
                  "<div>" + w.config.xaxis.parameters[2] + " :  <b> " + w?.config?.series[seriesIndex]?.data[dataPointIndex].parameter + "<b> "+
                  "</div>"
                );
              },
            }
            
      };      
      this.chartArray.push(this.questionwiseChartOptions);
    }    
  
  }

  getProgressIndicatorData(){
    this.ngxSpinner.show();
    if(this.viewDetailsObj?.studentId){
      this.graphResponse=[];
      // zp-satara/Dashboard/GetStudentProgressIndicatorDataWeb?StudentId=8006&AssessedClassId=1&SubjectId=1&ExamTypeId=0&EducationYearId=1&lan=EN
      let str = `StudentId=${this.viewDetailsObj?.studentId}&AssessedClassId=${this.standardId.value}&SubjectId=${this.subjectId.value}&ExamTypeId=0&EducationYearId=${this.academicYearId.value}&lan=''`
      this.apiService.setHttp('get', 'zp-satara/Dashboard/GetStudentProgressIndicatorDataWeb?' + str, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => {
          if (res.statusCode == "200") {
            this.ngxSpinner.hide();
          this.graphResponse =  res.responseData?.responseData1;
          this.StudentData = res.responseData?.responseData2[0];
          this.examId.setValue(this.graphResponse[0]?.examTypeId);          
          this.barChartData();
          }
          else{
            this.ngxSpinner.hide();
            this.graphResponse=[];
            this.StudentData = '';
          }
        },
        error: ((err: any) => { this.ngxSpinner.hide(); this.commonMethodS.checkEmptyData(err.statusText) == false ? this.errors.handelError(err.statusCode) : this.commonMethodS.showPopup(err.statusText, 1); })
      });
  
    }
  }

  barChartData(){
    let examId = this.examId.value;
    this.questionArr = [];
    this.graphResponse?.map((x: any) => {
      if(examId == x.examTypeId){
        x.criteriaModel.map((res: any) => {
          let GrdeArr: any = [];
          let evaluatorArr:any = [];
          res.assessedDataModel.map((gr:any)=>{
            const para = res.parameterModel.find((p:any)=>p.optionGrade == gr.grade)            
            GrdeArr.push(gr.grade);
            evaluatorArr.push({flag:gr.isInspection,label:this.selectedLang == 'English' ? gr.teacher_Officer: gr.m_Teacher_Officer, date: gr.assessmentDate,parameter: this.selectedLang == 'English' ? para.optionName : para.m_OptionName})})
          let obj = {
            questionTypeId: res.questionTypeId,
            question: res.question,
            m_Question: res.m_Question,
            data: GrdeArr,
            evaluator: evaluatorArr,
            // evaluator: evaluatorArr,
            parameterArr: res.parameterModel
          }
          res.assessedDataModel.length ? this.questionArr.push(obj) :'';    
      
        });          
      }
    });
    
    this.questionArr.forEach((chart:any)=>{
      const maxGrade=Math.max(...chart?.data.map(o => o));            
      this.schoolwiseBarChart(chart, (maxGrade!=-Infinity ? maxGrade:1), chart?.evaluator);
    })
    
    // this.schoolwiseBarChart([1],5)
  }




  clearDropdown(name?: any) {
    // this.dashboardObj?.label == "table" ? '' :this.dashboardObj = '';
    if(name == 'state'){
      this.mainFilterForm.controls['districtId'].setValue('');
      this.mainFilterForm.controls['talukaId'].setValue('');
      this.mainFilterForm.controls['centerId'].setValue('');
      this.mainFilterForm.controls['villageId'].setValue('');
      this.mainFilterForm.controls['schoolId'].setValue('');
      this.districtData = [];
      this.talukaArr = [];
      this.centerArr = [];
      this.villageArr = [];
      this.schoolArr = [];
      this.standardArr = [];
    }
    else if(name == 'districtId'){
      this.mainFilterForm.controls['talukaId'].setValue('');
      this.mainFilterForm.controls['centerId'].setValue('');
      this.mainFilterForm.controls['villageId'].setValue('');
      this.mainFilterForm.controls['schoolId'].setValue('');
      this.talukaArr = [];
      this.centerArr = [];
      this.villageArr = [];
      this.schoolArr = [];
      this.standardArr = [];

    }
    else if (name == 'talukaId') {
      this.mainFilterForm.controls['centerId'].setValue('');
      this.mainFilterForm.controls['villageId'].setValue('');
      this.mainFilterForm.controls['schoolId'].setValue('');
      this.centerArr = [];
      this.villageArr = [];
      this.schoolArr = [];
      this.standardArr = [];
      // this.selectedShcool='';
    } else if (name == 'centerId') {
      this.mainFilterForm.controls['villageId'].setValue('');
      this.mainFilterForm.controls['schoolId'].setValue('');
      this.villageArr = [];
      this.schoolArr = [];
      this.standardArr = [];
    }
    else if (name == 'villageId'){
      this.mainFilterForm.controls['schoolId'].setValue('');
      this.schoolArr = [];
      this.standardArr = [];
    }
    else if(name == 'schoolId'){
      this.mainFilterForm.controls['standardId'].setValue('');
      this.standardArr = [];
    }
  }



  clearDropdownGraph(){
    this.graphResponse =[];
    this.chartArray = [];
    this.questionwiseChartOptions ? this.questionwiseChartOptions.series = [] :'';
    this.examId.setValue('');
  }

  resetFilter(){
    this.formData();
    this.mf['acYearId'].setValue(this.webStorage.getYearId())
    this.mf['stateId'].setValue(this.webStorage.getState())
    this.mf['districtId'].setValue(this.webStorage.getDistrict())
    this.getDistrict();
  }


}
