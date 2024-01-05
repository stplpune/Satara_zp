import { Component, ViewChild, } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
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
  selectedLang: any = this.webStorage.languageFlag == 'EN' ?'English':'Marathi';
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
  talukaLabel: any;
  districtLabel: any;
  totalStudentCountSchoolwise: number = 0;
  totalStudentCountTeacharwise: number = 0;
  totalStudentCountClasswise: number = 0;
  totalStudentCountSubjectwise: number = 0;
  teacherRespFilteredList:any;
  allTeacherOfficerDataList:any;
  villageName:any;
  centerName:any;
  schoolName:any

  @ViewChild("schoolwiseChart") schoolwiseChart!: ChartComponent;
  public schoolwiseChartOptions!: Partial<ChartOptions> | any;

  @ViewChild("teacherwiseChart") teacherwiseChart!: ChartComponent;
  public teacherwiseChartOptions!: Partial<ChartOptions> | any;

  @ViewChild("classwiseChart") classwiseChart!: ChartComponent;
  public classwiseChartOptions!: Partial<ChartOptions> | any;

  @ViewChild("subjectWiseChart") subjectWiseChart!: ChartComponent;
  public subjectWiseChartOptions!: Partial<ChartOptions> | any;

  public chartOptions: Partial<any> = {} as Partial<any>;


  constructor(private spinner: NgxSpinnerService,
    private apiService: ApiService,
    private error: ErrorsService,
    public webStorage: WebStorageService,
    private fb: FormBuilder,
    private masterService: MasterService,
    private commonMethods: CommonMethodsService,
    private router: Router,

  ) { }
  ngOnInit() {
    this.allDefultFormAPi();
    this.allDropdownApi();
    this.webStorage.langNameOnChange.subscribe((lang) => {
      this.selectedLang = lang;
      this.showSvgMap(this.commonMethods.mapRegions());      
      this.allChartApi();
      this.getdashboardCount();
    });   
  }

  allDefultFormAPi() {
    this.mainFillterDefaultFormat();
    this.defaultSchoolwiseFormat();
    this.defaultTeacherwiseFormat()
    this.defaultClassrwiseFormat();
    this.defaultSubjectWiseFormat();
  }
  ngOnDestroy() {
    this.graphInstance ? this.graphInstance.destroy() : '';
  }

  allChartApi() {
    this.clickOnSvgMap();
    this.getPieChart();
    this.getSchoolwiseBarDetails();
    this.getTeacherwiseBarDetails();
    this.getClasswiseBarDetails();
    this.getSubjectwiseBarDetails();
  }

  allDropdownApi() {
    this.getYearArray();
    this.getState();
    this.getSubject();
    this.GetAllStandardClassWise();
    this.getAllGraphLevel();
    // this.bindEvaluator();
    this.getExamType();
    this.getAllTeacherOfficerByEvaluatorId();
  }

  mainFillterDefaultFormat() {
    this.mainFilterForm = this.fb.group({
      acYearId: [this.webStorage.getYearId()],
      stateId: [this.webStorage.getState()],
      districtId: [this.webStorage.getDistrict()],
      talukaId: [0],
      centerId: [0],
      villageId: [0],
      schoolId: [0],
    })
  }

  get f() { return this.mainFilterForm.controls }

  defaultSchoolwiseFormat() {
    this.filterForm = this.fb.group({
      evaluatorId: [0],
      userId: [{value:0,disabled:true}],
      classId: [0],
      subjectId: [0],
    })
  }

  defaultTeacherwiseFormat() {
    this.filterFormTeacherWise = this.fb.group({
      teacherId_OfficerId: [0],
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

  getState() {
    this.stateData = [];
    this.masterService.getAllState(this.selectedLang).subscribe((res: any) => {
      this.stateData = res.responseData;
      this.getDistrict()
    })
  }

  getDistrict() {
    this.districtData = [];
    this.masterService.getAllDistrict(this.selectedLang, this.f['stateId'].value).subscribe((res: any) => {
      this.districtData = res.responseData;
      this.getTalukas()
    });
  }


  getYearArray() {
    this.acYear = [];
    this.masterService.getAcademicYears(this.selectedLang).subscribe((res: any) => {
      this.acYear = res.responseData;
      this.f['acYearId'].patchValue(this.webStorage.getYearId());
      this.academicYear.patchValue(this.webStorage.getYearId())
    })
  }

  getTalukas() {
    this.districtLabel = this.districtData.find((res: any) => res.id == this.f['districtId'].value);
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
    this.talukaLabel = this.talukaData.find((res: any) => res.id == this.f['talukaId'].value && this.f['talukaId'].value !=0);
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
    this.centerName = this.centerData.find((res: any) => res.id == this.f['centerId'].value && this.f['centerId'].value !=0);
   // this.centerName = this.selectedLang == 'English' ? obj.center : obj.m_Center
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
    this.villageName= this.villageData.find((res: any) => res.id == this.f['villageId'].value && this.f['villageId'].value !=0);
   // this.villageName = this.selectedLang == 'English' ? obj.village : obj.m_Village
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

  // getTeacher() {
  //   let schoolId = this.mainFilterForm.value?.schoolId || 0;
  //   this.schoolName = this.schoolData.find((res: any) => res.id == schoolId && schoolId !=0 );
  //  // this.schoolName = this.selectedLang == 'English' ? obj.schoolName : obj.m_SchoolName
  //   this.masterService.getTeacherBySchoolId(schoolId, this.selectedLang).subscribe({
  //     next: (res: any) => {
  //       if (res.statusCode == '200') {
  //         this.teacherResp = [{ id: 0, teacherName: "All", m_TeacherName: "सर्व" }, ...res.responseData];
  //         this.teacherRespFilteredList = this.teacherResp.slice();
  //       }
  //     },
  //     error: (() => {
  //       this.teacherResp = [];
  //     })
  //   });
  // }

  getAllGraphLevel() {
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
          this.evaluatorDataArray = [{ "id": 0, "evaluator": "All", "m_Evaluator": "सर्व" },...res.responseData];
        } else {
          this.evaluatorDataArray = [];
        }
      },
      error: (() => { this.evaluatorDataArray = []; })
    })

  }

  getExamType() {
    this.examTypeData = [];
    this.masterService.getExamType(this.selectedLang).subscribe((res: any) => {
      this.examTypeData = [{ id: 0, examType: "All", m_ExamType: "सर्व", isDeleted: false }, ...res.responseData];
    })
  }

  getAllTeacherOfficerByEvaluatorId() {
    this.filterForm.controls['userId'].setValue(0);
    this.allTeacherOfficerData = [{ "id": 0, "teacherOfficer": "All", "m_TeacherOfficer": "सर्व" }];
    this.allTeacherOfficerDataList =  this.allTeacherOfficerData.slice();    
    let formValue = this.filterForm.value
    let mainFormValue = this.mainFilterForm.value;
    if (formValue.evaluatorId != 0) {
      this.filterForm.controls['userId'].enable();
      let url = `EvaluatorId=${formValue.evaluatorId}&StateId=${mainFormValue.stateId}&DistrictId=${mainFormValue.districtId}&TalukaId=${mainFormValue.talukaId}`
      url += `&CenterId=${mainFormValue.centerId}&VillageId=${mainFormValue.villageId}&SchoolId=${mainFormValue.schoolId}&flag_lang=${this.selectedLang}`
      this.apiService.setHttp('get', 'zp-satara/master/GetAllTeacherOfficerByEvaluatorId?' + url, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => {
          if (res.statusCode == '200') {
            this.allTeacherOfficerData.push(...res.responseData);
            this.allTeacherOfficerDataList =  this.allTeacherOfficerData.slice();
            // this.getSchoolwiseBarDetails();
          }
        },
        error: (() => { })
      })
    }else{
      this.filterForm.controls['userId'].disable();
    }
    
  }





  // ----------------------------------drop end here----------------------

  getdashboardCount() {
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
          setTimeout(() => {
            this.getPieChartData();
          }, 100)

        } else {
          this.dashboardCountData = [];
          this.piechartOptions = '';
          // this.totalStudentSurveyData = [];
        }
        this.spinner.hide();
      },
      error: (error: any) => {
        this.spinner.hide();
        this.piechartOptions = '';
        this.dashboardCountData = [];
        this.error.handelError(error.message)
      }
    });
  }

  // -----------------------------------svg map----------------------------
  showSvgMap(data: any) {
    this.graphInstance ? this.graphInstance.destroy() : '';
    //let createMap: any = document.getElementById("#mapsvg1");

    this.graphInstance = $("#mapsvg1").mapSvg({
      width: 550,
      height: 430,
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
        width: 300,
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
        colors: ['#b39536', '#EFB45B', '#65C889', '#CB4B4B', '#E76A63'],
      },
      colors: ['#b39536', '#EFB45B', '#65C889', '#CB4B4B', '#E76A63'],
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
          fontSize: '12px',
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
          fillColors: ['#b39536', '#EFB45B', '#65C889', '#CB4B4B', '#E76A63'],
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

    this.piechartOptions.colors = ['#b39536', '#EFB45B', '#65C889', '#CB4B4B', '#E76A63'];
    this.piechartOptions.series = serriesArray;
    this.piechartOptions.series1 = serriesArrayTotal;
    this.piechartOptions.chart.parameters = [this.dashboardCountData[0]?.govtSchool, this.dashboardCountData[0]?.privateSchool, this.dashboardCountData[0]?.otherSchool]
    this.piechartOptions.chart.parametersTotal = [this.dashboardCountData[0]?.govtSchoolCount, this.dashboardCountData[0]?.privateSchoolCount, this.dashboardCountData[0]?.otherSchoolCount]

    this.piechartOptions.labels = this.selectedLang == 'English' ? ['Government', 'Private', 'Other'] : ['सरकारी', 'खाजगी', 'इतर'];
  }
  // ---------------------------------piechart end here---------------

  // ----------------------------- Schoolwise Performance barChart start here---------------------------



  getSchoolwiseBarDetails() {
    let fd = this.filterForm.getRawValue();
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
          // let yAxisArray: any = [];
          let colorArray: any = [];
          this.totalStudentCountSchoolwise = schoolwiseBarDetails[0]?.totalStudentCount;

          let percentArray: any = [];
          let dataValueArray: any = [];

          schoolwiseBarDetails.map((x: any) => {
            percentArray.push(x.percentage);
            dataValueArray.push(x.studentCount);

            xAxiaArray.push(this.selectedLang == 'English' ? x.graphLevel : x.m_GraphLevel);
            x.graphLevelId == 1 ? colorArray.push('#b51d31') : x.graphLevelId == 2 ? colorArray.push('#E98754') : colorArray.push('#50c77b');
            // totalStudentCount.push(x.totalStudentCount)
          });
          // let isAllZero = yAxisArray.every(res => res == 0);
          // isAllZero ? this.schoolwiseChartOptions = '' : this.schoolwiseBarChart(xAxiaArray, yAxisArray);
          this.schoolwiseBarChart(xAxiaArray, dataValueArray,colorArray, percentArray);
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
  schoolwiseBarChart(xAxiaArray?: any, tooltipData?: any, colorArray?:any, percentData?: any) {
    let studentcount = this.selectedLang == 'English' ?  'Student Count: ' : 'विद्यार्थी संख्या: ';
    this.schoolwiseChartOptions = {
      series: [ 
        {
          name: 'Percentage',
          data: percentData,
          dataValue: tooltipData
        },
      ],
      chart: {
        type: 'bar',
        height: 300,
        toolbar: {
          show: false
        },
        events: {
          click: (_event: any, _chartContext: any, config: any) => {
            if(config.dataPointIndex != -1){
              let mainFilter = this.mainFilterForm.value;
              let selectedFilter = this.filterForm.getRawValue();
              let label = config.config.xaxis.categories[config.dataPointIndex]
              selectedFilter.levelId = this.graphLevelArr.find(res => label == (this.selectedLang == 'English' ? res.graphLevel : res.m_GraphLevel)).id; //label == 'Slow Learner' ? 1 : label == 'Good' ? 2 : 3
              let obj = this.returnObjectOfChart(mainFilter, selectedFilter, 'School');
              localStorage.setItem('selectedChartObjDashboard2', JSON.stringify(obj))
              if(this.f['schoolId'].value > 0){                
              this.router.navigate(['/dashboard-student-data']); //{ queryParams: obj }
              }
            }            
          }
        }
      },
      colors: colorArray,
      plotOptions: {
        bar: {
          horizontal: false,
          distributed: true,
        },
      },
      dataLabels: {
        formatter: function (val: any,) {
          return val + ' %'
        }
      },
      xaxis: {
        categories: xAxiaArray,
      },
      yaxis: {
        min: 0,
        max: 100,
        labels: {
          formatter: function (val: any) {
            return val < 0 ? '' : val.toFixed(0) +'%'; // y axis  values 0 1 2
          }
        },
      },
      
      tooltip: {
        // enabled: true
        custom: function ({ series, seriesIndex, dataPointIndex, w }: any) {
          console.log("series : ",series);
          return (
            '<div class="arrow_box" style="padding:10px;">' +
            "<div>" + "<b> " + studentcount + " </b>" + w.globals.initialSeries[seriesIndex].dataValue[dataPointIndex] + "</div>" +
            "</div>"
          );
        },
      }
    }
  }
  // --------------------------------Schoolwise Performance barChart  end here------------------------------

  // --------------------------------Teacherwise  Performance barChart  Start here------------------------------


  getTeacherwiseBarDetails() {
    let fd = this.filterFormTeacherWise.value;
    let mainFV = this.mainFilterForm.value;
    let url = `StateId=${mainFV.stateId}&DistrictId=${mainFV.districtId}`
    url += `&TalukaId=${mainFV.talukaId}&CenterId=${mainFV.centerId}&VillageId=${mainFV.villageId}&SchoolId=${mainFV.schoolId}`
    url += `&StandardId=${fd.classId}&SubjectId=${fd.subjectId}&TeacherId_OfficerId=${fd.teacherId_OfficerId}&EducationYearId=${+mainFV.acYearId || 0}&ExamTypeId=${this.examType.value}&lan=${this.selectedLang}`
    this.apiService.setHttp('get', 'zp-satara/Dashboard/GetDashboardTeacherWiseGraphDataWeb?' + url, false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == '200' && res.responseData.responseData1.length) {
          let teacherwiseBarDetails = res.responseData.responseData1;
          let xAxiaArray: any = [];
          let yAxisArray: any = [];
          let colorArray: any = [];
          this.totalStudentCountTeacharwise = teacherwiseBarDetails[0]?.totalStudentCount;

          teacherwiseBarDetails.map((x: any) => {
            xAxiaArray.push(this.selectedLang == 'English' ? x.graphLevel : x.m_GraphLevel);
            yAxisArray.push(x.studentCount);
            x.graphLevelId == 1 ? colorArray.push('#b51d31') : x.graphLevelId == 2 ? colorArray.push('#E98754') : colorArray.push('#50c77b')
            // totalStudentCount.push(x.totalStudentCount)
          });

          // let isAllZero = yAxisArray.every(res => res == 0);
          // isAllZero ? this.teacherwiseChartOptions = '' : this.teacherwiseBarChart(xAxiaArray, yAxisArray);
          this.teacherwiseBarChart(xAxiaArray, yAxisArray,colorArray)
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
  teacherwiseBarChart(xAxiaArray?: any, yAxisArray?: any,colorArray?:any) {
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
        },
        events: {
          click: (_event: any, _chartContext: any, config: any) => {
            if(config.dataPointIndex != -1){
            let mainFilter = this.mainFilterForm.value;
            let selectedFilter = this.filterFormTeacherWise.value;
            let label = config.config.xaxis.categories[config.dataPointIndex]
            selectedFilter.levelId = this.graphLevelArr.find(res => label == (this.selectedLang == 'English' ? res.graphLevel : res.m_GraphLevel)).id;
            let obj = this.returnObjectOfChart(mainFilter, selectedFilter, 'Teacher');
            console.log("selectedF", selectedFilter);
            
            localStorage.setItem('selectedChartObjDashboard2', JSON.stringify(obj))
              this.router.navigate(['/dashboard-student-data']); //{ queryParams: obj }
          }
        }
        }
      },
      colors: colorArray,
      // [
      //   '#b51d31',
      //   '#E98754',
      //   '#50c77b',
      //   // '#2b908f',
      //   // '#f9a3a4',
      //   // '#90ee7e',
      //   // '#f48024',
      //   // '#69d2e7',
      // ],
      plotOptions: {
        bar: {
          horizontal: false,
          distributed: true,
        },
      },
      dataLabels: {
        enabled: true,
      },
      xaxis: {
        categories: xAxiaArray,
      },
      yaxis :{
        labels: {
          formatter: function (value:any) {          
            return value.toFixed();
          }
        },
      }
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
          this.totalStudentCountClasswise = res.responseData.responseData1[0].totalStudentCount
          let xAxiaArray: any = [];
          let slowLearnerArray: any = [];
          let brilliantLearnerArray: any = [];
          let goodLearnerArray: any = [];

          let modifyArray = this.groupBy(classwiseBarDetails, 'standardId');
          for (let key in modifyArray) {
            modifyArray[key].map((x: any) => {
              xAxiaArray.includes(this.selectedLang == 'English' ? x.standard : x.m_Standard) ? '' : xAxiaArray.push(this.selectedLang == 'English' ? x.standard : x.m_Standard);
              x.graphLevelId == 1 ? slowLearnerArray.push(x.studentCount) : x.graphLevelId == 2 ? goodLearnerArray.push(x.studentCount) : brilliantLearnerArray.push(x.studentCount)
              // totalStudentCount.push(x.totalStudentCount)
            });
          }

          // classwiseBarDetails.map((x: any) => {
          //   xAxiaArray.includes(this.selectedLang == 'English' ? x.standard : x.m_Standard) ? '' : xAxiaArray.push(this.selectedLang == 'English' ? x.standard : x.m_Standard);
          //   x.graphLevelId == 1 ? slowLearnerArray.push(x.studentCount) : x.graphLevelId == 2 ? goodLearnerArray.push(x.studentCount) : brilliantLearnerArray.push(x.studentCount)
          //   // totalStudentCount.push(x.totalStudentCount)
          // });



          // let isAllZero = yAxisArray.every(res => res == 0);
          // isAllZero ? this.classwiseChartOptions = '' :  this.classwiseBarChart(xAxiaArray, yAxisArray);
          // this.classwiseBarChart(xAxiaArray, yAxisArray);
          this.classwiseBarChart(xAxiaArray, slowLearnerArray, brilliantLearnerArray, goodLearnerArray)

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

  groupBy(objectArray: any, property: any) {
    return objectArray.reduce((acc: any, obj: any) => {
      let key = obj[property]
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(obj)
      return acc
    }, {})
  }
  classwiseBarChart(xAxiaArray?: any, slowLearnerArray?: any, brilliantLearnerArray?: any, goodLearnerArray?: any) {
    this.classwiseChartOptions = {
      series: [
        {
          name: this.selectedLang == 'English' ? 'Slow Learner' : 'हळू शिकणारा',
          data: slowLearnerArray // [400, 430, 448, 470, 540, 580, 690, 1100, 1200, 1380],
        },
        {
          name: this.selectedLang == 'English' ? 'Good Learner' : 'चांगला शिकणारा',
          data: goodLearnerArray // [400, 430, 448, 470, 540, 580, 690, 1100, 1200, 1380],
        },
        {
          name: this.selectedLang == 'English' ? 'Brilliant' : 'हुशार',
          data: brilliantLearnerArray // [400, 430, 448, 470, 540, 580, 690, 1100, 1200, 1380],
        },

      ],
      chart: {
        type: 'bar',
        height: 350,
        toolbar: {
          show: false
        },
        events: {
          click: (_event: any, _chartContext: any, config: any) => {
            if(config.dataPointIndex != -1){
            let mainFilter = this.mainFilterForm.value;
            let selectedFilter = this.classwiseFilterForm.value;
            selectedFilter.levelId = config.seriesIndex + 1;
            let lable = config.config.xaxis.categories[config.dataPointIndex];
            selectedFilter.classId = this.standardResp.find(res => lable == (this.selectedLang == 'English' ? res.standard : res.m_Standard)).id;
            let obj = this.returnObjectOfChart(mainFilter, selectedFilter, 'Standard');

            localStorage.setItem('selectedChartObjDashboard2', JSON.stringify(obj))
            this.router.navigate(['/dashboard-student-data']);     //{ queryParams: obj }       
          }
        }
        }
      },

      colors: [
        '#b51d31',
       '#E98754', // '#b39536',
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
      yaxis :{
        labels: {
          formatter: function (value:any) {          
            return value.toFixed();
          }
        },
      }
    }
    console.log("classwiseChartOptions", this.classwiseChartOptions);
    
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
          this.totalStudentCountSubjectwise = res.responseData.responseData1[0].totalStudentCount;
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
        },
        events: {
          click: (_event: any, _chartContext: any, config: any) => {
            if(config.dataPointIndex != -1){
            let mainFilter = this.mainFilterForm.value;
            let selectedFilter = this.subjectWiseFilterForm.value;
            let lable = config.config.xaxis.categories[config.dataPointIndex];
            selectedFilter.subjectId = this.subjectResp.find(res => lable == (this.selectedLang == 'English' ? res.subject : res.m_Subject)).id;
            let obj = this.returnObjectOfChart(mainFilter, selectedFilter, 'Subject');
            localStorage.setItem('selectedChartObjDashboard2', JSON.stringify(obj))
            this.router.navigate(['/dashboard-student-data']); //{ queryParams: obj }
          }
        }
        }
      },
      colors: [
        '#b51d31',
        '#E98754',//'#b39536',
        '#50c77b',
        '#2b908f',
        '#f9a3a4',
        '#90ee7e',
        '#f48024',
        '#69d2e7',
        '#3b42a8',
        '#561f78',
        '#cf637a'
      ],
      plotOptions: {
        bar: {
          horizontal: false,
          distributed: true,
        },
      },
      dataLabels: {
        enabled: true,
      },
      xaxis: {
        categories: xAxiaArray,
      },
      yaxis :{
        labels: {
          formatter: function (value:any) {          
            return value.toFixed();
          }
        },
      }      
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

  returnObjectOfChart(mainFilter: any, selectedFilter: any, graphName?: any) {
    // let obj: any;
    console.log("selectedFilter", selectedFilter);
    
    return {
      StateId: mainFilter?.stateId,
      DistrictId: mainFilter?.districtId,
      TalukaId: mainFilter?.talukaId,
      CenterId: mainFilter?.centerId,
      VillageId: mainFilter?.villageId,
      SchoolId: mainFilter?.schoolId,
      StandardId: selectedFilter?.classId || 0,
      SubjectId: selectedFilter?.subjectId || 0,
      TeacherId_OfficerId:  selectedFilter?.teacherId_OfficerId, //selectedFilter?.userId
      IsInspection: false,
      EvaluatorId: selectedFilter?.evaluatorId,
      GraphLevelId: selectedFilter?.levelId,
      ExamTypeId: this.examType?.value,
      EducationYearId: mainFilter?.acYearId || 0,
      graphName: graphName,
      lan: this.selectedLang
    }
  }
}
