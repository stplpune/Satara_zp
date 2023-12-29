import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiService } from 'src/app/core/services/api.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { MasterService } from 'src/app/core/services/master.service';
import { WebStorageService } from 'src/app/core/services/web-storage.service';
declare var $: any;
@Component({
  selector: 'app-dashboard3',
  templateUrl: './dashboard3.component.html',
  styleUrls: ['./dashboard3.component.scss']
})
export class Dashboard3Component {
  selectedLang: any;
  graphLevelArr = new Array();
  levelId = new FormControl(1);
  mainFilterForm!: FormGroup;
  academicYear = new FormControl(this.webStorage.getYearId());
  stateData = new Array();
  districtData = new Array();
  talukaData = new Array();
  centerData = new Array();
  villageData = new Array();
  schoolData = new Array();
  acYear = new Array();
  districtLabel: any;
  talukaLabel: any;
  centerName: any;
  villageName: any;
  examTypeData = new Array();
  centerChartOption: any;
  schoolChartOption: any;
  selectedCenter: any;
  schoolChartEnable:boolean = false;
  get f() { return this.mainFilterForm.controls }

  constructor(private masterService: MasterService,
    public webStorage: WebStorageService,
    private fb: FormBuilder,
    private apiService: ApiService,
    private spinner: NgxSpinnerService,
    private error: ErrorsService) { }

  ngOnInit() {
    this.mainFillterDefaultFormat();
    this.allmainDropdownApi();
    this.webStorage.langNameOnChange.subscribe((lang) => {
      this.selectedLang = lang;
    });

  }

  mainFillterDefaultFormat() {
    this.mainFilterForm = this.fb.group({
      stateId: [this.webStorage.getState()],
      districtId: [this.webStorage.getDistrict()],
      talukaId: [this.webStorage.getTaluka()],
      centerId: [0],
      villageId: [0],
      schoolId: [0],
    })
  }

  allmainDropdownApi() {
    this.getAllGraphLevel();
    this.getYearArray();
    this.getState();
    this.getExamType();
    this.getCenterwiseBarDetails();

  }

  // All dropdown starte here 
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
    this.talukaLabel = this.talukaData.find((res: any) => res.id == this.f['talukaId'].value && this.f['talukaId'].value != 0);
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
    this.centerName = this.centerData.find((res: any) => res.id == this.f['centerId'].value && this.f['centerId'].value != 0);
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
    this.villageName = this.villageData.find((res: any) => res.id == this.f['villageId'].value && this.f['villageId'].value != 0);
    // this.villageName = this.selectedLang == 'English' ? obj.village : obj.m_Village
    this.schoolData = [{ "id": 0, "schoolName": "All", "m_SchoolName": "सर्व" }];
    this.f['schoolId'].patchValue(0);
    if (this.f['villageId'].value) {
      this.masterService.getAllSchoolByCriteria(this.selectedLang, (this.f['talukaId'].value), (this.f['villageId'].value), (this.f['centerId'].value)).subscribe((res: any) => {
        this.schoolData.push(...res.responseData);
      })
    }
  }
  getExamType() {
    this.examTypeData = [];
    this.masterService.getExamType(this.selectedLang).subscribe((res: any) => {
      this.examTypeData = [{ id: 0, examType: "All", m_ExamType: "सर्व", isDeleted: false }, ...res.responseData];
    })
  }

  getYearArray() {
    this.acYear = [];
    this.masterService.getAcademicYears(this.selectedLang).subscribe((res: any) => {
      this.acYear = res.responseData;
      this.academicYear.patchValue(this.webStorage.getYearId())

    })
  }

  getAllGraphLevel() {
    this.masterService.GetAllGraphLevel('').subscribe({
      next: (res: any) => {
        if (res.statusCode == '200') {
          this.graphLevelArr = res.responseData;
          this.levelId.patchValue(this.graphLevelArr[0].id)
        }
      },
      error: (() => {
        this.graphLevelArr = [];
      })
    });
  }

  onMainFilterSubmit(flag?: any) {
    if (flag == "year") {
      let yearValue = this.academicYear.value;
      this.f['acYearId'].setValue(yearValue);
    }
    this.getdashboardCount();
    this.getCenterwiseBarDetails();
  }

  getCenterwiseBarDetails() {
    this.spinner.show()
    let formValue = this.mainFilterForm.value;
    let url = `StateId=${formValue?.stateId}&DistrictId=${formValue?.districtId}&TalukaId=${formValue?.talukaId}&CenterId=${formValue?.centerId}&VillageId=${formValue?.villageId}&SchoolId=${formValue?.schoolId}&StandardId=${0}&SubjectId=${0}&ExamTypeId=${0}&EducationYearId=${this.academicYear.value}&GraphLevelId=${this.levelId.value}&lan=`
    this.apiService.setHttp('GET', 'zp-satara/Dashboard/GetTalukaDashboardCenterWiseGraphDataWeb?' + url, false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == "200" && res.responseData.responseData1.length) {
          this.spinner.hide();
          let centerWiseGraphData = res.responseData.responseData1;
          let uniqueCenterArr = [...new Set(centerWiseGraphData.map(item => item.center))];
          // let dataArray: any[] = [];
          //   let filterCenter = centerWiseGraphData.filter((y:any)=>y.centerId == center);
          //   let dataObjArray: any[] = [];
          //   console.log("filterSubject",filterCenter);
          //   filterCenter.map((z:any)=>{
          //     const subData = {
          //       name: this.selectedLang == 'English' ? z.subjectName : z.m_SubjectName,
          //       data: z.studentCount,
          //       centerId: z.centerId
          //     }
          //     dataObjArray.push(subData);
          //   })
          //   dataArray.push(dataObjArray);
          // })   
          const subjectsObj = {};

          centerWiseGraphData.forEach(x => {
            const subjectId = x.subjectId;
            if (!subjectsObj[subjectId]) {
              subjectsObj[subjectId] = {
                subjectId: subjectId,
                center: [],
                totalStudent: x.totalStudentCount,
                name: this.selectedLang == 'English' ? x.subjectName : x.m_SubjectName,
                data: []
              };
            }
            subjectsObj[subjectId].data.push(
              x.studentCount,
            );
            subjectsObj[subjectId].center.push(
              x.centerId,
            );
          });
          const subjectsArray = Object.values(subjectsObj);
          console.log("subjectsArray", subjectsArray);
          
          this.centerwiseBarChart(subjectsArray, uniqueCenterArr);

        }
      },
      error: (error: any) => {
        this.spinner.hide();
        this.error.handelError(error.message);
      }
    });

  }

  centerwiseBarChart(subArray?: any, XArray?: any) {
    this.centerChartOption = {
      series: subArray,
      // [{
      //   name: 'language',
      //   data: [2,4,5]
      //   },
      //   {
      //   name: 'Math',
      //   data: [2,4,5]
      //   }
      //   ],
      chart: {
        type: 'bar',
        height: 250,
        toolbar: {
          show: false
        },
        events: {
          click: (_config: any, _event: any, chartContext: any) => {
            if(chartContext?.seriesIndex >= 0){
              console.log("onclick center", _config);
              let centerId = chartContext?.config.series[chartContext?.seriesIndex].center[chartContext?.dataPointIndex];
              this.getSchoolwiseBarDetails(centerId);
            }
            
          }
          // dataPointSelection: (_e, chartContext, opts) => {
          //   if(opts?.seriesIndex >= 0){
          //     console.log("centerEvent",chartContext, opts);
          //     let centerId = chartContext?.w.globals.initialSeries[opts?.seriesIndex].center[opts?.dataPointIndex];
          //     this.getSchoolwiseBarDetails(centerId);              
          //   }            
          // },
        }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          barHeight: "50%",
          columnWidth: '30%',
          dataLabels: {
            enabled: false,
          }
        }
      },
      dataLabels: { //OnYBar Show Count
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


      colors: ['#b51d31', '#E98754', '#50c77b'],
      subtitle: {
        text: "(Click on bar to see details)",
        offsetY: 5
      },
      xaxis: {
        axisTicks: {
          show: true
        },
        categories: XArray,
        parameters: this.selectedLang == 'English' ? ['Subject', 'Student Assessed Count', 'Total Student'] : ['विषय', 'मूल्यमापन केलेली संख्या', 'एकूण विद्यार्थी'],
      },
      yaxis: {
        min: 0,
        labels: {
          formatter: function (val: any) {
            return val < 0 ? '' : val.toFixed(0); // y axis  values 0 1 2
          }
        },
      },
      tooltip: {
        custom: function ({seriesIndex, dataPointIndex, w }: any) {
          // console.log("tooltip", series);
          return (
            '<div class="arrow_box" style="padding:10px;">' +
            "<div>" + w.config.xaxis.parameters[0] + " : <b> " + w.globals.initialSeries[seriesIndex].name + '</b>' + "</div>" +
            "<div>" + w.config.xaxis.parameters[1] + " : <b> " + w.globals.initialSeries[seriesIndex].data[dataPointIndex] + '</b>' + "</div>" +
            "<div>" + w.config.xaxis.parameters[2] + " : <b> " + w.globals.initialSeries[seriesIndex].totalStudent + '</b>' + "</div>" +
            "</div>"
          );
        },
      }

    }
  }

  getdashboardCount() {
    // let fv = this.mainFilterForm.value;
    // let url = `StateId=${fv.stateId}&DistrictId=${fv.districtId}`
    // url += `&TalukaId=${fv.talukaId}&CenterId=${fv.centerId}&VillageId=${fv.villageId}`
    // url += `&SchoolId=${fv.schoolId}&EducationYearId=${+fv.acYearId || 0}&ExamTypeId=${this.examType.value}&lan=${this.selectedLang}`
    // this.dashboardCountData = [];
    // this.spinner.show();
    // this.apiService.setHttp('GET', 'zp-satara/Dashboard/GetDashboardCount?' + url, false, false, false, 'baseUrl');
    // this.apiService.getHttp().subscribe({
    //   next: (res: any) => {
    //     if (res.statusCode == "200" && res.responseData.responseData1.length) {
    //       this.dashboardCountData.push(res.responseData.responseData1[0]);
    //       setTimeout(() => {
    //         this.getPieChartData();
    //       }, 100)

    //     } else {
    //       this.dashboardCountData = [];
    //       this.piechartOptions = '';
    //       // this.totalStudentSurveyData = [];
    //     }
    //     this.spinner.hide();
    //   },
    //   error: (error: any) => {
    //     this.spinner.hide();
    //     this.piechartOptions = '';
    //     this.dashboardCountData = [];
    //     this.error.handelError(error.message)
    //   }
    // });
  }

  getSchoolwiseBarDetails(centerId?:any){
    this.spinner.show()
    let formValue = this.mainFilterForm.value;
    let url = `StateId=${formValue?.stateId}&DistrictId=${formValue?.districtId}&TalukaId=${formValue?.talukaId}&CenterId=${centerId}&VillageId=${0}&SchoolId=${0}&StandardId=${0}&SubjectId=${0}&ExamTypeId=${0}&EducationYearId=${this.academicYear.value}&GraphLevelId=${this.levelId.value}&lan=`
    this.apiService.setHttp('GET', 'zp-satara/Dashboard/GetTalukaDashboardSchoolWiseGraphDataWeb?' + url, false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == "200" && res.responseData.responseData1.length) {
          let schoolWiseGraphData = res.responseData.responseData1;
          let uniqueSchoolArr = [...new Set(schoolWiseGraphData.map(item => item.schoolName))];
          const subjectsObj = {};
          schoolWiseGraphData.forEach(x => {
            const subjectId = x.subjectId;
            if (!subjectsObj[subjectId]) {
              subjectsObj[subjectId] = {
                subjectId: subjectId,
                schoolId:x.schoolId,
                totalStudent: x.totalStudentCount,
                name: this.selectedLang == 'English' ? x.subjectName : x.m_SubjectName,
                data: []
              };
            }
            subjectsObj[subjectId].data.push(
              x.studentCount,
            );
          });
          const schoolsubArray = Object.values(subjectsObj);
          this.schoolChartOption = ''
          this.schoolwiseBarChart(schoolsubArray, uniqueSchoolArr);

        }
      },
      error: (error: any) => {
        this.spinner.hide();
        this.error.handelError(error.message);
      }
    });



  }

  schoolwiseBarChart(_schholSubArr?: any, _SchoolNameArray?: any){
    this.spinner.hide();
    console.log("_schholSubArr", _schholSubArr);
    this.schoolChartOption = {
      series: _schholSubArr,
      chart: {
        type: 'bar',
        height: 250,
        toolbar: {
          show: false
        },
        events: {
          click: (_event: any, _chartContext: any, config: any) => {
            if (config.seriesIndex >= 0) {
              let optionalSubjectindex = config.seriesIndex;
              console.log("event click on bar ",optionalSubjectindex);
              // this.getSchoolwiseBarDetails();
              // const data = this.barChartDataByClass.find((x: any) => (this.selectedLang == 'English' ? x.optionName : x.m_OptionName == this.barchartOptionsByClass.xaxis['categories'][config.dataPointIndex]) && sub ==( this.selectedLang == 'English' ? x.subjectName : x.m_SubjectName) );
              // const data = this.barChartDataByClass.find((x: any) => ((this.selectedLang == 'English' ? x.question : x.m_Question) === (this.barchartOptionsByClass.xaxis['categories'][config.dataPointIndex])));
            }
          }
        }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          barHeight: "50%",
          columnWidth: '30%',
          dataLabels: {
            enabled: false,
          }
        }
      },
      dataLabels: { //OnYBar Show Count
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


      colors: ['#b51d31', '#E98754', '#50c77b'],
    
      xaxis: {
        axisTicks: {
          show: true
        },
        categories: _SchoolNameArray,
        parameters: this.selectedLang == 'English' ? ['Subject', 'Student Assessed Count', 'Total Student'] : ['विषय', 'मूल्यमापन केलेली संख्या', 'एकूण विद्यार्थी'],
      },
      yaxis: {
        min: 0,
        labels: {
          formatter: function (val: any) {
            return val < 0 ? '' : val.toFixed(0); // y axis  values 0 1 2
          }
        },
      },
      tooltip: {
        custom: function ({seriesIndex, dataPointIndex, w }: any) {
          // console.log("tooltip", series);

          return (
            '<div class="arrow_box" style="padding:10px;">' +
            "<div>" + w.config.xaxis.parameters[0] + " : <b> " + w.globals.initialSeries[seriesIndex].name + '</b>' + "</div>" +
            "<div>" + w.config.xaxis.parameters[1] + " : <b> " + w.globals.initialSeries[seriesIndex].data[dataPointIndex] + '</b>' + "</div>" +
            "<div>" + w.config.xaxis.parameters[2] + " : <b> " + w.globals.initialSeries[seriesIndex].totalStudent + '</b>' + "</div>" +
            "</div>"
          );
        },
      }

    }
    this.schoolChartEnable = true;
console.log("this.schoolChartOption", this.schoolChartOption);


  }

  resetMainFilter() {

  }


}
