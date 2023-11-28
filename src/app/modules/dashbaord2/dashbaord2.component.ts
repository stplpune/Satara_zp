import { Component, ViewChild,   } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
 import { ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexPlotOptions, ApexStroke, ApexTooltip, ApexXAxis, ApexYAxis, ChartComponent } from 'ng-apexcharts';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiService } from 'src/app/core/services/api.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { MasterService } from 'src/app/core/services/master.service';
import { WebStorageService } from 'src/app/core/services/web-storage.service';

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
  mainFilterForm!: FormGroup;

  dashboardCountData = new Array();
  graphInstance: any;
  selectedLang: any;
  piechartOptions: any;
//  chartOptions: any;
  
  subjectResp = new Array();
  standardResp = new Array();
  teacherResp = new Array();
  bartDetailsObj = new Array();

  evaluatorDataArray = new Array();
  

   @ViewChild("schoolwiseChart") schoolwiseChart!: ChartComponent;
   public schoolwiseChartOptions!: Partial<ChartOptions> | any;

   @ViewChild("teacherwiseChart") teacherwiseChart!: ChartComponent;
   public teacherwiseChartOptions!: Partial<ChartOptions> | any;


  constructor(private spinner: NgxSpinnerService,
    private apiService: ApiService,
    private error: ErrorsService,
    public webStorage: WebStorageService,
    private fb: FormBuilder,
    private masterService: MasterService,

  ) { }
  ngOnInit() {
    this.webStorage.langNameOnChange.subscribe((lang) => {
      console.log(lang);

      this.selectedLang = lang;
      // this.tableHeadingArrayTop = this.selectedLang == 'English' ? ['Top Performing Schools'] : ['उत्तम कामगिरी करणाऱ्या शाळा'];
      // this.tableHeadingArrayLow = this.selectedLang == 'English' ? ['Low Performing Schools'] : ['साधारण कामगिरी करणाऱ्या शाळा'];
      // this.initialApiCall('languageChange');
    });
    this. mainFillterDefaultFormat();
    this.defaultSchoolwiseFormat();
    this.defaultTeacherwiseFormat()
    this.getdashboardCount();
    
    this.getSubject();
    this.GetAllStandardClassWise();
    this.getTeacher();
    this.bindEvaluator();

    this.getPieChart();
    this.getPieChartData();
    this.getSchoolwiseBarDetails();
    this.getTeacherwiseBarDetails();
  
  }

  mainFillterDefaultFormat() {
    this.mainFilterForm = this.fb.group({
      acYearId: [''],
      talukaId: [''],
      centerId: [''],
      villageId: [''],
      schoolId: [''],
    })
  }

  defaultSchoolwiseFormat() {
    this.filterForm = this.fb.group({
      evaluatorId: [1],
      classId: [0],
      subjectId: [0],
    })
  }

  defaultTeacherwiseFormat() {
    this.filterFormTeacherWise = this.fb.group({
      evaluatorId: [1],
      classId: [0],
      subjectId: [0],
    })
  }


  // ----------------------------------dropdown start here----------------------
  getSubject() {
    this.masterService.getAllSubject(this.webStorage.languageFlag).subscribe({
      next: (res: any) => {
        if (res.statusCode == '200') {
          this.subjectResp = res.responseData;
        }
      },
      error: (() => {
        this.subjectResp = [];
      })
    });
  }

  GetAllStandardClassWise() {
    this.masterService.GetAllStandardClassWise(this.webStorage.languageFlag).subscribe({
      next: (res: any) => {
        if (res.statusCode == '200') {
          this.standardResp = res.responseData;
        }
      },
      error: (() => {
        this.standardResp = [];
      })
    });
  }

  getTeacher() {
    this.masterService.getRoleOfTeacher(this.webStorage.languageFlag).subscribe({
      next: (res: any) => {
        if (res.statusCode == '200') {
          this.teacherResp = res.responseData;
        }
      },
      error: (() => {
        this.teacherResp = [];
      })
    });
  }


  // ----------------------------------drop end here----------------------

  getdashboardCount() {
    // const formData = this.filterForm.value;
    // val == 'sigleField' ? this.filterForm.controls['acYearId'].setValue(this.searchAcadamicYear.value) : this.searchAcadamicYear.setValue(formData.acYearId);

    this.dashboardCountData = [];
    this.spinner.show();
    this.apiService.setHttp('GET', 'zp-satara/Dashboard/GetDashboardCount', false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
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
  // showSvgMap(data: any) {
  //   this.graphInstance ? this.graphInstance.destroy() : '';
  //   //let createMap: any = document.getElementById("#mapsvg");

  //   this.graphInstance = $("#mapsvg").mapSvg({
  //     width: 550,
  //     height: 430,
  //     colors: {
  //       baseDefault: "#0d4487",
  //       background: "#fff",
  //       selected: "#0d4487",
  //       hover: "#0d4487",  // hover effect
  //       directory: "#0d4487",
  //       status: {}
  //     },
  //     regions: data,
  //     viewBox: [0, 0, 763.614, 599.92],
  //     cursor: "pointer",
  //     zoom: {
  //       on: false,
  //       limit: [0, 50],
  //       delta: 2,
  //       buttons: {
  //         on: true,
  //         location: "left"
  //       },
  //       mousewheel: true
  //     },
  //     tooltips: {
  //       mode: "title",
  //       off: true,
  //       priority: "local",
  //       position: "bottom"
  //     },
  //     popovers: {
  //       mode: "on",
  //       on: false,
  //       priority: "local",
  //       position: "top",
  //       centerOn: false,
  //       width: 300,
  //       maxWidth: 50,
  //       maxHeight: 50,
  //       resetViewboxOnClose: false,
  //       mobileFullscreen: false
  //     },
  //     gauge: {
  //       on: false,
  //       labels: {
  //         low: "low",
  //         high: "high"
  //       },
  //       colors: {
  //         lowRGB: {
  //           r: 211,
  //           g: 227,
  //           b: 245,
  //           a: 1
  //         },
  //         highRGB: {
  //           r: 67,
  //           g: 109,
  //           b: 154,
  //           a: 1
  //         },
  //         low: "#d3e3f5",
  //         high: "#436d9a",
  //         diffRGB: {
  //           r: -144,
  //           g: -118,
  //           b: -91,
  //           a: 0
  //         }
  //       },
  //       min: 0,
  //       max: false
  //     },
  //     source: this.selectedLang == 'English' ? "assets/distSVG/satara.svg" : "assets/distSVG/satara_marathi.svg",
  //     title: "Satara_Dist",
  //     responsive: true
  //   });
  // }

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
          customScale: 1.1,
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


  bindEvaluator(){
    this.apiService.setHttp('get', 'zp-satara/master/GetAllEvaluator?flag_lang=', false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next:(res:any) =>{
        if (res.statusCode == '200') {
          this.evaluatorDataArray = res.responseData;
         // this.getSchoolwiseBarDetails();
        }else{
          this.evaluatorDataArray = [];
        }
      },
      error:(() => {this.evaluatorDataArray = [];})
    })

  }


  getSchoolwiseBarDetails() {
    let fd = this.filterForm.value;
    let url = `StandardId=${fd.classId}&SubjectId=${fd.subjectId}&EvaluatorId=${fd.evaluatorId}`
    this.apiService.setHttp('get', 'zp-satara/Dashboard/GetDashboardStudentGraphDataWeb?' +url, false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == '200') {
          this.bartDetailsObj = res.responseData.responseData1;          
          let xAxiaArray:any=[];
          let yAxisArray:any=[];
        //  let totalStudentCount :any=[];

          this.bartDetailsObj.map((x: any) =>{
            xAxiaArray.push(x.graphLevel);
            yAxisArray.push(x.studentCount)
           // totalStudentCount.push(x.totalStudentCount)
          });        

          this.schoolwiseBarChart(xAxiaArray, yAxisArray,)
        } else {
          // this.chartDetailsObj = [];
          // this.isChartShow = false;
        }
      },
      error: (err: any) => {
        this.spinner.hide();
        // this.chartDetailsObj = [];
        // this.isChartShow = false;
        this.error.handelError(err.status);
      },
    });
  }
  schoolwiseBarChart(xAxiaArray?: any, yAxisArray?: any) {
    this.schoolwiseChartOptions = {
      series: [
        {
          name: 'basic',
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

    // --------------------------------Teacherwise  Performance barChart  end here------------------------------


    getTeacherwiseBarDetails() {
      let fd = this.filterFormTeacherWise.value;
      console.log(fd);
      let url = `StandardId=${fd.classId}&SubjectId=${fd.subjectId}&EvaluatorId=${fd.evaluatorId}`
      this.apiService.setHttp('get', 'zp-satara/Dashboard/GetDashboardTeacherWiseGraphDataWeb?' +url, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => {
          if (res.statusCode == '200') {
            this.bartDetailsObj = res.responseData.responseData1;          
            let xAxiaArray:any=[];
            let yAxisArray:any=[];
          //  let totalStudentCount :any=[];
  
            this.bartDetailsObj.map((x: any) =>{
              xAxiaArray.push(x.graphLevel);
              yAxisArray.push(x.studentCount)
             // totalStudentCount.push(x.totalStudentCount)
            });        
  
            this.teacherwiseBarChart(xAxiaArray, yAxisArray,)
          } else {
            // this.chartDetailsObj = [];
            // this.isChartShow = false;
          }
        },
        error: (err: any) => {
          this.spinner.hide();
          // this.chartDetailsObj = [];
          // this.isChartShow = false;
          this.error.handelError(err.status);
        },
      });
    }
    teacherwiseBarChart(xAxiaArray?: any, yAxisArray?: any) {
      this.teacherwiseChartOptions = {
        series: [
          {
            name: 'basic',
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
}
