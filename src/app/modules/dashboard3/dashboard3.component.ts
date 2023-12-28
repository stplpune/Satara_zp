import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexPlotOptions, ApexStroke, ApexTooltip, ApexXAxis, ApexYAxis } from 'ng-apexcharts';
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
  selector: 'app-dashboard3',
  templateUrl: './dashboard3.component.html',
  styleUrls: ['./dashboard3.component.scss']
})
export class Dashboard3Component {
  selectedLang: any;
  graphLevelArr = new Array();
  levelId = new FormControl();
  mainFilterForm!: FormGroup;
  academicYear = new FormControl('');
  stateData= new Array();
  districtData = new Array();
  talukaData = new Array();
  centerData = new Array();
  villageData = new Array();
  schoolData = new Array();
  acYear = new Array();
  districtLabel: any;
  talukaLabel: any;
  centerName : any;
  villageName : any;
  examTypeData = new Array();
  get f() { return this.mainFilterForm.controls }

  constructor(private masterService: MasterService,
              public webStorage: WebStorageService,
              private fb: FormBuilder){}

  ngOnInit(){
    this.allmainDropdownApi();
    this.mainFillterDefaultFormat();
    this.webStorage.langNameOnChange.subscribe((lang) => {
      this.selectedLang = lang;
    });   

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

  allmainDropdownApi() {
    this.getYearArray();
    this.getState();
    this.getAllGraphLevel();
    this.getExamType();
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
      this.f['acYearId'].patchValue(this.webStorage.getYearId());
      this.academicYear.patchValue(this.webStorage.getYearId())

    })
  }




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

  onMainFilterSubmit(flag?: any) {
    if (flag == "year") {
      let yearValue = this.academicYear.value;
      this.f['acYearId'].setValue(yearValue);
    }
    this.getdashboardCount();
    this.getCenterwiseBarDetails();

  }

  getCenterwiseBarDetails(){

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

  resetMainFilter(){
    
  }


}
