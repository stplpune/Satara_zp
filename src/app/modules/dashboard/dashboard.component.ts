import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { AesencryptDecryptService } from 'src/app/core/services/aesencrypt-decrypt.service';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { MasterService } from 'src/app/core/services/master.service';
import { ValidationService } from 'src/app/core/services/validation.service';
import { WebStorageService } from 'src/app/core/services/web-storage.service';
declare var $: any;
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  talukaData = new Array();
  lang !: string;
  schoolData = new Array();
  centerData = new Array();
  villageData = new Array();
  subjectData = new Array();
  filterForm!: FormGroup;
  filterFormForBarGraph!: FormGroup;
  piechartOptions: any;
  stackbarchartOptions: any;
  // stackbarchartOptions1: any;
  stackbarchartOptionsByClass: any;
  dashboardCountData = new Array();
  tableColumn = new Array();
  barChartData = new Array();
  showBarChartF: boolean = false;
  selectedObj!: object | any;
  barChartByTalukaData = new Array();
  graphInstance: any;
  showBarChartS: boolean = false;
  tableDataTopPerformance = new Array();
  tableDataLowPerformance = new Array();
  // tableHeadingArray = new Array();
  tableHeadingArrayTop = new Array();
  tableHeadingArrayLow = new Array();
  displayedheaders = new Array();
  graphSubjectData = new Array();
  totalStudentSurveyData = new Array();
  totalStudentSurveyDataByCLass = new Array();
  optionalSubjectindex!: number;
  SharingObject: any;
  globalTalId: any;
  selectedSurveyData: any;
  standardArray = new Array();
  selectedLang: any;
  enbTalDropFlag: boolean = false;
  standardShowFlag: boolean = false;
  selectedTalukaId: any;
  resetFlag: boolean = false;
  selectedbar!: string;
  selectedTaluka: any;
  selectedCenter: any;
  selectedVillage: any;
  selectedschool: any;
  selectedexamType: any;
  barchartOptions: any;
  educationYear!: number;
  acYear = new Array();
  selectedBarSub!: string;
  subjectArrayByClass = new Array();
  subjectforBar = new FormControl();
  get f() { return this.filterForm.controls }
  get fBgraph() { return this.filterFormForBarGraph.controls }
  BarChartSubjectArray = new Array();
  performanceTableLabel = new FormControl();
  dataSource = new Array();
  barChaOptionHeight!: number;
  selectedBarstatus: any;
  userDetails: any;
  selectedGroupIdindex!: number;
  asessmwntLavel = new FormControl();
  ExamTypeArray = new Array();
  barChartDataByClass = new Array();
  stackbarChartDataByClass = new Array();
  subjectforBarByCLass = new FormControl();
  evaluatorId = new FormControl();

  selectedObjByClass: any;
  graphSubjectDataByClass = new Array();
  barchartOptionsByClass: any;
  selectedBarIndex!: number;
  subjectObjforClass: any;
  isBarChartEmty: boolean = false; // for display msg if empty barchart in base 
  isStackbarEmpty: boolean = false; // for display msg if empty stackbar in base 
  subjectdataFilter = new Array();
  searchAcadamicYear = new FormControl('');
  optionNameArr = new Array();
  optionArr = new Array();
  commonDataResArray = new Array();
  questionArray = new Array();
  stateData = new Array();
  districtData = new Array();
  evaluatorDataArray = new Array();

  constructor(public translate: TranslateService, private masterService: MasterService,
    public webStorage: WebStorageService, private fb: FormBuilder, private apiService: ApiService,
    private error: ErrorsService, private commonMethods: CommonMethodsService, public validation: ValidationService,
    private router: Router, private spinner: NgxSpinnerService,
    private encDec: AesencryptDecryptService
  ) {
  }

  ngOnInit() {
    this.userDetails = this.webStorage.getLoggedInLocalstorageData();
    this.educationYear = this.userDetails?.educationYearId;
    this.asessmwntLavel.patchValue('1');
    this.getSubjectDropForClass();
    this.bindEvaluator();
    this.initialApiCall('initial');
    this.webStorage.langNameOnChange.subscribe((lang) => {
      this.selectedLang = lang;
      //  this.tableHeadingArray = this.selectedLang == 'English' ? ['Top Performing Schools', 'Low Performing Schools']:['उत्तम कामगिरी करणाऱ्या शाळा', 'साधारण कामगिरी करणाऱ्या शाळा'];
      this.tableHeadingArrayTop = this.selectedLang == 'English' ? ['Top Performing Schools'] : ['उत्तम कामगिरी करणाऱ्या शाळा'];
      this.tableHeadingArrayLow = this.selectedLang == 'English' ? ['Low Performing Schools'] : ['साधारण कामगिरी करणाऱ्या शाळा'];
      this.initialApiCall('languageChange');
    });
  }

  initialApiCall(val: any) {
    if (val == 'initial') {
      this.createFilterForm();
      this.getPieChart();
      this.getState();
      this.getExamType();
      setTimeout(() => {
        this.getdashboardCount(val);
      }, 1000);
      this.asessmwntLavel.value == '0' ? '' : (this.getstandardTableArrayCount(val), 
      setTimeout(() => {
      this.getTabledataByTaluka()
      }, 2000)
      );
    } else if (val == 'mapClick') {
      this.getCenters();
      this.getdashboardCount(val);
      this.asessmwntLavel.value == '1' ? (this.getTabledataByTaluka(), this.getstandardTableArrayCount(val)) : '';
    } else if (val == 'languageChange') {
      this.showSvgMap(this.commonMethods.mapRegions());
      this.getPieChartData();
      this.getBarChartSubject()
      setTimeout(() => {
        this.clickOnSvgMap('select');
      }, 70)
    } else if (val == 'form') {
      this.asessmwntLavel.value == '1' ? (this.getstandardTableArrayCount(val), this.getTabledataByTaluka()) : '';
      this.getdashboardCount(val);
    } else if (val == 'sigleField') {
      this.asessmwntLavel.value == '1' ? (this.getstandardTableArrayCount(val), this.getTabledataByTaluka()) : '';
      this.getdashboardCount(val);
    }
  }

  createFilterForm() {
    this.filterForm = this.fb.group({
      acYearId: [],
      stateId:[1],
      districtId:[1],
      talukaId: [0],
      villageId:[0],
      centerId: [0],
      schoolId: [0],
      examTypeId: [0]
    })
    this.filterFormForBarGraph = this.fb.group({
      filtertalukaId: [0],
      filtercenterId: [0],
      filterVillage: [0],
      filtersubjectId: [],
      subjectId: [0],
      questionId: [0],
      optionId: [0],
      examId: [0],
      filterSetNumber: ['', [this.validation.onlyDigits]]
    })
    this.getYearArray();
  }

  ngAfterViewInit() {
    this.showSvgMap(this.commonMethods.mapRegions());
  }

  // --------------------------  dropdown api's --------------------------------------//
  getYearArray() {
    this.acYear = [];
    this.masterService.getAcademicYears().subscribe((res: any) => {
      this.acYear.push(...res.responseData);
      this.f['acYearId'].patchValue(this.educationYear);
    })
  }

  bindEvaluator() {
    this.apiService.setHttp('get', 'zp-satara/master/GetAllEvaluator?flag_lang=' + this.selectedLang, false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == '200') {
          this.evaluatorDataArray = res.responseData;
          // this.evaluatorId.patchValue(this.evaluatorDataArray[0].id);
          this.evaluatorId.setValue(1);
        } else {
          this.evaluatorDataArray = [];
        }
      },
      error: (() => { this.evaluatorDataArray = []; })
    })

  }


  getState(){
    this.stateData = [];
    this.masterService.getAllState(this.selectedLang).subscribe((res:any)=>{
     this.stateData = res.responseData;
     this.getDistrict()
    })
  }

  getDistrict(){
    this.districtData = [];
    this.talukaData = [];
    this.centerData = [];
    this.villageData = [];
    this.schoolData = [];
    this.filterForm.patchValue({
      districtId: 0,
      talukaId: 0,
      centerId: 0,
      villageId : 0,
      schoolId: 0
    });
    if(this.filterForm.value.stateId > 0){
      this.masterService.getAllDistrict(this.selectedLang,this.f['stateId'].value).subscribe((res:any)=>{
        this.districtData = res.responseData;
        this.f['districtId'].setValue(1)
        this.getTalukas()
       })   
    }
  }


  getTalukas() {
    this.talukaData = [];
    this.centerData = [];
    this.villageData = [];
    this.schoolData = [];
    this.filterForm.patchValue({
      talukaId: 0,
      centerId: 0,
      villageId : 0,
      schoolId: 0
    })
    if(this.filterForm.value.districtId > 0){
      this.masterService.getAllTaluka('',this.filterForm.value.districtId).subscribe((res: any) => {
        this.talukaData.push({ "id": 0, "taluka": "All", "m_Taluka": "सर्व" }, ...res.responseData);
        // this.f['talukaId'].patchValue(this.userDetails?.userTypeId < 3 ? 0 : this.userDetails?.talukaId);
        this.getCenters();
      })  
    }
  }

  getCenters() {
    this.centerData = [];
    this.villageData = [];
    this.schoolData = [];
    this.filterForm.patchValue({
      centerId: 0,
      villageId : 0,
      schoolId: 0
    })
    this.selectedTaluka = this.talukaData.find((x: any) => x.id == this.f['talukaId'].value);
    if (this.f['talukaId'].value > 0) {
      this.masterService.getAllCenter('', (this.f['talukaId'].value | 0)).subscribe((res: any) => {
        this.centerData.push({ "id": 0, "center": "All", "m_Center": "सर्व" }, ...res.responseData);
        this.f['centerId'].patchValue(0);
        this.getVillage();
      })
    }
  }

  getVillage() {
    this.villageData = [];
    this.schoolData = [];
    this.filterForm.patchValue({
      villageId : 0,
      schoolId: 0
    });
    this.selectedCenter = this.centerData.find((x: any) => x.id == this.f['centerId'].value);
    if(this.f['centerId'].value > 0){
      this.masterService.getAllVillage('', (this.f['centerId'].value | 0)).subscribe((res : any)=>{
        this.villageData.push({ "id": 0, "village": "All", "m_Village": "सर्व" }, ...res.responseData);
        this.f['villageId'].patchValue(0);
        this.getschools();
      });
    }
  }


  getschools() {
    this.schoolData = [];
    // if(this.f['centerId'].value){
    this.filterForm.controls['schoolId'].setValue(0);
    this.fBgraph['filtercenterId'].patchValue(this.f['centerId'].value);
    this.selectedVillage = this.villageData.find((x: any) => x.id == this.f['villageId'].value);
    if(this.f['villageId'].value > 0){
      this.masterService.getAllSchoolByCriteria('', (this.f['talukaId'].value | 0), (this.f['villageId'].value | 0), (this.f['centerId'].value | 0)).subscribe((res: any) => {
        this.schoolData.push({ "id": 0, "schoolName": "All", "m_SchoolName": "सर्व" }, ...res.responseData);
        this.selectedSchool();
      });
    }
    
    // }
  }
  getExamType() {
    this.masterService.getExamType('').subscribe((res: any) => {
      this.ExamTypeArray = [{ "id": 0, "examType": "All", "m_ExamType": "सर्व" }].concat(res.responseData);
      // this.ExamTypeArray.sort((a, b) => a.id - b.id);
    })
  }

  selectedSchool() {
    this.selectedschool = this.schoolData.find((x: any) => x.id == this.f['schoolId'].value);
  }
  selectedExamType() {
    this.selectedexamType = this.ExamTypeArray.find((x: any) => x.id == this.f['examTypeId'].value);
  }

  getSubjectDropdown(){

  }
 
  //--------------------------- pie/bar Chart declaration -----------------------------------//
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
  
 

  passingParameters(data: any, examTypeId: any) {
    const formData = this.filterForm.value;
    
    // const SelectedstandardArray = ((this.totalStudentSurveyData.find((x: any) => x.status == true).standardDetails.filter((xx: any) => xx.status == true)).map((y: any) => y.standardId));
    const SelectedstandardArray = (this.totalStudentSurveyData.find((x: any) => x.status == true));
    this.SharingObject = {
      StateId: formData?.stateId,
      DistrictId: formData?.districtId,
      TalukaId: formData?.talukaId | 0,
      CenterId: formData?.centerId | 0,
      VillageId: formData?.villageId | 0,
      SchoolId: formData?.schoolId | 0,
      SubjectId: data?.subjectId | 0,
      OptionGrade: this.asessmwntLavel.value == '0' ? this.selectedBarstatus == "stack" ? (data?.optionGrade || 0) : data?.questionId : (data?.optionGrade || 0),
      // standardArray: standardArray,
      standardArray: SelectedstandardArray?.standardId,
      EducationYearId: formData?.acYearId | 0,
      asessmwntLavel: this.asessmwntLavel.value,
      StandardId: this.selectedObjByClass?.standardId,
      ExamTypeId: examTypeId,
      // ExamTypeId: examTypeId,//formData?.examTypeId,
      questionId: this.selectedBarstatus == "stack" ? data?.questionId : data?.questionId,
      evaluatorId: this.evaluatorId.value | 0
    }

    console.log("SharingObject", this.SharingObject);
    
    this.webStorage.selectedBarchartObjData.next(this.SharingObject);
    localStorage.setItem('selectedBarchartObjData', JSON.stringify(this.SharingObject))
    this.router.navigate(['/dashboard-student-details']);
  }
  // ---------------------------- dashboard counts & assessemnt table click functionality -------------------------//
  getdashboardCount(val?: any) {
    const formData = this.filterForm.value;
    val == 'sigleField' ? this.filterForm.controls['acYearId'].setValue(this.searchAcadamicYear.value) : this.searchAcadamicYear.setValue(formData.acYearId);

    this.dashboardCountData = [];
    this.spinner.show();
    this.apiService.setHttp('GET', 'zp-satara/Dashboard/GetDashboardCount?StateId='+(formData?.stateId || 0)+'&DistrictId='+(formData?.districtId || 0)+'&TalukaId=' + (formData?.talukaId || 0) + '&CenterId=' + (formData?.centerId || 0) +'&VillageId='+(formData?.VillageId || 0) + '&SchoolId=' + (formData?.schoolId || 0) + '&ExamTypeId=' + (formData?.examTypeId || 0) + '&EducationYearId=' + (val == 'sigleField' ? this.searchAcadamicYear.value || 0 : formData?.acYearId || 0), false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        this.spinner.hide();
        if (res.statusCode == "200") {
          this.dashboardCountData.push(res.responseData.responseData1[0]);
          this.totalStudentSurveyData = res.responseData.responseData2;
          this.totalStudentSurveyData.map((x: any) => {
            x.status = false;
            x.ischeckboxShow = true;
          });
          if (val == 'mapClick') {
            this.totalStudentSurveyData[this.selectedGroupIdindex].status = true;
          } else {
            this.totalStudentSurveyData[1].status = true;
          }
          this.totalStudentSurveyData[0].ischeckboxShow = false;
          setTimeout(() => {
            this.getPieChartData();
          }, 100)

        } else {
          this.dashboardCountData = [];
          this.totalStudentSurveyData = [];
        }
      },
      error: (error: any) => {
        this.spinner.hide();
        this.error.handelError(error.message)
      }
    });
  }
  // ----------------------------------Pie chart---------------------------------------------------------------//
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
  // ---------------------------------- bar chart by group / standard ----------------------------------------//
  getBarChartSubject() {
    this.BarChartSubjectArray = [...new Set(this.barChartData.map((x: any) => this.selectedLang == 'English' ? x.subjectName : x.m_SubjectName))];
    this.subjectforBar.patchValue(this.BarChartSubjectArray[0]);
    this.constructBarChart();
  }
  constructBarChart() {
    const filterData = this.barChartData.filter((x: any) => (this.selectedLang == 'English' ? x.subjectName : x.m_SubjectName) == this.subjectforBar.value)
    const barSubjectSet = [...new Set(filterData.map((x: any) => this.selectedLang == 'English' ? x.optionName : x.m_OptionName))];

    const testSet = [...new Set(filterData.map((sub: any) => sub.examTypeId))];
    let dataArray: any[] = [];
    testSet.map((t: any) => {
      const filterSub = filterData.filter((a: any) => a.examTypeId == t);
      const obj = {
        examTypeId:filterSub[0]?.examTypeId,
        name: filterSub[0]?.shortForm+'-'+filterSub[0]?.examType,
        data: filterSub.map((d: any) => d.totalPercentage), //this.barChartData.filter((x:any)=>(this.selectedLang == 'English' ? x.subjectName :x.m_SubjectName)==this.subjectforBar.value).map((z:any)=>z.totalPercentage),
        dataValue: filterSub.map((d: any) => d.actualStudent),//this.barChartData.filter((x:any)=>(this.selectedLang == 'English' ? x.subjectName :x.m_SubjectName)==this.subjectforBar.value).map((z:any)=>z.actualStudent),
        totalStudent: filterSub.map((d: any) => d.totalStudent)
      }
      dataArray.push(obj)
    })


    //let dataArray: any[] = [];

    // barSubjectSet.map((x:any)=>{

    //   const filterSub=this.barChartData.filter((a:any)=>a.optionName);
    //   filterSub

    //     const obj={
    //       name: x,
    //       data: filterSub.map((d:any)=>d.totalPercentage), //this.barChartData.filter((x:any)=>(this.selectedLang == 'English' ? x.subjectName :x.m_SubjectName)==this.subjectforBar.value).map((z:any)=>z.totalPercentage),
    //       dataValue:filterSub.map((d:any)=>d.actualStudent)//this.barChartData.filter((x:any)=>(this.selectedLang == 'English' ? x.subjectName :x.m_SubjectName)==this.subjectforBar.value).map((z:any)=>z.actualStudent),
    //     }
    //     dataArray.push(obj)

    // })

    //  let SeriesArray:any[]=[];
    //   SeriesArray.push(dataArray);
    this.createBarchart(dataArray, barSubjectSet, this.selectedLang == 'English' ? filterData[0]?.subjectName : filterData[0]?.m_SubjectName);
  }
  createBarchart(SeriesArray: any, barSubjectSet: any, sub: any) {
    this.selectedObj?.groupId == 1 ? this.barChaOptionHeight = 375 : this.barChaOptionHeight = 333;
    this.barchartOptions = {
      series: SeriesArray,
      chart: {
        height: this.barChaOptionHeight,
        type: "bar",
        toolbar: {
          show: false
        },
        events: {          
          click: (_event: any, _chartContext: any, config: any) => {
            if (config.seriesIndex >= 0) {
              this.optionalSubjectindex = config.seriesIndex;
              const data = (this.barChartData.filter((x: any) => ((this.selectedLang == 'English' ? x.optionName : x.m_OptionName) == this.barchartOptions.xaxis['categories'][config.dataPointIndex]) && sub == (this.selectedLang == 'English' ? x.subjectName : x.m_SubjectName ))).find((x: any) =>  this.barchartOptions?.series[config.seriesIndex]?.examTypeId ==x.examTypeId);
              this.selectedBarstatus = 'bar';
             this.passingParameters(data, data?.examTypeId)
            }
          }
        }
      },
      //colors: ["#fd7e14"],
      colors: ['#CB4B4B', '#E76A63', '#E98754', '#EFB45B', '#65C889', '#468C5F'],
      // colors: ['#fd7e14', '#fd9742', '#fda45a', '#febe89'],
      plotOptions: {
        bar: {
          // columnWidth: "45%", // on condition
          // barHeight: '50%',// on condition
          distributed: false,
          colors: {
            backgroundBarColors: ['#f2f2f2'],
          },
        }
      },
      dataLabels: {
        enabled: false,
        formatter: function (val: any) {
          return val + "%";
        },
        // offsetY: -20,
        style: {
          fontSize: "12px",//SeriesArray[0].data.length > 5 ?"9px ":"12px",
          colors: ["#fff"],


        }
      },
      legend: {
        show: true
      },
      grid: {
        show: false
      },
      xaxis: {
        axisTicks: {
          show: false
        },
        position: 'top',
        categories: barSubjectSet,
        // parameters: this.selectedLang == 'English' ? ['Level','Total Tested Student', 'Student(%)',] : ['स्तर','एकुण टेस्टेड विद्यार्थी', 'विद्यार्थी (%)'],

        parameters: this.selectedLang == 'English' ? ['Level', 'Total Tested Student', 'Total Pass Student', 'Student(%)',] : ['स्तर', 'एकुण टेस्टेड विद्यार्थी', 'एकूण पास विद्यार्थी', 'विद्यार्थी (%)'],
        labels: {
          rotate: -90,
          show: true,
          style: {
            colors: ["#000"],
            fontSize: '12px',
            fontFamily: 'Noto Sans Devanagari, sans-serif',
            // fontWeight: 600,
            cssClass: 'apexcharts-xaxis-label',
          },
        }
      },
      yaxis: {
        show: false,
        min: 0,
        max: 100
      },
      stroke: {
        colors: ["transparent"],
        width: 0
      },
      tooltip: {
        custom: function ({ series, seriesIndex, dataPointIndex, w }: any) {
          return (
            '<div class="arrow_box" style="padding:10px;">' +
            "<div>" + w.config.xaxis.categories[dataPointIndex] + " : <b> " + w.globals.seriesNames[seriesIndex] + '</b>' + "</div>" +
            "<div>" + w.config.xaxis.parameters[1] + " : <b> " + w.globals.initialSeries[seriesIndex].totalStudent[dataPointIndex] + '</b>' + "</div>" +
            "<div>" + w.config.xaxis.parameters[2] + " : <b> " + w.globals.initialSeries[seriesIndex].dataValue[dataPointIndex] + '</b>' + "</div>" +

            "<div>" + w.config.xaxis.parameters[3] + " : <b> " + series[seriesIndex][dataPointIndex] + '%</b>' + "</div>" +
            "</div>"
          );
        },
      }
    };

  }



  // --------- ----------------------- selected bar chart value for click event -----------------------------//
  selectedBar(selectedbar: any, selectedIndex?: any) {
    this.selectedbar = selectedbar;
    this.selectedBarIndex = selectedIndex;
  }
  // ---------------------------------- bar chart by taluka/ center -------------------------------------------//
  getbarChartByTaluka() {
    this.showBarChartS = false;
    const filterformData = this.filterForm.value;
    const formDatafilterbyTaluka = this.filterFormForBarGraph.value;
    this.spinner.show();
    this.selectedTalukaId = filterformData?.talukaId ? filterformData?.talukaId : formDatafilterbyTaluka?.filtertalukaId;
    const str = this.selectedTalukaId ? (this.selectedObj?.groupId == 1 ? 'GetDataFor1st2ndStdByCenter' : 'GetDataFor3rdAboveStdByCenter') : (this.selectedObj?.groupId == 1 ? 'GetDataFor1st2ndStdByTaluka' : 'GetDataFor3rdAboveStdByTaluka');
    this.apiService.setHttp('GET', 'zp-satara/Dashboard/' + str + '?TalukaId=' + (this.selectedTalukaId || 0) + (this.selectedTalukaId ? '&CenterId=' + (formDatafilterbyTaluka?.filtercenterId || 0) : '') + '&groupId=' + this.selectedObj?.groupId + '&SubjectId=' + (formDatafilterbyTaluka.filtersubjectId | 0), false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.barChartByTalukaData = res.responseData.responseData1;
          //this.constructStackBarChartByTaluka();
        }
        this.spinner.hide();
      },
      error: (error: any) => {
        this.spinner.hide();
        this.error.handelError(error.message)
      }
    });
    this.getTabledataByTaluka();
  }

  // constructStackBarChartByTaluka(){
  //   this.stackbarchartOptions1.series = [];
  //   this.stackbarchartOptions1.xaxis.categories = [];
  //   let talukaSet: any = [];
  //   let talukaSet_m: any = [];
  //   talukaSet = [...new Set(this.barChartByTalukaData.map(sub => this.selectedTalukaId ? sub.center : sub.taluka))];
  //   talukaSet_m = [...new Set(this.barChartByTalukaData.map(sub => this.selectedTalukaId ? sub.m_Center : sub.m_Taluka))];
  //   const subjectSet = [...new Set(this.barChartByTalukaData.map(sub => sub.optionName || sub.question))];
  //   const subjectSet_m = [...new Set(this.barChartByTalukaData.map(sub => sub.m_OptionName || sub.m_Question))];
  //   let arrayObjectData: any[] = [];
  //   subjectSet.map((x: any, index:any) => {
  //     const filterSubject = this.barChartByTalukaData.filter((y: any) => (y.optionName || y.question) == x);
  //     const subData = {
  //       name: this.selectedLang == 'English'? x:subjectSet_m[index],
  //       data: filterSubject.map(sub => sub.percentage)
  //     }
  //     arrayObjectData.push(subData);
  //   })

  //   this.stackbarchartOptions1.series.push(arrayObjectData);
  //   this.stackbarchartOptions1.xaxis.categories.push(...(this.selectedLang == 'English' ?talukaSet:talukaSet_m));
  //   this.stackbarchartOptions1.xaxis.parameters= this.selectedLang == 'English' ?['Level','Student(%)']:['स्तर','विद्यार्थी (%)']
  //   this.showBarChartS = true;
  //   this.stackbarchartOptions1.tooltip = {
  //     custom: function({ series, seriesIndex, dataPointIndex, w }: any) { 
  //       return (
  //         '<div class="arrow_box" style="padding:10px;">' +
  //           "<div>" + w.config.xaxis.parameters[0]+ " : <b> " + w.globals.seriesNames[seriesIndex]+ '</b>' + "</div>" +
  //           "<div>" + w.config.xaxis.parameters[1] + " : <b> " + series[seriesIndex][dataPointIndex] + '%</b>' + "</div>" +
  //         "</div>"
  //       );
  //     },
  //   }
  // };

  // ---------------------------------- api for table for school performance ------------------------------//


  getTabledataByTaluka() {
    const filterformData = this.filterForm.value;
    this.tableDataTopPerformance = [];
    const formDatafilterbyTaluka = this.filterFormForBarGraph.value;
    // const TalukaId = filterformData?.talukaId ? filterformData?.talukaId : formDatafilterbyTaluka?.filtertalukaId;

    let str = `StateId=${(filterformData?.stateId || 0)}&DistrictId=${(filterformData?.districtId || 0)}&TalukaId=${(filterformData?.talukaId || 0)}&CenterId=${(filterformData?.centerId || 0)}&VillageId=${(filterformData?.villageId || 0)}&StandardId=0&SubjectId=${(formDatafilterbyTaluka?.subjectId || 0)}&ExamTypeId=${(formDatafilterbyTaluka.examId || 0)}&EducationYearId=${this.searchAcadamicYear.value || 0}&EvaluatorId=${(this.evaluatorId.value || 0)}&lan=${this.selectedLang}`
    this.apiService.setHttp('GET', 'zp-satara/Dashboard/GetDataForTopLowSchool?' + str, false, false, false, 'baseUrl');
    // this.apiService.setHttp('GET', 'zp-satara/Dashboard/GetDataForTopLowSchool' + '?ExamTypeId=' + (formDatafilterbyTaluka.examId || 0) + '&TalukaId=' + (filterformData?.talukaId || 0) + ('&CenterId=' + (filterformData?.centerId || 0)+'&VillageId=' + (filterformData?.villageId || 0) + '&SetNo=' + (formDatafilterbyTaluka?.filterSetNumber || 0) + '&SubjectId=' + (formDatafilterbyTaluka?.subjectId || 0) + '&OptionId=' + (formDatafilterbyTaluka?.optionId || 0)), false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          // this.tableDataTopPerformance.push(res.responseData.responseData1);
          // this.tableDataTopPerformance.push(res.responseData.responseData2);

          this.tableDataTopPerformance = res.responseData.responseData1;
          this.tableDataLowPerformance = res.responseData.responseData2;

          // this.performanceTableLabel.patchValue(res.responseData.responseData1.length?this.tableHeadingArray[0]:this.tableHeadingArray[1])
          this.selectTable()
        }
        else {
          this.tableDataTopPerformance = [];
        }
      },
      error: (error: any) => { this.error.handelError(error.message) }
    });
  }

  selectTable() {
    this.dataSource = this.tableDataTopPerformance;
    this.displayedheaders = [{ label: '', m_label: '' }, { label: 'School Name', m_label: 'शाळेचे नाव' }, { label: 'Total Assessment', m_label: 'एकूण मूल्यांकन' }, { label: 'Percentage', m_label: 'टक्केवारी' }];
  }

  clearForm() {
    this.centerData = [];
    this.schoolData = [];
    this.villageData = [];
    this.filterForm.reset();
    this.f['acYearId'].patchValue(this.educationYear);
    this.f['stateId'].patchValue(1);
    this.f['districtId'].patchValue(1);
    this.f['talukaId'].patchValue(0);
  }
  //---------------------------------- svg Map ------------------------------------------------------------//
  showSvgMap(data: any) {
    this.graphInstance ? this.graphInstance.destroy() : '';
    //let createMap: any = document.getElementById("#mapsvg");

    this.graphInstance = $("#mapsvg").mapSvg({
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
  clickOnSvgMap(flag?: string) {
    // debugger
    if (flag == 'select') {      
      //this.enbTalDropFlag ? $('#mapsvg path').addClass('disabledAll'): '';
      let checkTalActiveClass = $('#mapsvg   path').hasClass("talActive");
      checkTalActiveClass ? $('#mapsvg path[id="' + this.globalTalId + '"]').removeAttr("style") : '';
      this.svgMapAddOrRemoveClass();
    }


    // ----------------------------- Map click event --------------------------------------------------------//
    $(document).on('click', '#mapsvg  path', (e: any) => {
      // debugger
      let getClickedId = e.currentTarget;
      let talId = $(getClickedId).attr('data-name').split(" ")[0];
      if (this.filterForm.controls['talukaId'].value != talId) {
        this.filterForm.controls['talukaId'].setValue(+talId);
        this.svgMapAddOrRemoveClass();
        this.initialApiCall('mapClick');
      }
    })
  }

  svgMapAddOrRemoveClass() {
    let checkTalActiveClass = $('#mapsvg   path').hasClass("talActive");
    checkTalActiveClass ? $('#mapsvg   path#' + this.globalTalId).removeClass("talActive") : '';
    this.talukaData.find(() => {
      this.globalTalId = this.filterForm?.value?.talukaId;
      $('#mapsvg path[id="' + this.filterForm?.value?.talukaId + '"]').addClass('talActive');
    });
  }


  // setAssessment() {
  //   this.initialApiCall('initial');
  //   this.asessmwntLavel.value == "1" ? (this.getSubjectDropForClass(), this.getRefstandardTableArrayCount(), this.getdashboardCount('initial')) : '';
  // }

  chnageClasswiseSubjectDrp() {
    // this.getRefstandardTableArrayCount();
    // this.getchartDataByCLass();
    this.checkDataByClass(this.selectedGroupIdindex, this.totalStudentSurveyDataByCLass[this.selectedGroupIdindex]);

  }

  getSubjectDropForClass() {
    this.subjectArrayByClass = [];
    this.masterService.getAllSubject(this.webStorage.languageFlag).subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.subjectArrayByClass = res.responseData;
          this.subjectforBarByCLass.patchValue(this.subjectArrayByClass[0].id);
        }
        else {
          this.subjectArrayByClass = [];
        }
      },
    });
  }

  getQuestion(){
    const formData = this.filterFormForBarGraph.value;
    this.questionArray = [];
    this.apiService.setHttp('GET', 'zp-satara/master/GetQuestionListByGroupSubject?GroupId='+(this.selectedObjByClass.groupId || 0)+'&AssessmentSubjectId='+(formData?.subjectId || 0)+'&flag_lang='+ this.selectedLang, false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next : (res: any)=>{
        if(res.statusCode == "200"){
          this.questionArray.push({ "questionId": 0, "question": "All", "m_Question": "सर्व" }, ...res.responseData);
          this.fBgraph['questionId'].setValue(0);
        }
        else{
          this.questionArray = [];
        }
      }
    })
  }
  
  getRefstandardTableArrayCount() { //total count and standard row 
    const formData = this.filterForm.value;

    this.spinner.show();
    this.apiService.setHttp('GET', 'zp-satara/Dashboard/GetDashboardCount?StateId='+(formData?.stateId || 0 )+'&DistrictId='+(formData?.districtId || 0)+'&TalukaId=' + (formData?.talukaId || 0) + '&CenterId=' + (formData?.centerId || 0) + '&VillageId=' +(formData?.villageId || 0) +'&SchoolId=' + (formData?.schoolId || 0) + '&SubjectId=' + (this.subjectforBarByCLass.value || 0) + '&ExamTypeId=' + (formData?.examTypeId || 0) + '&EducationYearId=' + (formData?.acYearId || this.searchAcadamicYear.value || 0), false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        this.spinner.hide();
        if (res.statusCode == "200") {
          this.totalStudentSurveyDataByCLass = res.responseData.responseData1;
          this.totalStudentSurveyDataByCLass.map((x: any) => {
            x.status = false;
            x.ischeckboxShow = true;
          }); // for standard row 
          this.totalStudentSurveyDataByCLass[0].ischeckboxShow = false; // for uncheck total radio btn
          // this.totalStudentSurveyDataByCLass[this.selectedGroupIdindex].status = true; // for check selected button 
          this.checkDataByClass(this.selectedGroupIdindex, this.totalStudentSurveyDataByCLass[this.selectedGroupIdindex]);
        }
        else {
          this.totalStudentSurveyDataByCLass = [];
        }
        this.spinner.hide();
      },
      error: (error: any) => {
        this.spinner.hide();
        this.error.handelError(error.message)
      }
    });

  }

  getstandardTableArrayCount(val: any) {
    const formData = this.filterForm.value;
    val == 'sigleField' ? this.filterForm.controls['acYearId'].setValue(this.searchAcadamicYear.value) : this.searchAcadamicYear.setValue(formData.acYearId);
    this.spinner.show();
    this.apiService.setHttp('GET', 'zp-satara/Dashboard/GetDashboardCount?StateId='+(formData?.stateId || 0)+'&DistrictId='+(formData?.districtId || 0)+'&TalukaId=' + (formData?.talukaId || 0) + '&CenterId=' + (formData?.centerId || 0) + '&VillageId=' +(formData?.villageId || 0) + '&SchoolId=' + (formData?.schoolId || 0) + '&SubjectId=' + (this.subjectforBarByCLass.value || 0) + '&ExamTypeId=' + (formData?.examTypeId || 0) + '&EducationYearId=' + (val == 'sigleField' ? this.searchAcadamicYear.value || 0 : formData?.acYearId || 0), false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        this.spinner.hide();
        if (res.statusCode == "200") {
          this.totalStudentSurveyDataByCLass = res.responseData.responseData2;
          // this.subjectArrayByClass = res.responseData.responseData2;
          // this.subjectforBarByCLass.patchValue(this.subjectArrayByClass[0].id);
          
          this.totalStudentSurveyDataByCLass.map((x: any) => {
            x.status = false;
            x.ischeckboxShow = true;
          })
          if (val == 'mapClick') {
            this.totalStudentSurveyDataByCLass[this.selectedGroupIdindex].status = true;
          } else {
            this.totalStudentSurveyDataByCLass[1].status = true;
          }
          this.totalStudentSurveyDataByCLass[0].ischeckboxShow = false;
          this.checkDataByClass(1, this.totalStudentSurveyDataByCLass[1]);
          
        } else {
          this.totalStudentSurveyDataByCLass = [];
        }
      },
      error: (error: any) => {
        this.spinner.hide();
        this.error.handelError(error.message)
      }
    });
  }

  checkDataByClass(index: number, obj: any) {
    this.selectedObjByClass = obj;    
    // this.totalStudentSurveyDataByCLass.map((x: any) => {
    //   x.status = false;
    // })
    this.selectedGroupIdindex = index;
    this.totalStudentSurveyDataByCLass[index].status = true;
    this.selectedSurveyData = this.selectedObjByClass?.assessmentCount + '/' + this.selectedObjByClass?.studentCount;
    // this.subjectforBarByCLass.value == 1 ? this.getchartDataByCLass() : '';
    setTimeout(() => {
      this.getchartDataByCLass();
    }, 1000);

  }

  getchartDataByCLass() {
    const formData = this.filterForm.value;
    this.barChartDataByClass = [];
    this.stackbarChartDataByClass = [];
    this.apiService.setHttp('GET', 'zp-satara/Dashboard/GetDashboardDataClassWise?StateId='+(formData?.stateId || 0)+'&DistrictId='+(formData?.districtId || 0)+'&TalukaId=' + (formData?.talukaId || 0) + '&CenterId=' + (formData?.centerId || 0) + '&VillageId=' +(formData?.villageId || 0) +  '&SchoolId=' + (formData?.schoolId || 0)+'&StandardId='+this.selectedObjByClass?.standardId+'&SubjectId=' + (this.subjectforBarByCLass?.value ) + '&ExamTypeId=' + (formData?.examTypeId || 0) + '&EducationYearId=' + (formData?.acYearId || 0) +'&EvaluatorId=' +this.evaluatorId.value, false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          res.responseData.responseData1.map((x: any) => {
            x.isOption == true ? this.stackbarChartDataByClass.push(x) : this.barChartDataByClass.push(x);
          });          
          this.isStackbarEmpty = this.stackbarChartDataByClass.every((item: any) => item.totalPercentage === 0);
          
          this.isBarChartEmty = this.barChartDataByClass.every((item: any) => item.totalPercentage === 0);
          this.constructStackBarChartByClass();
         this.constructBarChartByClass();

        }
      },
      error: (error: any) => { this.error.handelError(error.message) }
    });
  }

  // ----------------------------------------- stack bar chart by class ------------------------------------------------//

  constructStackBarChartByClass() {
    const questionSet = [...new Set(this.stackbarChartDataByClass.map((sub: any) => sub.question))];
    const m_QuestionSet = [...new Set(this.stackbarChartDataByClass.map((sub: any) => sub.m_Question))];
    this.graphSubjectDataByClass = this.selectedLang == 'English' ? questionSet : m_QuestionSet;
    let dataArray: any[] = [];
    questionSet.map((x: any, index: any) => {
      const filterSubject = this.stackbarChartDataByClass.filter((y: any) => y.question == x);
      let dataObjArray: any[] = [];
      filterSubject.reverse().map((z: any) => {
        const subData = {
          name: this.selectedLang == 'English' ? z.optionName : z.m_OptionName,
          data: ([z.totalPercentage]),
          dataValue: (z.totalStudent),
          subject: (this.selectedLang == 'English' ? questionSet[index] : m_QuestionSet[index]),
        }
        dataObjArray.push(subData);
      })
      dataArray.push(dataObjArray);
    })
    this.constructSatackChartByCLass(dataArray, this.selectedLang == 'English' ? questionSet : m_QuestionSet);

  }
  /// --- stack bar for class level 
  // constructSatackChartByCLass(seriesData: any, categoryData: any, sub:any, examIdSet: any) {
    constructSatackChartByCLass(seriesData: any, categoryData: any) {
      this.stackbarchartOptionsByClass = {
        series: [...seriesData],
        chart: {
          type: "bar",
          offsetX: -30,
          height: 350,
          width: 300,
          horizontal: false,
          borderRadius: 10,
          columnWidth: '45%',
          stacked: true,
          stackType: "100%",
          toolbar: {
            show: false,
            enabled: false,
          },
          events: {
            click: (_event: any, _chartContext: any, config: any) => {
              if (config.seriesIndex >= 0) {
                this.optionalSubjectindex = config.seriesIndex;
                const index = this.stackbarchartOptionsByClass.xaxis.categories.findIndex((i: any) => i == this.selectedbar);
                const data = this.stackbarChartDataByClass.find((x: any) =>
                  (this.selectedLang == 'English' ? x.question : x.m_Question) == this.selectedbar &&
                  (this.selectedLang == 'English' ? x.optionName : x.m_OptionName) == this.stackbarchartOptionsByClass.series[index][this.optionalSubjectindex]?.name);
                this.selectedBarstatus = 'stack';
                const examTypeId = 0;
                this.passingParameters(data, examTypeId)
              }
            }
          }
        },
        responsive: [
          {
            breakpoint: 480,
            options: {
              legend: {
                position: "bottom",
                colors: ['#B02F2F', '#E76A63', '#E98754', '#EFB45B', '#65C889'],
              }
            }
          }
        ],
        plotOptions: {
          bar: {
            rangeBarGroupRows: false,
            barHeight: '40%',
          }
        },
        xaxis: {
          axisTicks: {
            show: false
          },
          show: true,
          labels: {
            show: false,
          },
          categories: categoryData,
          parameters: this.selectedLang == 'English' ? ['Level', 'Total Student', 'Student(%)',] : ['स्तर', 'एकूण विद्यार्थी', 'विद्यार्थी (%)']
        },
  
        grid: {
          show: false,      // you can either change hear to disable all grids
  
        },
        yaxis: {
          show: false,
          showAlways: false,
          floating: false,
          axisTicks: {
            show: false
          },
          axisBorder: {
            show: false
          },
          labels: {
            show: false
          },
        },
        fill: {
          colors: ['#B02F2F', '#E76A63', '#E98754', '#EFB45B', '#65C889', '#b64343'],
        },
        legend: {
          offsetX: 17,
          showForSingleSeries: true,
          inverseOrder: true,
          position: 'right',
          fontSize: '12px',
          show: true,
          markers: {
            width: 12,
            height: 12,
            strokeWidth: 0,
            strokeColor: '#fff',
            fillColors: ['#B02F2F', '#E76A63', '#E98754', '#EFB45B', '#65C889', '#b64343'],
          }
        },
        dataLabels: {
          formatter: function (val: any,) {
            return val.toFixed(2) + ' %'
          }
        },
        tooltip: {
          custom: function ({ series, seriesIndex, dataPointIndex, w }: any) {
            return (
              '<div class="arrow_box" style="padding:10px;">' +
              "<div>" + w.globals.initialSeries[seriesIndex].subject + " : <b> " + w.globals.seriesNames[seriesIndex] + '</b>' + "</div>" +
              "<div>" + w.config.xaxis.parameters[1] + " : <b> " + w.globals.initialSeries[seriesIndex].dataValue + '</b>' + "</div>" +
              "<div>" + w.config.xaxis.parameters[2] + " : <b> " + series[seriesIndex][dataPointIndex] + '%</b>' + "</div>" +
              "</div>"
            );
          },
        }
      };
  
  }
  // -----------------------------------------  bar chart by class ------------------------------------------------//

  constructBarChartByClass() {
    // const filterData = this.barChartDataByClass.filter((x: any) => x.subjectId == this.subjectforBarByCLass.value);
    // const barSubjectSet = [...new Set(filterData.map((x: any) => this.selectedLang == 'English' ? x.optionName : x.m_OptionName))];
    // const testSet = [...new Set(filterData.map((sub: any) => sub.examTypeId))];
    // let dataArray: any[] = [];

  //  testSet.map((t: any)=>{
  //   const filterSub = filterData.filter((a: any)=>a.examTypeId == t);    
  //   const obj = {
  //     examTypeId:filterSub[0]?.examTypeId,
  //     name: filterSub[0]?.shortForm+'-'+filterSub[0]?.examType,
  //     data: filterSub.map((d: any) => d.totalPercentage), //this.barChartData.filter((x:any)=>(this.selectedLang == 'English' ? x.subjectName :x.m_SubjectName)==this.subjectforBar.value).map((z:any)=>z.totalPercentage),
  //     dataValue: filterSub.map((d: any) => d.actualStudent),//this.barChartData.filter((x:any)=>(this.selectedLang == 'English' ? x.subjectName :x.m_SubjectName)==this.subjectforBar.value).map((z:any)=>z.actualStudent),
  //     totalStudent: filterSub.map((d: any) => d.totalStudent)
  //   }
  //   dataArray.push(obj);
  //  })   
  this.subjectObjforClass = this.barChartDataByClass.find((x: any) => x.subjectId == this.subjectforBarByCLass.value);
  const obj = {
    name: this.webStorage.languageFlag == 'EN' ? this.subjectObjforClass?.question : this.subjectObjforClass?.m_Question,
    data: this.barChartDataByClass.map((z: any) => z.totalPercentage),
    dataValue: this.barChartDataByClass.map((z: any) => z.totalStudent),
  }
  const barSubjectSet = this.barChartDataByClass.map((x: any) => this.selectedLang == 'English' ? x.optionName : x.m_OptionName)
  let SeriesArray: any[] = [];
  SeriesArray.push(obj);
  // this.createBarchartByClass(SeriesArray,barSubjectSet, obj?.name  );
  this.createBarchartByClass(SeriesArray, barSubjectSet);

}
  createBarchartByClass(SeriesArray: any, barSubjectSet: any) {
    // createBarchartByClass(SeriesArray:any, barSubjectSet:any, sub:any){
      this.barChaOptionHeight = 350;
      const length = this.barChartDataByClass.length;
      let width = this.subjectforBarByCLass.getRawValue()==1?(length < 2 ? 200 : length < 3 ? 300 : 600) :1200 //length < 5 ? 600 : length < 8 ? 500 : 500
      this.barchartOptionsByClass = {
        series: SeriesArray,
        chart: {
          height: this.barChaOptionHeight,
          type: "bar",
          width: width,
          toolbar: {
            show: false
          },
          events: {
            click: (_event: any, _chartContext: any, config: any) => {
              if (config.seriesIndex >= 0) {
                this.optionalSubjectindex = config.seriesIndex;
                // const data = this.barChartDataByClass.find((x: any) => (this.selectedLang == 'English' ? x.optionName : x.m_OptionName == this.barchartOptionsByClass.xaxis['categories'][config.dataPointIndex]) && sub ==( this.selectedLang == 'English' ? x.subjectName : x.m_SubjectName) );
                const data = this.barChartDataByClass.find((x: any) => ((this.selectedLang == 'English' ? x.question : x.m_Question) === (this.barchartOptionsByClass.xaxis['categories'][config.dataPointIndex])));
                this.selectedBarstatus = 'bar';
                const examTypeId = 0;
                this.passingParameters(data, examTypeId)
              }
            }
          }
        },
        colors: ["#fd7e14"],
        plotOptions: {
          bar: {
            // columnWidth: "45%", // on condition
            // barHeight: '50%',// on condition
            distributed: false,
            horizontal: false,
            colors: {
              backgroundBarColors: ['#f2f2f2'],
            },
          }
        },
        dataLabels: {
          enabled: true,
          formatter: function (val: any) {
            return val + "%";
          },
          // offsetY: -20,
          style: {
            fontSize: "12px",
            colors: ["#fff"],
          }
        },
        legend: {
          show: false
        },
        grid: {
          show: false
        },
        xaxis: {
          axisTicks: {
            show: false
          },
          position: 'top',
          categories: barSubjectSet,
          parameters: this.selectedLang == 'English' ? ['Level', 'Total Student', 'Student(%)',] : ['स्तर', 'एकूण विद्यार्थी', 'विद्यार्थी (%)'],
          labels: {
            hideOverlappingLabels: true,
            rotate: -90,
            show: true,
            trim: true,
            style: {
              colors: ["#000"],
              fontSize: '12px',
              fontFamily: 'Noto Sans Devanagari, sans-serif',
              fontWeight: 'bold',
              // fontWeight: 600,
              cssClass: 'apexcharts-xaxis-label',
            },
          }
        },
        yaxis: {
          show: false,
          min: 0,
          max: 100
        },
        tooltip: {
          custom: function ({ series, seriesIndex, dataPointIndex, w }: any) {
            return (
              '<div class="arrow_box" style="padding:10px;">' +
              "<div>" + w.globals.seriesNames[seriesIndex] + " : <b> " + w.config.xaxis.categories[dataPointIndex] + '</b>' + "</div>" +
              "<div>" + w.config.xaxis.parameters[1] + " : <b> " + w.globals.initialSeries[seriesIndex].dataValue[dataPointIndex] + '</b>' + "</div>" +
              "<div>" + w.config.xaxis.parameters[2] + " : <b> " + series[seriesIndex][dataPointIndex] + '%</b>' + "</div>" +
              "</div>"
            );
          },
        }
      };
    }
  onStudentDetails(index: number, label: string) {
    if (this.asessmwntLavel.value == '1') {
      const formData = this.filterForm.value;
      const formValue = this.filterFormForBarGraph.value;
      this.SharingObject = {
        groupId: 0,
        TalukaId: label == 'topPerformance' ? this.tableDataTopPerformance[index].talukaId : this.tableDataLowPerformance[index].talukaId,
        CenterId: label == 'topPerformance' ? this.tableDataTopPerformance[index].centerId : this.tableDataLowPerformance[index].centerId,
        VillageId: label == 'topPerformance' ? this.tableDataTopPerformance[index].villageId : this.tableDataLowPerformance[index].villageId,
        SchoolId: label == 'topPerformance' ? this.tableDataTopPerformance[index].schoolId : this.tableDataLowPerformance[index].schoolId,
        SubjectId: formValue?.subjectId | 0,
        ExamTypeId: formValue?.examId | 0,
        EducationYearId: formData?.acYearId | 0,
        asessmwntLavel: this.asessmwntLavel.value,
        label: 'table',
        standardArray: [0],
        StandardId: 0,
        questionId: formValue?.questionId | 0,
        optionId: formValue?.optionId | 0,
      }
      // questionId

      this.webStorage.selectedBarchartObjData.next(this.SharingObject);
      localStorage.setItem('selectedBarchartObjData', JSON.stringify(this.SharingObject))
      this.router.navigate(['/dashboard-student-details']);
    }


  }

  // onchnageTableSub() {
  //   this.asessmwntLavel.value == "1" ? this.getSubjectDropForClass() : ''
  // }
  getOption() {
    this.optionNameArr = [];
    this.commonDataResArray.map((x: any) => {
      if (x.examTypeId) {
        let obj = {
          subjectId: x.subjectId,
          optionGrade: x.optionGrade,
          optionName: x.optionName
        }
        this.optionNameArr.push(obj);
      }
    });

    let subjectId = this.filterFormForBarGraph.value.subjectId;
    const optionArr: any = [];
    this.optionNameArr.map((data: any) => {
      if (subjectId == data.subjectId) {
        optionArr.push(data);

        let key = 'optionGrade';
        const arrayUniqueByKey = [...new Map(optionArr.map((item: any) =>
          [item[key], item])).values()];

        this.optionNameArr = [];
        this.optionNameArr = arrayUniqueByKey;
      }
    });
  }

  getOptionBySubjects() {
    let formValue = this.filterFormForBarGraph.value;
    this.optionNameArr = [];
    this.masterService.GetOptionListByGroupSubject(this.selectedObjByClass.groupId, (formValue?.subjectId || 0), (formValue?.questionId || 0), this.selectedLang).subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          // this.optionNameArr = res.responseData
          this.optionNameArr.push({ "optionId": 0, "optionName": "All", "m_OptionName": "सर्व" }, ...res.responseData);

        }
        else {
          this.optionNameArr = [];
        }
      },

    });

  }

  navigateToReport(){
    if(this.dashboardCountData[0]?.assessmentSchoolsCount){
    let filterObj = this.filterForm.value;
    let id:any = filterObj.acYearId+'.'+filterObj.centerId+'.'+filterObj.schoolId+'.'+filterObj.talukaId+'.'+filterObj.villageId;
    let formdata:any = this.encDec.encrypt(`${id}`);
     this.router.navigate(['/school-report'], {
       queryParams: { id: formdata },
     });
    }
  }

  clearDropLowHighFilter(flag: string) {
    switch (flag) {
      case 'subject':
        this.filterFormForBarGraph.controls['questionId'].setValue(0);
        this.filterFormForBarGraph.controls['optionId'].setValue(0);
        this.optionNameArr = [];
        break;
      case 'question':
        this.filterFormForBarGraph.controls['optionId'].setValue(0);
        break;
      default:
      // code block
    }

  }
}
