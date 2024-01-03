import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import ApexCharts from 'apexcharts';
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
  stateLabel: any;
  districtLabel: any;
  talukaLabel: any;
  centerName: any;
  villageName: any;
  examTypeData = new Array();
  centerChartOption: any;
  schoolChartOption: any;
  schoolChartOptionFlag: boolean = false;
  selectedCenter: any;
  selectedSchool: any;
  schoolChartEnable: boolean = false;
  tableDataArray = new Array();
  tableDatasize: any;
  pageNumber: number = 1;
  dashboardCountData = new Array();
  isTeacherTable: boolean = false;


  get f() { return this.mainFilterForm.controls }

  constructor(private masterService: MasterService,
    public webStorage: WebStorageService,
    private fb: FormBuilder,
    private apiService: ApiService,
    private spinner: NgxSpinnerService,
    private error: ErrorsService
    ,) { }

  ngOnInit() {
    this.mainFillterDefaultFormat();
    this.allmainDropdownApi();
    this.webStorage.langNameOnChange.subscribe((lang) => {
      this.selectedLang = lang;
      this.setTableData();
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
    // this.getExamType();
    this.getdashboardCount();
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
    this.stateLabel = this.stateData?.find((res: any) => res.id == this.f['stateId'].value);    
    this.districtData = [];
    this.masterService.getAllDistrict(this.selectedLang, this.f['stateId'].value).subscribe((res: any) => {
      this.districtData = res.responseData;
      this.getTalukas()
    });
  }

  getTalukas() {
    this.districtLabel = this.districtData.find((res: any) => res.id == this.f['districtId'].value);
    this.talukaData = [];
    if(this.f['districtId'].value){
    this.masterService.getAllTaluka(this.selectedLang, this.f['districtId'].value).subscribe((res: any) => {
    this.talukaData = [{ "id": 0, "taluka": "All", "m_Taluka": "सर्व" }, ...res.responseData];
    this.talukaLabel = this.talukaData.find((res: any) => res.id == this.f['talukaId'].value && this.f['talukaId'].value != 0);
      // this.f['talukaId'].patchValue(this.userDetails?.userTypeId < 3 ? 0 : this.userDetails?.talukaId);
      // this.getCenters();
    })
    }

  }

  getSeletedTaluka(){
    this.talukaLabel = this.talukaData.find((res: any) => res.id == this.f['talukaId'].value && this.f['talukaId'].value != 0);
  }

  // getCenters() {
  //   this.talukaLabel = this.talukaData.find((res: any) => res.id == this.f['talukaId'].value && this.f['talukaId'].value != 0);
  //   this.centerData = [{ "id": 0, "center": "All", "m_Center": "सर्व" }];
  //   this.f['centerId'].setValue(0);
  //   if (this.f['talukaId'].value) {
  //     this.masterService.getAllCenter(this.selectedLang, this.f['talukaId'].value || 0).subscribe((res: any) => {
  //       this.centerData.push(...res.responseData);
  //       this.getVillage();
  //     })
  //   } else {
  //     this.getVillage();
  //   }
  // }

  // getVillage() {
  //   this.centerName = this.centerData.find((res: any) => res.id == this.f['centerId'].value && this.f['centerId'].value != 0);
  //   // this.centerName = this.selectedLang == 'English' ? obj.center : obj.m_Center
  //   this.villageData = [{ "id": 0, "village": "All", "m_Village": "सर्व" }];
  //   this.f['villageId'].patchValue(0);
  //   if (this.f['centerId'].value) {
  //     this.masterService.getAllVillage(this.selectedLang, (this.f['centerId'].value || 0)).subscribe((res: any) => {
  //       this.villageData.push(...res.responseData);
  //       this.getschools();
  //     });
  //   } else {
  //     this.getschools()
  //   }
  // }

  // getschools() {
  //   this.villageName = this.villageData.find((res: any) => res.id == this.f['villageId'].value && this.f['villageId'].value != 0);
  //   // this.villageName = this.selectedLang == 'English' ? obj.village : obj.m_Village
  //   this.schoolData = [{ "id": 0, "schoolName": "All", "m_SchoolName": "सर्व" }];
  //   this.f['schoolId'].patchValue(0);
  //   if (this.f['villageId'].value) {
  //     this.masterService.getAllSchoolByCriteria(this.selectedLang, (this.f['talukaId'].value), (this.f['villageId'].value), (this.f['centerId'].value)).subscribe((res: any) => {
  //       this.schoolData.push(...res.responseData);
  //     })
  //   }
  // }
  // getExamType() {
  //   this.examTypeData = [];
  //   this.masterService.getExamType(this.selectedLang).subscribe((res: any) => {
  //     this.examTypeData = [{ id: 0, examType: "All", m_ExamType: "सर्व", isDeleted: false }, ...res.responseData];
  //   })
  // }

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

  onMainFilterSubmit(_flag?: any) {
    this.getdashboardCount();
    this.getCenterwiseBarDetails();
  }

  chngeLevel(){
    this.schoolChartOptionFlag = false;
    this.isTeacherTable = false;
    this.getCenterwiseBarDetails();
  }
  getCenterwiseBarDetails() {    
    this.schoolChartOption = ''
    this.tableDataArray = [];
    this.spinner.show()
    let formValue = this.mainFilterForm.value;
    let url = `StateId=${formValue?.stateId}&DistrictId=${formValue?.districtId}&TalukaId=${formValue?.talukaId}&CenterId=${formValue?.centerId}&VillageId=${formValue?.villageId}&SchoolId=${formValue?.schoolId}&StandardId=${0}&SubjectId=${0}&ExamTypeId=${0}&EducationYearId=${this.academicYear.value}&GraphLevelId=${this.levelId.value}&lan=`
    this.apiService.setHttp('GET', 'zp-satara/Dashboard/GetTalukaDashboardCenterWiseGraphDataWeb?' + url, false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == "200" && res.responseData.responseData1.length) {
          this.spinner.hide();
          let centerWiseGraphData = res.responseData.responseData1;
          let uniqueCenterArr = [...new Set(centerWiseGraphData.map(item => this.selectedLang == 'English' ? item.center : item.m_Center))];
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
                centerName: this.selectedLang == 'English' ? x.center : x.m_Center,
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
          console.log("subjectsArrayCenter", subjectsArray);
          subjectsArray.length ? this.centerwiseBarChart(subjectsArray, uniqueCenterArr):'';
        }
        else {
          this.spinner.hide();
          this.centerChartOption = null;
          this.schoolChartOption = null;
          this.tableDataArray = [];
        }
      },
      error: (error: any) => {
        this.spinner.hide();
        this.error.handelError(error.message);
        this.centerChartOption = null;
        this.schoolChartOption = null;
        this.tableDataArray = [];
      }
    });

  }

  centerwiseBarChart(subArray?: any, XArray?: any) {
    this.centerChartOption = {
      series: subArray,
      chart: {
        type: 'bar',
        height: 300,
        toolbar: {
          show: false
        },
        events: {
          click: (_config: any, _event: any, chartContext: any) => {
            if (chartContext?.seriesIndex >= 0) {
              let centerId = chartContext?.config.series[chartContext?.seriesIndex].center[chartContext?.dataPointIndex];
              let Center = chartContext?.config.xaxis.categories[chartContext?.dataPointIndex]
              this.selectedCenter = this.selectedLang == 'English' ? Center + ' Center' : Center + ' केंद्र'
              console.log("onclick center", chartContext, _config, this.selectedCenter);
              this.schoolChartOptionFlag = false;
              this.schoolChartOption = null;
              this.isTeacherTable = false;
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
        custom: function ({ seriesIndex, dataPointIndex, w }: any) {
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
    // this.getSchoolwiseBarDetails(subArray?.[0]['center'][0]); //default loaded first center 
    // this.selectedCenter = this.selectedLang == 'English' ? XArray?.[0] + 'Center' : XArray?.[0] + ' केंद्र'
  }

  getdashboardCount() { 
    let fv = this.mainFilterForm.value;
    let url = `StateId=${fv.stateId}&DistrictId=${fv.districtId}`
    url += `&TalukaId=${fv.talukaId}&EducationYearId=${+this.academicYear.value || 0}`
    this.dashboardCountData = [];
    this.spinner.show();
    this.apiService.setHttp('GET', 'zp-satara/Dashboard/GetDashboardCount?' + url, false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == "200" && res.responseData.responseData1.length) {
          this.dashboardCountData.push(res.responseData.responseData1[0]);
        } else {
          this.dashboardCountData = [];
          // this.totalStudentSurveyData = [];
        }
        this.spinner.hide();
      },
      error: (error: any) => {
        this.spinner.hide();
        this.dashboardCountData = [];
        this.error.handelError(error.message)
      }
    });
  }

  getSchoolwiseBarDetails(centerId?: any) {
    this.spinner.show()
    let formValue = this.mainFilterForm.value;
    let url = `StateId=${formValue?.stateId}&DistrictId=${formValue?.districtId}&TalukaId=${formValue?.talukaId}&CenterId=${centerId}&VillageId=${0}&SchoolId=${0}&StandardId=${0}&SubjectId=${0}&ExamTypeId=${0}&EducationYearId=${this.academicYear.value}&GraphLevelId=${this.levelId.value}&lan=`
    this.apiService.setHttp('GET', 'zp-satara/Dashboard/GetTalukaDashboardSchoolWiseGraphDataWeb?' + url, false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == "200" && res.responseData.responseData1.length) {
          let schoolWiseGraphData = res.responseData.responseData1;
          let uniqueSchoolArr = [...new Set(schoolWiseGraphData.map(item => this.selectedLang == 'English' ? item.schoolName : item.m_SchoolName))];
          const subjectsObj = {};
          schoolWiseGraphData.forEach(x => {
            const subjectId = x.subjectId;
            if (!subjectsObj[subjectId]) {
              subjectsObj[subjectId] = {
                school: [],
                totalStudent: x.totalStudentCount,
                name: this.selectedLang == 'English' ? x.subjectName : x.m_SubjectName,
                data: []
              };
            }
            subjectsObj[subjectId].data.push(
              x.studentCount,
            );
            subjectsObj[subjectId].school.push(x.schoolId);
          });
          const schoolsubArray = Object.values(subjectsObj);
          this.schoolChartOption = ''
          schoolsubArray.length > 0 ? this.schoolwiseBarChart(schoolsubArray, uniqueSchoolArr) : '';

        }
        else {
          this.schoolChartOption = null;
          this.tableDataArray = [];
        }
      },
      error: (error: any) => {
        this.spinner.hide();
        this.error.handelError(error.message);
        this.schoolChartOption = null;
        this.tableDataArray = [];
      }
    });



  }

  schoolwiseBarChart(_schholSubArr?: any, _SchoolNameArray?: any) {
    this.spinner.hide();
    this.schoolChartOptionFlag = false;
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
          //   click: (_event: any, chartContext: any, config: any) => {
          //     if (config.seriesIndex >= 0) {
          //       let optionalSubjectindex = config.seriesIndex;
          //       console.log("event click on school bar ",optionalSubjectindex);
          //       // series.w.globals.initialSeries
          //       // series.w.config.series[0]
          //       let schoolId = chartContext?.series?.w.config.series[config?.seriesIndex].schoolId[config?.dataPointIndex];

          //       this.getSchoolWisedata(schoolId);
          //     }
          //   }
          // }
          click: (_config: any, _event: any, chartContext: any) => {
            if (chartContext?.seriesIndex >= 0) {
              console.log("onclick school", chartContext, _config);
              let schoolId = chartContext?.config.series[chartContext?.seriesIndex].school[chartContext?.dataPointIndex];
              let school = chartContext?.config.xaxis.categories[chartContext?.dataPointIndex]
              this.selectedSchool = this.selectedLang == 'English' ? school + ' School' : school + ' शाळा'
              // let schoolId = chartContext?.config.series[chartContext?.seriesIndex].schoolId;
              this.getSchoolWiseTeachdata(schoolId);
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
        custom: function ({ seriesIndex, dataPointIndex, w }: any) {
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
    var chartOrigin = document.querySelector('#Schoolchart');
    if (chartOrigin) {
      let chart = new ApexCharts(chartOrigin, this.schoolChartOption);
      chart.render();
    }
    this.schoolChartOptionFlag = true;
    // this.getSchoolWiseTeachdata(_schholSubArr?.[0]['school'][0]);
    // this.selectedSchool = this.selectedLang == 'English' ? _SchoolNameArray?.[0] + ' School' : _SchoolNameArray?.[0] + ' शाळा'
  }


  getSchoolWiseTeachdata(schoolId?: number) {
    this.spinner.show();
    let url = `SchoolId=${schoolId}&SubjectId=0&lan=EN`
    this.apiService.setHttp('GET', 'zp-satara/Dashboard/GetTalukaDashboardSchoolWiseTeacherDetailsWeb?' + url, false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        this.spinner.hide();
        if (res.statusCode == '200' && res.responseData.responseData1.length) {
          this.tableDataArray = res.responseData.responseData1;
          this.tableDatasize = res.responseData?.responseData2?.pageCount;
        }
        else {
          this.spinner.hide();
          this.tableDataArray = [];
          this.tableDatasize = 0;
        }
        this.setTableData('data');
      },
      error: (error: any) => {
        this.spinner.hide();
        this.error.handelError(error.message);
        this.tableDataArray = [];
      }
    })

  }

  setTableData(flag?: string) {
    let displayedColumns = ['srNo', 'profilePhoto', this.selectedLang == 'English' ? 'name' : 'm_Name', this.selectedLang == 'English' ? 'teacherRole' : 'm_TeacherRole', this.selectedLang == 'English' ? 'standard' : 'm_Standard', 'mobileNo', 'emailId'];
    let displayedheaders = ['Sr. No.', '', 'Teacher Name', 'Teacher Role', 'Standard', 'Mobile No', 'EmailId'];
    let marathiDisplayedheaders = ['अ.क्र.', '', 'शिक्षकाचे नाव', 'शिक्षकाची भूमिका', 'इयत्ता', 'मोबाईल क्र', 'ई - मेल आयडी'];
    let tableData = {
      pageNumber: this.pageNumber,
      pageName: 'Profile',
      highlightedrow: true,
      img: 'profilePhoto', blink: true, badge: '', isBlock: '', pagintion: false, status: 'actualGrade',
      displayedColumns: displayedColumns,
      tableData: this.tableDataArray,
      tableSize: this.tableDatasize,
      tableHeaders: this.selectedLang == 'English' ? displayedheaders : marathiDisplayedheaders
    };
    this.apiService.tableData.next(tableData);
    flag == 'data' ? this.isTeacherTable = true : '' ;

  }

    resetMainFilter() {
      this.mainFillterDefaultFormat();
      this.getState();
      // this.onMainFilterSubmit();
      this.academicYear.setValue(this.webStorage.getYearId());
      this.isTeacherTable = false;

    }
  



}
