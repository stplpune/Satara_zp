import { Component, ViewChild, } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexPlotOptions, ApexStroke, ApexTooltip, ApexXAxis, ApexYAxis, ChartComponent, } from 'ng-apexcharts';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { MasterService } from 'src/app/core/services/master.service';
import { WebStorageService } from 'src/app/core/services/web-storage.service';
declare var $: any;
export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  stroke: ApexStroke;
  tooltip: ApexTooltip;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions
};
@Component({
  selector: 'app-dashbaord2',
  templateUrl: './dashbaord2.component.html',
  styleUrls: ['./dashbaord2.component.scss']
})
export class Dashbaord2Component {
  filterForm!: FormGroup;
  filterFormTeacherWise!: FormGroup;
  classwiseFilterForm!: FormGroup;
  subjectWiseFilterForm!: FormGroup;
  mainFilterForm!: FormGroup;

  academicYear = new FormControl('');
  examType = new FormControl(0);
  dashboardCountData = new Array();
  acYear = new Array();
  graphInstance: any;
  selectedLang: any;
  piechartOptions: any;

  stateData = new Array();
  districtData = new Array();
  talukaData = new Array();
  centerData = new Array();
  villageData = new Array();
  schoolData = new Array();
  subjectResp = new Array();
  standardResp = new Array();
  teacherResp = new Array();
  graphLevelArr = new Array();
  evaluatorDataArray = new Array();
  examTypeData = new Array();
  allTeacherOfficerData = new Array();
  talukaLabel:any;
  districtLabel:any;
  totalStudentCountSchoolwise :number= 0;
  totalStudentCountTeacharwise:number = 0;

  @ViewChild("schoolwiseChart") schoolwiseChart!: ChartComponent;
  public schoolwiseChartOptions!: Partial<ChartOptions> | any;

   @ViewChild("teacherwiseChart") teacherwiseChart!: ChartComponent;
  public teacherwiseChartOptions!: Partial<ChartOptions> | any;

  @ViewChild("classwiseChart") classwiseChart!: ChartComponent;
  public classwiseChartOptions!: Partial<ChartOptions> | any;

  @ViewChild("subjectWiseChart") subjectWiseChart!: ChartComponent;
  public subjectWiseChartOptions!: Partial<ChartOptions> | any;


  constructor(private spinner: NgxSpinnerService,
    private apiService: ApiService,
    private error: ErrorsService,
    public webStorage: WebStorageService,
    private fb: FormBuilder,
    private masterService: MasterService,
    private commonMethods: CommonMethodsService,

  ) { }
  ngOnInit() {
   this.allDefultFormAPi();
    this.webStorage.langNameOnChange.subscribe((lang) => {
      console.log(lang);
      this.selectedLang = lang;
      // this.tableHeadingArrayTop = this.selectedLang == 'English' ? ['Top Performing Schools'] : ['उत्तम कामगिरी करणाऱ्या शाळा'];
      // this.tableHeadingArrayLow = this.selectedLang == 'English' ? ['Low Performing Schools'] : ['साधारण कामगिरी करणाऱ्या शाळा'];
      // this.initialApiCall('languageChange');
      this.showSvgMap(this.commonMethods.mapRegions());
      this.allDropdownApi();
      this.allChartApi();
      
    });   
    // this.showSvgMap(this.commonMethods.mapRegions());
    this.getdashboardCount();

    // this.allDropdownApi();
    // this.allChartApi();
  }

  allDefultFormAPi(){
    this.mainFillterDefaultFormat();
    this.defaultSchoolwiseFormat();
    this.defaultTeacherwiseFormat()
    this.defaultClassrwiseFormat();
    this.defaultSubjectWiseFormat();
  }

  // ngAfterViewInit() {
  //   this.showSvgMap(this.commonMethods.mapRegions());
  // }

  ngOnDestroy() {
    this.graphInstance ? this.graphInstance.destroy() : '';
  }

  allChartApi() {
    this.clickOnSvgMap();
    this.getPieChart();
    this.getPieChartData();
    this.getSchoolwiseBarDetails();
    this.getTeacherwiseBarDetails();
    this.getClasswiseBarDetails();
    this.getSubjectwiseBarDetails();
  }

  allDropdownApi() {
    this.getYearArray();
    this.getState();
    // this.getDistrict();
    // this.getTalukas();
    this.getSubject();
    this.GetAllStandardClassWise();
    this.getTeacher();
    this.getAllGraphLevel();
    this.bindEvaluator();
    this.getExamType();
    this.getAllTeacherOfficerByEvaluatorId();
  }

  mainFillterDefaultFormat() {
    this.mainFilterForm = this.fb.group({
      acYearId: [''],
      stateId:[1],
      districtId:[1],
      talukaId: [0],
      centerId: [0],
      villageId: [0],
      schoolId: [0],
    })
  }

  get f() { return this.mainFilterForm.controls }

  defaultSchoolwiseFormat() {
    this.filterForm = this.fb.group({
      evaluatorId: [1],
      userId:[0],
      classId: [0],
      subjectId: [0],
    })
  }

  defaultTeacherwiseFormat() {
    this.filterFormTeacherWise = this.fb.group({
      evaluatorId: [0],
      classId: [0],
      subjectId: [0],
    })
  }

  defaultClassrwiseFormat() {
    this.classwiseFilterForm = this.fb.group({
      levelId: [0],
      subjectId: [0],
    })
  }

  defaultSubjectWiseFormat() {
    this.subjectWiseFilterForm = this.fb.group({
      classId: [0],
      levelId: [1],
    })
  }


  // ----------------------------------dropdown start here----------------------

  getState(){
    this.stateData = [];
    this.masterService.getAllState(this.selectedLang).subscribe((res:any)=>{
     this.stateData = res.responseData;
     this.getDistrict()
    })
  }

  getDistrict(){
    this.districtData = [];
    this.masterService.getAllDistrict(this.selectedLang,this.f['stateId'].value).subscribe((res:any)=>{
     this.districtData = res.responseData;
     this.getTalukas()
    })
  }

  getYearArray() {
    this.acYear = [];
    this.masterService.getAcademicYears().subscribe((res: any) => {
      this.acYear = res.responseData;
      //this.f['acYearId'].patchValue(this.educationYear);
    })
  }

  getTalukas() {
    this.districtLabel = this.districtData.find((res:any) => res.id == this.f['districtId'].value);
    this.talukaData = [];
    // if(this.f['talukaId'].value){
    this.masterService.getAllTaluka(this.selectedLang, this.f['districtId'].value).subscribe((res: any) => {
      this.talukaData = [{ "id": 0, "taluka": "All", "m_Taluka": "सर्व" }, ...res.responseData];
      // this.f['talukaId'].patchValue(this.userDetails?.userTypeId < 3 ? 0 : this.userDetails?.talukaId);
      this.getCenters();
    })
    // }else{
    //   this.getCenters();
    // }   

  }

  getCenters() {
    this.talukaLabel = this.talukaData.find((res:any) => res.id == this.f['talukaId'].value);
    this.centerData = [{ "id": 0, "center": "All", "m_Center": "सर्व" }];
    this.f['centerId'].setValue(0);
    if (this.f['talukaId'].value) {
      this.masterService.getAllCenter(this.selectedLang, this.f['talukaId'].value || 0).subscribe((res: any) => {
        this.centerData.push(...res.responseData);
        this.getVillage();
      })
    } else {

      this.getVillage();
    }
  }

  getVillage() {
    this.villageData = [{ "id": 0, "village": "All", "m_Village": "सर्व" }];
    this.f['villageId'].patchValue(0);
    if (this.f['centerId'].value) {
      this.masterService.getAllVillage(this.selectedLang, (this.f['centerId'].value || 0)).subscribe((res: any) => {
        this.villageData.push(...res.responseData);
        this.getschools();
      });
    } else {
      this.getschools()
    }
  }

  getschools() {
    this.schoolData = [{ "id": 0, "schoolName": "All", "m_SchoolName": "सर्व" }];
    this.f['schoolId'].patchValue(0);
    if (this.f['villageId'].value) {
      this.masterService.getAllSchoolByCriteria(this.selectedLang, (this.f['talukaId'].value), (this.f['villageId'].value), (this.f['centerId'].value)).subscribe((res: any) => {
        this.schoolData.push(...res.responseData);
      })
    }
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

  GetAllStandardClassWise() {
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

  getTeacher() {
    let schoolId = this.mainFilterForm.value?.schoolId || 0;
    this.masterService.getTeacherBySchoolId(schoolId, this.selectedLang).subscribe({
      next: (res: any) => {
        if (res.statusCode == '200') {
          this.teacherResp = [{ id: 0, teacherName: "All", m_TeacherName: "सर्व" }, ...res.responseData];
        }
      },
      error: (() => {
        this.teacherResp = [];
      })
    });
  }

  getAllGraphLevel(){
    this.masterService.GetAllGraphLevel(this.selectedLang).subscribe({
      next: (res: any) => {
        if (res.statusCode == '200') {
          this.graphLevelArr = res.responseData;
        }
      },
      error: (() => {
        this.graphLevelArr = [];
      })
    });
  }

  bindEvaluator() {
    this.apiService.setHttp('get', 'zp-satara/master/GetAllEvaluator?flag_lang=' + this.selectedLang, false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == '200') {
          this.evaluatorDataArray = res.responseData;
          // this.getSchoolwiseBarDetails();
          this.getAllTeacherOfficerByEvaluatorId()
        } else {
          this.evaluatorDataArray = [];
        }
      },
      error: (() => { this.evaluatorDataArray = []; })
    })

  }

  getExamType(){
    this.examTypeData = [];
    this.masterService.getExamType().subscribe((res:any)=>{
      this.examTypeData = [  {id: 0, examType: "All", m_ExamType: "सर्व", isDeleted: false},...res.responseData];
    })
  }

  getAllTeacherOfficerByEvaluatorId(){
    this.allTeacherOfficerData = [{ "id": 0, "teacherOfficer": "All","m_TeacherOfficer": "सर्व"}]
    let formValue = this.filterForm.value
    let mainFormValue = this.mainFilterForm.value;
   if(formValue.evaluatorId != 0){
    let url =`EvaluatorId=${formValue.evaluatorId}&StateId=${mainFormValue.stateId}&DistrictId=${mainFormValue.districtId}&TalukaId=${mainFormValue.talukaId}`
    url +=`&CenterId=${mainFormValue.centerId}&VillageId=${mainFormValue.villageId}&SchoolId=${mainFormValue.schoolId}&flag_lang=${this.selectedLang}`
    this.apiService.setHttp('get', 'zp-satara/master/GetAllTeacherOfficerByEvaluatorId?'+url, false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == '200') {
          this.allTeacherOfficerData.push(...res.responseData);
          // this.getSchoolwiseBarDetails();
        } 
      },
      error: (() => {  })
    })
   }
  }





  // ----------------------------------drop end here----------------------

  getdashboardCount() {
    // const formData = this.filterForm.value;
    // val == 'sigleField' ? this.filterForm.controls['acYearId'].setValue(this.searchAcadamicYear.value) : this.searchAcadamicYear.setValue(formData.acYearId);

    let fv = this.mainFilterForm.value;
    let url = `StateId=${fv.stateId}&DistrictId=${fv.districtId}`
    url += `&TalukaId=${fv.talukaId}&CenterId=${fv.centerId}&VillageId=${fv.villageId}`
    url += `&SchoolId=${fv.schoolId}&EducationYearId=${+fv.acYearId || 0}&ExamTypeId=${this.examType.value}&lan=${this.selectedLang}`
    this.dashboardCountData = [];
    this.spinner.show();
    this.apiService.setHttp('GET', 'zp-satara/Dashboard/GetDashboardCount?' + url, false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == "200" && res.responseData.responseData1.length) {
          this.dashboardCountData.push(res.responseData.responseData1[0]);
          // this.totalStudentSurveyData = res.responseData.responseData2;
          // this.totalStudentSurveyData.map((x: any) => {
          //   x.status = false;
          //   x.ischeckboxShow = true;
          // })
          // if (val == 'mapClick') {
          //   this.totalStudentSurveyData[this.selectedGroupIdindex].status = true;
          // } else {
          //   this.totalStudentSurveyData[1].status = true;
          // }
          // this.totalStudentSurveyData[0].ischeckboxShow = false;
          setTimeout(() => {
            this.getPieChartData();
          }, 100)

        } else {
          this.dashboardCountData = [];
          // this.totalStudentSurveyData = [];
        }
        this.spinner.hide();
      },
      error: (error: any) => {
        this.spinner.hide();
        this.error.handelError(error.message)
      }
    });
  }

  // -----------------------------------svg map----------------------------
  showSvgMap(data: any) {
    this.graphInstance ? this.graphInstance.destroy() : '';
    //let createMap: any = document.getElementById("#mapsvg1");

    this.graphInstance = $("#mapsvg1").mapSvg({
      width: 400,
      height: 300,
      colors: {
        baseDefault: "#0d4487",
        background: "#fff",
        selected: "#0d4487",
        hover: "#0d4487",  // hover effect
        directory: "#0d4487",
        status: {}
      },
      regions: data,
      viewBox: [0, 0, 763.614, 599.92],
      cursor: "pointer",
      zoom: {
        on: false,
        limit: [0, 50],
        delta: 2,
        buttons: {
          on: true,
          location: "left"
        },
        mousewheel: true
      },
      tooltips: {
        mode: "title",
        off: true,
        priority: "local",
        position: "bottom"
      },
      popovers: {
        mode: "on",
        on: false,
        priority: "local",
        position: "top",
        centerOn: false,
        width: 250,
        maxWidth: 50,
        maxHeight: 50,
        resetViewboxOnClose: false,
        mobileFullscreen: false
      },
      gauge: {
        on: false,
        labels: {
          low: "low",
          high: "high"
        },
        colors: {
          lowRGB: {
            r: 211,
            g: 227,
            b: 245,
            a: 1
          },
          highRGB: {
            r: 67,
            g: 109,
            b: 154,
            a: 1
          },
          low: "#d3e3f5",
          high: "#436d9a",
          diffRGB: {
            r: -144,
            g: -118,
            b: -91,
            a: 0
          }
        },
        min: 0,
        max: false
      },
      source: this.selectedLang == 'English' ? "assets/distSVG/satara.svg" : "assets/distSVG/satara_marathi.svg",
      title: "Satara_Dist",
      responsive: true
    });
  }

  clickOnSvgMap() {
    $('#mapsvg1 path').removeAttr("style")
    this.svgMapAddOrRemoveClass();


    // ----------------------------- Map click event --------------------------------------------------------//
    $(document).on('click', '#mapsvg1  path', (e: any) => {
      let getClickedId = e.currentTarget;
      let talId = $(getClickedId).attr('data-name').split(" ")[0];
      if (this.mainFilterForm.controls['talukaId'].value != talId) {
        this.mainFilterForm.controls['talukaId'].setValue(+talId);
        this.getCenters();
        this.svgMapAddOrRemoveClass();
        this.getdashboardCount();
        this.allChartApi();
        this.getAllTeacherOfficerByEvaluatorId();
      }
    })
  }

  svgMapAddOrRemoveClass() {
    $('#mapsvg1 path').removeClass("talActive1");
    $('#mapsvg1 path[data-name="' + this.mainFilterForm?.value?.talukaId + '"]').addClass('talActive1');
  }

  // -----------------------------------------------------------------------------------
  // ------------------------------piechart start here--------------------------
  getPieChart() {
    this.piechartOptions = {
      series: [],
      series1: [],
      chart: {
        type: "donut",
        parameters: [],
        parametersTotal: [],
      },
      fill: {
        type: "solid",
        colors: ['#E98754', '#EFB45B', '#65C889', '#CB4B4B', '#E76A63'],
      },
      colors: ['#E98754', '#EFB45B', '#65C889', '#CB4B4B', '#E76A63'],
      labels: [],
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200
            },

            legend: {
              position: "bottom"
            }
          }
        }
      ],
      dataLabels: {
        enabled: true,
        // formatter: function(value:any, { seriesIndex, dataPointIndex, w }:any) {
        formatter: function (_value: any, { seriesIndex, w }: any) {
          return w.config.chart.parameters[seriesIndex] + '%'
        },
        style: {
          fontSize: '10px',
          fontFamily: 'Helvetica, Arial, sans-serif',
          fontWeight: 'bold',
        },
      },
      plotOptions: {
        pie: {
          customScale: 1,
          donut: {
            size: '50%'
          }
        }
      },
      tooltip: {
        // custom: function({series, seriesIndex, dataPointIndex, w}:any) {
        custom: function ({ seriesIndex, w }: any) {
          return '<div class="arrow_box bg-white text-dark" style="padding:10px;">' +
            '<span><b>' + w.config.labels[seriesIndex] + '</b></span>' +
            '<span class="mx-1">' + ':' + '</span>' +
            // '<span><b>' + w.config.chart.parameters[seriesIndex]+' %' + '</b></span>' +
            // '<br>' + 
            '<span>' + w.config.chart.parametersTotal[seriesIndex] + '</span>' +
            '</div>'
        }
      },
      legend: {
        position: 'bottom',
        fontSize: '12px',
        show: true,
        markers: {
          width: 12,
          height: 12,
          strokeWidth: 0,
          strokeColor: '#fff',
          fillColors: ['#E98754', '#EFB45B', '#65C889', '#CB4B4B', '#E76A63'],
        }
      }
    };
  }

  getPieChartData() {
    const serriesArray = [0, 0, 0];
    serriesArray[0] = this.dashboardCountData[0]?.govtSchool | 0;
    serriesArray[1] = this.dashboardCountData[0]?.privateSchool | 0;
    serriesArray[2] = this.dashboardCountData[0]?.otherSchool | 0;

    const serriesArrayTotal = [0, 0, 0];
    serriesArrayTotal[0] = this.dashboardCountData[0]?.govtSchoolCount | 0;
    serriesArrayTotal[1] = this.dashboardCountData[0]?.privateSchoolCount | 0;
    serriesArrayTotal[2] = this.dashboardCountData[0]?.otherSchoolCount | 0;

    this.piechartOptions.colors = ['#E98754', '#EFB45B', '#65C889', '#CB4B4B', '#E76A63'];
    this.piechartOptions.series = serriesArray;
    this.piechartOptions.series1 = serriesArrayTotal;
    this.piechartOptions.chart.parameters = [this.dashboardCountData[0]?.govtSchool, this.dashboardCountData[0]?.privateSchool, this.dashboardCountData[0]?.otherSchool]
    this.piechartOptions.chart.parametersTotal = [this.dashboardCountData[0]?.govtSchoolCount, this.dashboardCountData[0]?.privateSchoolCount, this.dashboardCountData[0]?.otherSchoolCount]

    this.piechartOptions.labels = this.selectedLang == 'English' ? ['Government', 'Private', 'Other'] : ['सरकारी', 'खाजगी', 'इतर'];
  }
  // ---------------------------------piechart end here---------------

  // ----------------------------- Schoolwise Performance barChart start here---------------------------



  getSchoolwiseBarDetails() {
    let fd = this.filterForm.value;
    let mainFV = this.mainFilterForm.value;
    let url = `StateId=${mainFV.stateId}&DistrictId=${mainFV.districtId}`
    url += `&TalukaId=${mainFV.talukaId}&CenterId=${mainFV.centerId}&VillageId=${mainFV.villageId}&SchoolId=${mainFV.schoolId}`
    url += `&StandardId=${fd.classId}&SubjectId=${fd.subjectId}&EvaluatorId=${fd.evaluatorId}&TeacherId_OfficerId=${fd.userId}&EducationYearId=${+mainFV.acYearId || 0}&ExamTypeId=${this.examType.value}&lan=${this.selectedLang}`
    this.apiService.setHttp('get', 'zp-satara/Dashboard/GetDashboardStudentGraphDataWeb?' + url, false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == '200' && res.responseData.responseData1.length) {
          let schoolwiseBarDetails = res.responseData.responseData1;
          let xAxiaArray: any = [];
          let yAxisArray: any = [];
          this.totalStudentCountSchoolwise = schoolwiseBarDetails[0]?.totalStudentCount;

          schoolwiseBarDetails.map((x: any) => {
            xAxiaArray.push(this.selectedLang == 'English' ? x.graphLevel : x.m_GraphLevel);
            yAxisArray.push(x.percentage);
            // totalStudentCount.push(x.totalStudentCount)
          });
          // let isAllZero = yAxisArray.every(res => res == 0);
          // isAllZero ? this.schoolwiseChartOptions = '' : this.schoolwiseBarChart(xAxiaArray, yAxisArray);
          this.schoolwiseBarChart(xAxiaArray, yAxisArray);

        } else {
          this.totalStudentCountSchoolwise = 0;
          this.schoolwiseChartOptions = '';
        }
      },
      error: (err: any) => {
        this.schoolwiseChartOptions = '';
        this.totalStudentCountSchoolwise = 0;
        this.error.handelError(err.status);
      },
    });
  }
  schoolwiseBarChart(xAxiaArray?: any, yAxisArray?: any) {
    this.schoolwiseChartOptions = {
      series: [
        {
          name: 'Percentage',
          data: yAxisArray // [400, 430, 448, 470, 540, 580, 690, 1100, 1200, 1380],
        },
      ],
      chart: {
        type: 'bar',
        height: 300,
        toolbar: {
          show: false
        }
      },
      colors: [
        '#b51d31',
        '#75562e',
        '#50c77b',
        // '#2b908f',
        // '#f9a3a4',
        // '#90ee7e',
        // '#f48024',
        // '#69d2e7',
      ],
      plotOptions: {
        bar: {
          horizontal: false,
          distributed: true,
        },
      },
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        categories: xAxiaArray,

      },
    }
  }

  // --------------------------------Schoolwise Performance barChart  end here------------------------------

  // --------------------------------Teacherwise  Performance barChart  Start here------------------------------


  getTeacherwiseBarDetails() {
    let fd = this.filterFormTeacherWise.value;
    let mainFV = this.mainFilterForm.value;
    let url = `StateId=${mainFV.stateId}&DistrictId=${mainFV.districtId}`
     url += `&TalukaId=${mainFV.talukaId}&CenterId=${mainFV.centerId}&VillageId=${mainFV.villageId}&SchoolId=${mainFV.schoolId}`
    url += `&StandardId=${fd.classId}&SubjectId=${fd.subjectId}&EvaluatorId=${fd.evaluatorId}&EducationYearId=${+mainFV.acYearId || 0}&ExamTypeId=${this.examType.value}&lan=${this.selectedLang}`
    this.apiService.setHttp('get', 'zp-satara/Dashboard/GetDashboardTeacherWiseGraphDataWeb?' + url, false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == '200' && res.responseData.responseData1.length) {
          let teacherwiseBarDetails = res.responseData.responseData1;
          let xAxiaArray: any = [];
          let yAxisArray: any = [];
          this.totalStudentCountTeacharwise = teacherwiseBarDetails[0]?.totalStudentCount;

          teacherwiseBarDetails.map((x: any) => {
            xAxiaArray.push(this.selectedLang == 'English' ? x.graphLevel : x.m_GraphLevel);
            yAxisArray.push(x.studentCount)
            // totalStudentCount.push(x.totalStudentCount)
          });

          // let isAllZero = yAxisArray.every(res => res == 0);
          // isAllZero ? this.teacherwiseChartOptions = '' : this.teacherwiseBarChart(xAxiaArray, yAxisArray);
          this.teacherwiseBarChart(xAxiaArray, yAxisArray)
        } else {
          this.totalStudentCountTeacharwise = 0;
          this.teacherwiseChartOptions = '';
        }
      },
      error: (err: any) => {
        this.totalStudentCountTeacharwise = 0;
        this.teacherwiseChartOptions = '';
        this.error.handelError(err.status);
      },
    });
  }
  teacherwiseBarChart(xAxiaArray?: any, yAxisArray?: any) {
    this.teacherwiseChartOptions = {
      series: [
        {
          name: 'Count',
          data: yAxisArray // [400, 430, 448, 470, 540, 580, 690, 1100, 1200, 1380],
        },
      ],
      chart: {
        type: 'bar',
        height: 300,
        toolbar: {
          show: false
        }
      },
      colors: [
        '#b51d31',
        '#75562e',
        '#50c77b',
        // '#2b908f',
        // '#f9a3a4',
        // '#90ee7e',
        // '#f48024',
        // '#69d2e7',
      ],
      plotOptions: {
        bar: {
          horizontal: false,
          distributed: true,
        },
      },
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        categories: xAxiaArray,

      },
    }
  }
  // --------------------------------Teacherwise  Performance barChart  end here------------------------------

  // --------------------------------Classwise Performance barChart  Start here------------------------------
  getClasswiseBarDetails() {
    let fd = this.classwiseFilterForm.value;
    let mainFV = this.mainFilterForm.value;
    let url = `StateId=${mainFV.stateId}&DistrictId=${mainFV.districtId}`
     url += `&TalukaId=${mainFV.talukaId}&CenterId=${mainFV.centerId}&VillageId=${mainFV.villageId}&SchoolId=${mainFV.schoolId}`
    url += `&SubjectId=${fd.subjectId}&EducationYearId=${+mainFV.acYearId || 0}&GraphLevelId=${fd.levelId}&ExamTypeId=${this.examType.value}&lan=${this.selectedLang}`
    this.apiService.setHttp('get', 'zp-satara/Dashboard/GetDashboardStandardWiseGraphDataWeb?' + url, false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == '200' && res.responseData.responseData1.length) {
          let classwiseBarDetails = res.responseData.responseData1;
          let xAxiaArray: any = [];
          let slowLearnerArray: any = [];
          let brilliantLearnerArray: any = [];
          let goodLearnerArray: any = [];

          classwiseBarDetails.map((x: any) => {
            xAxiaArray.includes(this.selectedLang == 'English' ? x.standard : x.m_Standard) ? '':xAxiaArray.push(this.selectedLang == 'English' ? x.standard : x.m_Standard);
            x.graphLevelId == 1 ? slowLearnerArray.push(x.studentCount) : x.graphLevelId == 2 ?  goodLearnerArray.push(x.studentCount) : brilliantLearnerArray.push(x.studentCount)
            // totalStudentCount.push(x.totalStudentCount)
          });

          // let isAllZero = yAxisArray.every(res => res == 0);
          // isAllZero ? this.classwiseChartOptions = '' :  this.classwiseBarChart(xAxiaArray, yAxisArray);
          // this.classwiseBarChart(xAxiaArray, yAxisArray);
          this.classwiseBarChart(xAxiaArray, slowLearnerArray,brilliantLearnerArray,goodLearnerArray)
         
        } else {
          this.classwiseChartOptions = '';
        }
      },
      error: (err: any) => {
        this.classwiseChartOptions = '';
        this.error.handelError(err.status);
      },
    });
  }
  classwiseBarChart(xAxiaArray?: any, slowLearnerArray?:any,brilliantLearnerArray?:any,goodLearnerArray?:any) {
    this.classwiseChartOptions = {
      series: [
        {
          name: this.selectedLang == 'English' ? 'Slow Learner' :'हळू शिकणारा',
          data: slowLearnerArray // [400, 430, 448, 470, 540, 580, 690, 1100, 1200, 1380],
        },
        {
          name: this.selectedLang == 'English' ? 'Good Learner':'चांगला शिकणारा',
          data: goodLearnerArray // [400, 430, 448, 470, 540, 580, 690, 1100, 1200, 1380],
        },
        {
          name: this.selectedLang == 'English' ? 'Brilliant':'हुशार',
          data: brilliantLearnerArray // [400, 430, 448, 470, 540, 580, 690, 1100, 1200, 1380],
        },
         
      ],
      chart: {
        type: 'bar',
        height: 350,
        toolbar: {
          show: false
        }
      },
      
      colors: [
        '#b51d31',
        '#b39536',
        '#50c77b',
        // '#2b908f',
        // '#f9a3a4',
        // '#90ee7e',
        // '#f48024',
        // '#69d2e7',
      ],
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "50%",
          endingShape: "rounded"
        }
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"]
      },
      xaxis: {
        categories: xAxiaArray,

      },
    }
  }

  // --------------------------------Classwise  Performance barChart  end here------------------------------


  // --------------------------------Subjectwise Performance barChart  Start here------------------------------
  getSubjectwiseBarDetails() {
    let fd = this.subjectWiseFilterForm.value;
    let mainFV = this.mainFilterForm.value;
    let url = `StateId=${mainFV.stateId}&DistrictId=${mainFV.districtId}`
    url += `&TalukaId=${mainFV.talukaId}&CenterId=${mainFV.centerId}&VillageId=${mainFV.villageId}&SchoolId=${mainFV.schoolId}`
    url += `&StandardId=${fd.classId}&EducationYearId=${+mainFV.acYearId || 0}&GraphLevelId=${fd.levelId}&ExamTypeId=${this.examType.value}&lan=${this.selectedLang}`
    this.apiService.setHttp('get', 'zp-satara/Dashboard/GetDashboardSubjectWiseGraphDataWeb?' + url, false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == '200' && res.responseData.responseData1.length) {
          let subjectwiseBarDetails = res.responseData.responseData1;
          let xAxiaArray: any = [];
          let yAxisArray: any = [];
          //  let totalStudentCount :any=[];

          subjectwiseBarDetails.map((x: any) => {
            xAxiaArray.push(this.selectedLang == 'English' ? x.subject : x.m_Subject);
            yAxisArray.push(x.studentCount)
            // totalStudentCount.push(x.totalStudentCount)
          });

          // let isAllZero = yAxisArray.every(res => res == 0);
          // isAllZero ? this.subjectWiseChartOptions = '' : this.subjectwiseBarChart(xAxiaArray, yAxisArray);
          this.subjectwiseBarChart(xAxiaArray, yAxisArray);
        } else {
          this.subjectWiseChartOptions = '';
        }
      },
      error: (err: any) => {
        this.subjectWiseChartOptions = '';
        this.error.handelError(err.status);
      },
    });
  }
  subjectwiseBarChart(xAxiaArray?: any, yAxisArray?: any) {
    this.subjectWiseChartOptions = {
      series: [
        {
          name: 'Count',
          data: yAxisArray // [400, 430, 448, 470, 540, 580, 690, 1100, 1200, 1380],
        },
      ],
      chart: {
        type: 'bar',
        height: 350,
        toolbar: {
          show: false
        }
      },
      colors: [
        '#b51d31',
        '#b39536',
        '#50c77b',
        // '#2b908f',
        // '#f9a3a4',
        // '#90ee7e',
        // '#f48024',
        // '#69d2e7',
      ],
      plotOptions: {
        bar: {
          horizontal: false,
          distributed: true,
        },
      },
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        categories: xAxiaArray,

      },
    }
  }

  // --------------------------------Subjectwise  Performance barChart  end here------------------------------

  resetMainFilter() {
    this.mainFillterDefaultFormat();
    this.getState();
    this.onMainFilterSubmit();
    this.academicYear.setValue('')
  }

  setAcadamicYearValue() {
    this.academicYear.setValue(this.f['acYearId'].value)
  }

  onMainFilterSubmit(flag?: any) {
    if (flag == "year") {
      let yearValue = this.academicYear.value;
      this.f['acYearId'].setValue(yearValue);
    }
    this.getdashboardCount();
    this.allChartApi();

  }
}
