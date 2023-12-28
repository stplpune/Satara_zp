import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MasterService } from 'src/app/core/services/master.service';
import { ValidationService } from 'src/app/core/services/validation.service';
import { WebStorageService } from 'src/app/core/services/web-storage.service';

@Component({
  selector: 'app-officer-visit-report',
  templateUrl: './officer-visit-report.component.html',
  styleUrls: ['./officer-visit-report.component.scss']
})
export class OfficerVisitReportComponent {
  officerVisitReportForm!: FormGroup;
  languageFlag: any;
  loginData = this.webService.getLoggedInLocalstorageData();
  stateArr = new Array();
  districtArr = new Array();
  talukaArr = new Array();
  centerArr = new Array();
  villageArr = new Array();
  schoolArr = new Array();
  standardArr = new Array();
  examTypeArr = new Array();
  academicYearArr = new Array();
  maxDate = new Date();

  get f() { return this.officerVisitReportForm.controls }

  constructor(private masterService: MasterService,
    private fb: FormBuilder,
    private webService: WebStorageService,
    public validation: ValidationService){}

  ngOnInit(){
    this.webService.langNameOnChange.subscribe(lang => {
      this.languageFlag = lang;
      // this.getTableTranslatedData();
    });
    this.formField();
    this.getState();
    this.getExamType();
    this.getAcademicYears();
  }

  formField(){
    this.officerVisitReportForm = this.fb.group({
      stateId: [this.loginData ? this.loginData?.stateId : 0],
      districtId: [this.loginData ? this.loginData?.districtId : ''],
      talukaId: [this.loginData ? this.loginData?.talukaId : ''],
      centerId: [this.loginData ? this.loginData?.centerId : ''],
      villageId: [this.loginData ? this.loginData?.villageId : ''],
      schoolId: [this.loginData ? this.loginData?.schoolId : ''],
      standardId: [''],
      examTypeId: [''],
      educationYearId: [this.loginData ? this.loginData?.educationYearId : ''],
      fromDate: [''],
      toDate: [''],
      textSearch: ['']
    })
  }

  //#region ------------------------------------------- Filter dropdown dependencies start here --------------------------------------------
  getState(){
    this.stateArr = [];
    this.masterService.getAllState('').subscribe({
      next: (res: any) => {
        if(res.statusCode == "200"){
          this.stateArr.push({"id": 0, "state": "All", "m_State": "सर्व"}, ...res.responseData);
          this.loginData ? (this.f['stateId'].setValue(this.loginData.stateId), this.getDistrict()) : this.f['stateId'].setValue(0);
        }else{
          this.stateArr = [];
        }
      }
    });
  }

  getDistrict(){
    this.districtArr = [];
    let stateId: any = this.officerVisitReportForm.value.stateId;
    if(stateId > 0){
      this.masterService.getAllDistrict('', stateId).subscribe({
        next: (res: any) => {
          if (res.statusCode == "200") {
            this.districtArr.push({"id": 0, "district": "All", "m_District": "सर्व"}, ...res.responseData);
            this.loginData ? (this.f['districtId'].setValue(this.loginData.districtId), this.getTaluka()) : this.f['districtId'].setValue(0);
          }else {
            this.districtArr = [];
          }
        },
      });
    }else{
      this.districtArr = [];
    }
  }

  getTaluka(){
    this.talukaArr = [];
    let districtId: any = this.officerVisitReportForm.value.districtId;
    if(districtId > 0){
      this.masterService.getAllTaluka('', districtId).subscribe({
        next: (res: any) => {
          if (res.statusCode == "200") {
            this.talukaArr.push({ "id": 0, "taluka": "All", "m_Taluka": "सर्व" }, ...res.responseData);
            this.loginData ? (this.f['talukaId'].setValue(this.loginData?.talukaId), this.getAllCenter()): this.f['talukaId'].setValue(0);
          } else {
            this.talukaArr = [];
          }
        },
      });
    }else{
      this.talukaArr = [];
    }
  }

  getAllCenter() {
    this.centerArr = [];
    let talukaid = this.officerVisitReportForm.value.talukaId;
    if (talukaid > 0) {
      this.masterService.getAllCenter('', talukaid).subscribe({
        next: (res: any) => {
          if (res.statusCode == "200") {
            this.centerArr.push({ "id": 0, "center": "All", "m_Center": "सर्व" }, ...res.responseData);           
            this.loginData ? (this.f['centerId'].setValue(this.loginData?.centerId), this.getVillageDrop()): this.f['centerId'].setValue(0);
          } else {
            this.centerArr = [];
          }
        },
      });
    }else{
      this.centerArr = [];
    }
  }

  getVillageDrop(){
    this.villageArr = [];
    let centerId = this.officerVisitReportForm.value.centerId;
    if (centerId > 0) {
      this.masterService.getAllVillage('', centerId).subscribe({
        next: (res: any) => {
          if (res.statusCode == "200") {
            this.villageArr.push({ "id": 0, "village": "All", "m_Village": "सर्व" }, ...res.responseData);
            this.loginData ? (this.f['villageId'].setValue(this.loginData?.villageId), this.getAllSchoolsByCenterId()): this.f['villageId'].setValue(0);
          } else {
            this.villageArr = [];
          }
        },
      });
    }else{
      this.villageArr = [];
    }
  }

  getAllSchoolsByCenterId() {
    this.schoolArr = [];
    let talukaId = this.officerVisitReportForm.value.talukaId;
    let centerId = this.officerVisitReportForm.value.centerId;
    let villageId = this.officerVisitReportForm.value.villageId;
    if(talukaId > 0 && villageId > 0 && centerId > 0){
      this.masterService.getAllSchoolByCriteria('', talukaId, villageId, centerId).subscribe({
        next: (res: any) => {
          if (res.statusCode == "200") {
            this.schoolArr.push({ "id": 0, "schoolName": "All", "m_SchoolName": "सर्व" }, ...res.responseData);
            this.loginData ? (this.f['schoolId'].setValue(this.loginData?.schoolId)): this.f['schoolId'].setValue(0);
          } else {
            this.schoolArr = [];
          }
        },
      });
    }else{
      this.schoolArr = [];
    }
  }

  getStandard() {
    this.standardArr = [];
    let schoolId = this.officerVisitReportForm.value.schoolId;
    if(schoolId > 0){
      this.masterService.GetStandardBySchool(schoolId, '').subscribe({
        next: (res: any) => {
          if (res.statusCode == "200") {
            this.standardArr.push({ "id": 0, "standard": "All", "m_Standard": "सर्व" }, ...res.responseData);
            this.f['standardId'].setValue(0);
          } else {
            this.standardArr = [];
          }
        },
      });
    }else{
      this.standardArr = [];
    }
  }

  getExamType() {
    this.examTypeArr = [];
    this.masterService.getExamType('').subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.examTypeArr.push({ "id": 0, "examType": "All", "m_ExamType": "सर्व" }, ...res.responseData);
          this.f['examTypeId'].setValue(0);
        } else {
          this.examTypeArr = [];
        }
      },
    });
  }

  getAcademicYears(){
    this.academicYearArr = [];
    this.masterService.getAcademicYears('').subscribe({
      next: (res: any) => {
        if(res.statusCode == "200"){
          this.academicYearArr.push({ "id": 0, "eductionYear": "All", "eductionYear_M" : "सर्व" }, ...res.responseData);
          this.f['educationYearId'].setValue(0);
        }
      }
    })
  }
  //#endregion ------------------------------------------- Filter dropdown dependencies end here --------------------------------------------

  onClear(){
    this.formField();
    // this.getTableData();
  }



}
