import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { MasterService } from 'src/app/core/services/master.service';
import { ValidationService } from 'src/app/core/services/validation.service';
import { WebStorageService } from 'src/app/core/services/web-storage.service';

@Component({
  selector: 'app-add-update-office-users',
  templateUrl: './add-update-office-users.component.html',
  styleUrls: ['./add-update-office-users.component.scss']
})
export class AddUpdateOfficeUsersComponent implements OnInit {
  levels = new Array();
  designations = new Array();
  officeForm!: FormGroup;
  stateArr = new Array();
  districts = new Array();
  talukas = new Array();
  villageArr = new Array();
  centers = new Array();
  schools = new Array();
  others = new Array();
  bits = new Array();
  genderArray = new Array();
  submitted : boolean = false;
  currentDate = new Date();
  errorMsg : any;
  kendraErrorMsg :any
  officeCenterSchoolModelArr = new Array();
  loginData = this.webStorageService.getLoggedInLocalstorageData();

  constructor(private masterService: MasterService,
    private fb: FormBuilder,
    private apiService: ApiService,
    private commonService: CommonMethodsService,
    private error: ErrorsService,
    private dialogRef: MatDialogRef<AddUpdateOfficeUsersComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public validation: ValidationService,
    public webStorageService: WebStorageService,
    private datePipe: DatePipe,
    private ngxSpinner: NgxSpinnerService) { }

  ngOnInit() {
    this.defaultForm();
    this.getStateDrop();
    this.getGender();
    (!this.data) ? (this.getLevelDrop()) : '';  
  }

  defaultForm() {
    this.officeForm = this.fb.group(
      {

        ...this.webStorageService.createdByProps(),
        "id": [this.data ? this.data.id : 0],
        "name": [this.data ? this.data.officeName : "", [Validators.required, Validators.pattern('^([ a-zA-Z])[ a-zA-Z]+$')]],
        "m_Name": [this.data ? this.data.m_OfficeName : "", [Validators.required,Validators.pattern('^[\u0900-\u0965 ]+$')]],
        "mobileNo": [this.data ? this.data.mobileNo : "", [Validators.required, Validators.pattern(this.validation.mobile_No)]],
        "emailId": [this.data ? this.data.emailId : "", [Validators.pattern(this.validation.email)]],
        "address": [this.data ? this.data.address : "",],
        "schoolId": [this.data ? this.data.schoolId : null],
        "designationId": [this.data ? this.data.designationId : null, [Validators.required]],
        "designationLevelId": [this.data ? this.data.designationLevelId : null,[Validators.required]],
        "stateId": [this.data ? this.data.stateId : '', [Validators.required]],
        "districtId": [this.data ? this.data.districtId : '' , Validators.required ],
        "talukaId": [this.data ? this.data.talukaId : null, Validators.required ],
        "villageId": [this.data ? this.data.talukaId : 0 ],
        "userTypeId": [this.webStorageService.getUserTypeId()],
        "subUserTypeId": [this.data ? 0 : 0],
        // "kendraMobileNo": [this.data ? this.data.kendraMobileNo : "", [Validators.pattern('[0-9]\\d{9,10}')]],
        "kendraMobileNo": [this.data ? this.data.kendraMobileNo : "",],

        "kendraEmailId": [this.data ? this.data.kendraEmailId : "", [Validators.pattern(this.validation.email)]],
        "beoEmailId": [this.data ? this.data.beoEmailId : "", [Validators.pattern(this.validation.email)]],
        "beoMobileNo": [this.data ? this.data.beoMobileNo : "",],
        "centerId": [this.data ? this.data.centerId : null],
        "bitId": [this.data ? this.data.bitId : 0],
        "lan": [this.webStorageService.languageFlag],
        "agencyId": [this.data ? this.data.agencyId : null],
        "isBlock" : [true],
        "userId": [this.data ? this.data.userId : 0], 
        "genderId": [this.data ? this.data.genderId : '', [Validators.required]],
        "dob": [this.data ? new Date(this.data.dob) : '',  [Validators.required]],
        "officeCenterSchoolModel":[]
      })
    this.data ? (this.data, this.getLevelDrop(), this.getGender(), this.getStateDrop(),this.getDistrictDrop(), this.getTalukaDrop(), this.getDesignationByLevelId(),this.onEdit(), this.getVillage(),this.getAgencyDrop(), this.getBitDrop()) : ''
  }

  get fc() { return this.officeForm.controls }

  getGender(){
    this.masterService.getAllGender('').subscribe({
      next: (res: any) => {
        res.statusCode == "200" ? this.genderArray = res.responseData : this.genderArray = [];
      }
    })
  }
  
  getLevelDrop() {
    this.masterService.GetDesignationLevel(this.webStorageService.languageFlag).subscribe({
      next: (resp: any) => {
        resp.statusCode == "200" ? this.levels = resp.responseData : this.levels = [];     
      },
      error: (error: any) => {
        { this.error.handelError(error) }
      }
    });
  }

  onchangeLevel() {
    // this.getDistrictDrop();
    // this.getDesignationByLevelId();
    this.officeForm.value.designationLevelId == 7 ? this.getAgencyDrop(): '';
  }

  getDesignationByLevelId() {   
    let levelId = this.officeForm.value.designationLevelId;
    this.masterService.GetDesignationByLevelId(this.webStorageService.languageFlag, levelId).subscribe({
      next: (resp: any) => {
        resp.statusCode == "200" ? (this.designations = resp.responseData) : this.designations = [];
      },
      // error: (error: any) => {
      //   { this.error.handelError(error) };
      // }
    })
  }

  // getAllSchoolsByCenterTalukaId() {
  //   if(this.officeForm.value.designationLevelId == 3 && this.officeForm.value.designationId == 18){
  //   let centerId = this.officeForm.value.centerId ? this.officeForm.value.centerId : 0;
  //   let talukaId = this.officeForm.value.talukaId;
  //   this.masterService.getAllSchoolsByCenterId(this.webStorageService.languageFlag, centerId, talukaId ).subscribe({
  //     next: (resp: any) => {
  //       resp.statusCode == "200" ? (this.schools = resp.responseData) : this.schools = [];
  //     },
  //     error: (error: any) => {
  //       { this.error.handelError(error) };
  //     }
  //   });
  // }
  // }

  getStateDrop(){
    this.stateArr = [];
    this.masterService.getAllState('').subscribe({
      next: (res: any) => {
        if(res.statusCode == "200"){
          this.stateArr = res.responseData;
          // this.loginData ? (this.fc['stateId'].setValue(this.loginData.stateId), this.getDistrictDrop()) : this.fc['stateId'].setValue(0);
          // this.editFlag ? (this.fc['stateId'].setValue(this.editObj.stateId), this.getDistrictDrop()) : '';
        }
        else{
          this.stateArr = [];
        }
      }
    });
  }

  getDistrictDrop() {
    let stateId = this.officeForm.value.stateId;
    this.districts = [];
    if(stateId > 0){
      this.masterService.getAllDistrict(this.webStorageService.languageFlag, stateId).subscribe({
        next: (resp: any) => {
          resp.statusCode == "200" ? this.districts = resp.responseData : this.districts = [];
          // this.loginData ? (this.fc['districtId'].setValue(this.loginData.districtId), this.getTalukaDrop()) : this.fc['districtId'].setValue(0);
        },
        error: (error: any) => {
          { this.error.handelError(error) };
        }
      });
    }
    else{
      this.districts = [];
    }
  }

  getTalukaDrop() {
    let districtId = this.officeForm.value.districtId;
    this.talukas = [];
    if(districtId > 0){
      this.masterService.getAllTaluka(this.webStorageService.languageFlag, districtId).subscribe({
        next: (resp: any) => {
          resp.statusCode == "200" ? (this.talukas = resp.responseData) : this.talukas = [];
          // this.loginData ? (this.fc['talukaId'].setValue(this.loginData.talukaId), this.getVillage()) : this.fc['talukaId'].setValue(0);
        },
        error: (error: any) => {
          { this.error.handelError(error) };
        }
      });
    }
    else{
      this.talukas = [];
    }
  }

  getVillage(){
    let tId = this.officeForm.value.talukaId;
    this.villageArr = [];
    if(tId > 0){
      this.masterService.getAllVillageByTaluka('', tId).subscribe({
        next: (res: any) => {
          if (res.statusCode == 200) {
            this.villageArr = res.responseData;
            // this.loginData ? this.fc['villageId'].setValue(this.loginData.villageId) : this.fc['villageId'].setValue(0);
            this.data ? (this.officeForm.controls['villageId'].setValue(this.data.villageId)) :'';
          } else {
            this.commonService.checkEmptyData(res.statusMessage) == false ? this.error.handelError(res.statusCode) : this.commonService.showPopup(res.statusMessage, 1);
            this.villageArr = [];
          }
        },
        // error: ((err: any) => { this.errors.handelError(err.statusCode) })
      });
    }
    else{
      this.villageArr = [];
    }
  }


  onchangeTaluka(){
    this.getBitDrop();
    this.getDesignationByLevelId();
    this.getVillage();
  }

  getBitDrop(){
    this.masterService.GetBit(this.webStorageService.languageFlag, this.officeForm.value.talukaId).subscribe({
      next: (res: any)=>{
        this.bits = res.responseData
      },
      error: (err: any)=> {
        { this.error.handelError(err) };        
      }
    })
  }

  // getCenterDrop() {
  //   if(this.officeForm.value.talukaId && this.officeForm.value.designationLevelId == 3 && this.officeForm.value.designationId == 18){
  //     this.masterService.getAllCenter(this.webStorageService.languageFlag, this.officeForm.value.talukaId).subscribe({
  //       next: (resp: any) => {
  //         resp.statusCode == "200" ? (this.centers = resp.responseData) : this.centers = [];
  //         this.data ? (this.fc['centerId'].setValue(this.data.centerId)) : this.fc['centerId'].setValue(null);
  //       },
  //       error: (error: any) => {
  //         { this.error.handelError(error) };
  //       }
  //     })
  //   }
  // }

  getCenterDrop(data?:any) {
    console.log("data:", data);
    
    if(this.officeForm.value.talukaId && this.officeForm.value.designationLevelId == 8 && this.officeForm.value.designationId == 18){     
      this.apiService.setHttp('GET', 'zp-satara/master/GetAllCenterSchoolByTalukaId?flag_lang='+this.webStorageService.languageFlag+'&TalukaId='+this.officeForm.value.talukaId, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (resp: any) => { 
          resp.statusCode == "200" ? (this.centers = resp.responseData) : this.centers = [];
          this.data ? (this.fc['centerId'].setValue(data)) : this.fc['centerId'].setValue(null);
         },
        error: (e: any) => { this.error.handelError(e) }
      });

    }
  }

  getAgencyDrop(){
    this.masterService.GetAllAgencyRegistration(this.webStorageService.languageFlag).subscribe({
      next: (resp: any)=>{
        resp.statusCode == "200" ? (this.others = resp.responseData) : this.others = [];
      },
      error: (error: any) => {
        { this.error.handelError(error) };
      }
    });
  }

  onEdit(){
    if(this.officeForm.value.designationId == 18){
      let getcenter = this.data?.officeCenterSchoolResponseModel;   
      let arr = new Array;
      if(getcenter?.length){
        for(let i =0; i< getcenter.length;i++){
          let obj ={
            id: getcenter[i].id,
            officerId: getcenter[i].officerId,
            centerId: getcenter[i].centerId,
            centerSchoolId: getcenter[i].centerSchoolId,
            userId: this.webStorageService.getUserId(),
            isDeletedFlag: false    
             }
             arr.push(obj)
        }
        this.getCenterDrop(arr);
      }
     
    }
  }

  submitOfficeData() {
    this.submitted = true;
    let formData = this.officeForm.value;
    formData.dob = this.datePipe.transform(formData.dob, 'yyyy-MM-dd' + 'T' + 'HH:mm:ss.ms');
    
    // return;
    let kendramobLength = this.officeForm.value.kendraMobileNo.length;
    let mobileLength = this.officeForm.value.mobileNo.length;

    if (this.officeForm.value.designationId == 18 && (kendramobLength > 0) && (mobileLength > 0) && (this.officeForm.value.kendraMobileNo == this.officeForm.value.mobileNo)) {
      this.commonService.showPopup(this.webStorageService.languageFlag == 'EN' ? 'Contact No.(Kendra) and Mobile No. Can Not Be Same' : 'संपर्क क्रमांक (केंद्र) आणि संपर्क क्रमांक एकच असू शकत नाही', 1);
      return
    }
    if (this.officeForm.value.designationId == 18 && (this.officeForm.value.emailId.length > 0) && (this.officeForm.value.kendraEmailId.length > 0) && (this.officeForm.value.kendraEmailId == this.officeForm.value.emailId)) {
      this.commonService.showPopup(this.webStorageService.languageFlag == 'EN' ? 'EmailId (Kendra) and EmailId Can Not Be Same' : 'ई - मेल आयडी (केंद्र) आणि ई - मेल आयडी  एकच असू शकत नाही', 1);
      return
    }
    if (this.officeForm.value.designationId == 11 && (this.officeForm.value.beoMobileNo.length > 0) &&(this.officeForm.value.mobileNo.length > 0) && (this.officeForm.value.beoMobileNo.length  == this.officeForm.value.mobileNo)) {
      this.commonService.showPopup(this.webStorageService.languageFlag == 'EN' ? 'Contact No.(BEO Office) and Mobile No. Can Not Be Same' : 'संपर्क क्रमांक (BEO कार्यालय) आणि संपर्क क्रमांक एकच असू शकत नाही', 1);
      return
    }
    if (this.officeForm.value.designationId == 11 && (this.officeForm.value.emailId.length > 0)  && (this.officeForm.value.beoEmailId.length > 0 ) && (this.officeForm.value.beoEmailId == this.officeForm.value.emailId)) {
      this.commonService.showPopup(this.webStorageService.languageFlag == 'EN' ? 'EmailId(BEO Office) and Email Can Not Be Same' : 'ई - मेल आयडी (BEO कार्यालय) आणि ई - मेल आयडी एकच असू शकत नाही', 1);
      return
    }

    if (this.officeForm.valid) {
      if (this.officeForm.value.designationId == 18) {
        let arrr = this.officeForm.value.centerId;
        
       this.officeCenterSchoolModelArr=[];
        for (let i = 0; i < arrr.length; i++) {
          const filterData= this.data?.officeCenterSchoolResponseModel?.length > 0? (this.data?.officeCenterSchoolResponseModel.find((x:any)=> x.centerId==arrr[i]?.centerId)):'';
          let obj = {
            id: filterData?filterData?.id :0 ,
            officerId: 0,
            centerId: arrr[i].centerId,
            centerSchoolId: arrr[i].centerSchoolId,
            userId: this.webStorageService.getUserId(),
            isDeletedFlag: false
          }
          this.officeCenterSchoolModelArr.push(obj)
        }
        this.officeForm.value.officeCenterSchoolModel = this.officeCenterSchoolModelArr
        formData.centerId = arrr[0].centerId;

      } else {
        this.officeForm.value.officeCenterSchoolModel = []
        formData.centerId = 0;
      }
      this.ngxSpinner.show();
      let submitUrl = this.data ? 'UpdateOffice' : 'AddOffice'
      this.ngxSpinner.hide()
      this.apiService.setHttp(this.data ? 'PUT' : 'POST', this.data ? 'zp-satara/Office/UpdateOffice' : 'zp-satara/Office/AddOffice', false, this.officeForm.value, false, 'baseUrl');
      this.apiService.setHttp(this.data ? 'PUT' : 'POST', 'zp-satara/Office/' + submitUrl, false, formData, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => {
          this.apiService.staticData.next('getRefreshStaticdata');
          res.statusCode == "200" ? (this.commonService.showPopup(res.statusMessage, 0)) : this.commonService.checkEmptyData(res.statusMessage) == false ? this.error.handelError(res.statusCode) : this.commonService.showPopup(res.statusMessage, 1);
          res.statusCode == "200" ? this.dialogRef.close('Yes') : this.ngxSpinner.hide();
        },
        error: ((error: any) => {
          this.error.handelError(error.status);
          this.commonService.checkEmptyData(error.status) == false ? this.error.handelError(error.status) : this.commonService.showPopup(error.status, 1);
        })
      });
    }
    if (this.officeForm.invalid) {
      this.commonService.showPopup(this.webStorageService.languageFlag == 'EN' ? 'Please Enter Mandatory Fields' : 'कृपया अनिवार्य फील्ड प्रविष्ट करा', 1);
      return
    }
  }

  // validShilpa
  onchangeValidation(event: any, label: string) {
    if ((event.value == 1 || event.value == 2) && label == 'Level') { //2- District
      this.fc['stateId'].setValidators(Validators.required);
      this.fc['stateId'].updateValueAndValidity();

      this.fc['districtId'].setValidators(Validators.required);
      this.fc['districtId'].updateValueAndValidity();

      this.fc['talukaId'].setValidators(Validators.required);
      this.fc['talukaId'].updateValueAndValidity();

      this.fc['designationId'].setValidators(Validators.required);
      this.fc['designationId'].updateValueAndValidity();

      this.fc['address'].clearValidators();
      this.fc['address'].updateValueAndValidity();

      // this.fc['bitId'].clearValidators();
      // this.fc['bitId'].updateValueAndValidity();

      this.fc['agencyId'].clearValidators();
      this.fc['agencyId'].updateValueAndValidity();
      this.fc['villageId'].clearValidators();
      this.fc['villageId'].updateValueAndValidity();

    }
   else if (event.value == 5 && label == 'Level') { //village level 
    this.fc['stateId'].setValidators(Validators.required);
    this.fc['stateId'].updateValueAndValidity();

    this.fc['districtId'].setValidators(Validators.required);
    this.fc['districtId'].updateValueAndValidity();

      this.fc['talukaId'].setValidators(Validators.required);
      this.fc['talukaId'].updateValueAndValidity();
      this.fc['villageId'].setValidators(Validators.required);
      this.fc['villageId'].updateValueAndValidity();

      this.fc['designationId'].setValidators(Validators.required);
      this.fc['designationId'].updateValueAndValidity();
      // clear
      this.fc['address'].clearValidators();
      this.fc['address'].updateValueAndValidity();

      this.fc['agencyId'].clearValidators();
      this.fc['agencyId'].updateValueAndValidity();
    }
    else if (event.value == 7 && label == 'Level') { //other user
      this.fc['address'].setValidators([Validators.required, Validators.maxLength(500)]);
      this.fc['agencyId'].setValidators([Validators.required]);
      this.fc['address'].updateValueAndValidity();
      this.fc['agencyId'].updateValueAndValidity();
      // this.fc['bitId'].clearValidators();
      // this.fc['bitId'].updateValueAndValidity();
      this.fc['villageId'].clearValidators();
      this.fc['villageId'].updateValueAndValidity();
      this.fc['stateId'].clearValidators();
      this.fc['stateId'].updateValueAndValidity();
      this.fc['districtId'].clearValidators();
      this.fc['districtId'].updateValueAndValidity();


    }
    else if (event.value == 11 && label == 'Designation') { //BEO
      this.fc['beoMobileNo'].setValidators([Validators.required]);
      this.fc['beoMobileNo'].updateValueAndValidity();
      this.fc['beoEmailId'].setValidators([Validators.required, Validators.pattern(this.validation.email)]);
      this.fc['beoEmailId'].updateValueAndValidity();
      // this.fc['bitId'].clearValidators();
      // this.fc['bitId'].updateValueAndValidity();

      this.fc['agencyId'].clearValidators();
      this.fc['agencyId'].updateValueAndValidity();
      this.fc['villageId'].clearValidators();
      this.fc['villageId'].updateValueAndValidity();

    }
    else if (event.value == 18 && label == 'Designation') { // cluterHead
      this.fc['centerId'].setValidators([Validators.required]);
      this.fc['centerId'].updateValueAndValidity();

      // this.fc['schoolId'].setValidators([Validators.required]);
      // this.fc['schoolId'].updateValueAndValidity();
      
      // this.fc['bitId'].clearValidators();
      // this.fc['bitId'].updateValueAndValidity();

      // clear
      this.fc['beoMobileNo'].clearValidators();
      this.fc['beoMobileNo'].updateValueAndValidity();
      this.fc['beoEmailId'].clearValidators();
      this.fc['beoEmailId'].updateValueAndValidity();

      this.fc['agencyId'].clearValidators();
      this.fc['agencyId'].updateValueAndValidity();
      this.fc['villageId'].clearValidators();
      this.fc['villageId'].updateValueAndValidity();

    }
    else if(event.value == 10 && label == 'Designation'){ //extension officer
      this.fc['bitId'].setValidators(Validators.required);
      this.fc['bitId'].updateValueAndValidity();
    }

    else if (event.value != 18 && label == 'Designation') { // Except Cluster Head
      // clear
      console.log("Except Cluster Head");
      
      this.fc['beoMobileNo'].clearValidators();
      this.fc['beoMobileNo'].updateValueAndValidity();
      this.fc['beoEmailId'].clearValidators();
      this.fc['beoEmailId'].updateValueAndValidity();
      this.fc['address'].clearValidators();
      this.fc['address'].updateValueAndValidity();
      this.fc['agencyId'].clearValidators();
      this.fc['agencyId'].updateValueAndValidity();
      this.fc['bitId'].clearValidators();
      this.fc['bitId'].updateValueAndValidity();
      this.fc['villageId'].clearValidators();
      this.fc['villageId'].updateValueAndValidity();
    }

  }

  // clearShilpa
    clearDropDown(label: string) {
      let forValue = this.officeForm.value;
    if (label == 'Level') {    
      this.districts = [];  
      this.talukas=[];
      this.villageArr = [];  
      (forValue.designationLevelId == 7)  ? this.fc['agencyId'].setValue(null) : this.fc['agencyId'].setValue(0) ;
      (forValue.designationLevelId == 6 || this.officeForm.value.designationLevelId == 7) ?this.fc['talukaId'].setValue(0) : this.fc['talukaId'].setValue(null);
      ( forValue.designationLevelId == 7) ? this.fc['designationId'].setValue(31) : (this.fc['designationId'].setValue(null), this.designations = []);
      (forValue.designationLevelId != 7)  ? this.fc['address'].setValue('') : this.fc['address'].setValue(forValue.address) ;
      (forValue.designationId != 3 ) ? (this.fc['centerId'].setValue(null), this.fc['schoolId'].setValue(null)) : '';
      forValue.designationLevelId == 7 ? (this.fc['stateId'].setValue(0),this.fc['districtId'].setValue(0), this.fc['villageId'].setValue(0)): (this.fc['stateId'].setValue(''), this.fc['districtId'].setValue(''));
      forValue.designationLevelId == 5 ? this.fc['villageId'].setValue('') : this.fc['villageId'].setValue(0)

      this.fc['beoEmailId'].setValue('');
      this.fc['beoMobileNo'].setValue('');

      this.fc['kendraEmailId'].setValue('');
      this.fc['kendraMobileNo'].setValue('');
    }
    else if(label == 'agency'){
      this.fc['beoEmailId'].setValue('');
      this.fc['beoMobileNo'].setValue('');
      this.fc['kendraEmailId'].setValue('');
      this.fc['kendraMobileNo'].setValue('');
    }
    else if (label == 'State') {
      ( this.officeForm.value.designationLevelId == 7) ? this.fc['designationId'].setValue(0) : this.fc['designationId'].setValue(null);
      this.designations = [];
      this.bits = [];
      this.talukas = [];
      this.fc['districtId'].setValue('');
      this.fc['talukaId'].setValue('');
      this.fc['beoEmailId'].setValue('');
      this.fc['beoMobileNo'].setValue('');
      this.fc['kendraEmailId'].setValue('');
      this.fc['kendraMobileNo'].setValue('');
      this.fc['centerId'].setValue(null);
      this.fc['schoolId'].setValue(null);
      this.fc['bitId'].setValue(null);
    }
    else if (label == 'District') {
      ( this.officeForm.value.designationLevelId == 7) ? this.fc['designationId'].setValue(0) : this.fc['designationId'].setValue(null);
      this.designations = [];
      this.bits = [];
      this.fc['talukaId'].setValue('');
      this.fc['beoEmailId'].setValue('');
      this.fc['beoMobileNo'].setValue('');
      this.fc['kendraEmailId'].setValue('');
      this.fc['kendraMobileNo'].setValue('');
      this.fc['centerId'].setValue(null);
      this.fc['schoolId'].setValue(null);
      this.fc['bitId'].setValue(null);
    }
    else if (label == 'Taluka') {
      ( this.officeForm.value.designationLevelId == 7) ? this.fc['designationId'].setValue(0) : this.fc['designationId'].setValue(null);
      this.designations = [];
      this.bits = [];
      this.fc['beoEmailId'].setValue('');
      this.fc['beoMobileNo'].setValue('');
      this.fc['kendraEmailId'].setValue('');
      this.fc['kendraMobileNo'].setValue('');
      this.fc['centerId'].setValue(null);
      this.fc['schoolId'].setValue(null);
      this.fc['bitId'].setValue(null);
    }
    else if (label == 'Designation') {
      (this.officeForm.value.designationId != 18 ) ? (this.fc['centerId'].setValue(null), this.fc['schoolId'].setValue(null)) : '';
      this.fc['kendraMobileNo'].setValue('');
      this.fc['kendraEmailId'].setValue('');
      this.fc['beoEmailId'].setValue('');
      this.fc['beoMobileNo'].setValue('');
      this.fc['kendraEmailId'].setValue('');
      this.fc['kendraMobileNo'].setValue('');
      this.fc['bitId'].setValue(null);
    }
    else if (label == 'Kendra') {
      this.fc['kendraMobileNo'].setValue('');
      this.fc['kendraEmailId'].setValue('');
      this.fc['schoolId'].setValue(null);

      this.fc['kendraEmailId'].setValue('');
      this.fc['kendraMobileNo'].setValue('');
    }

    else if (label == 'bit') {
      this.fc['agencyId'].setValue(0);
      this.fc['kendraMobileNo'].setValue('');
      this.fc['kendraEmailId'].setValue('');
      this.fc['kendraEmailId'].setValue('');
      this.fc['kendraMobileNo'].setValue('');
    }
  }

 


  onBlur(){
    let formData = this.officeForm.value;
    let subject:any = /^0+$/;
    if(formData.beoMobileNo.match(subject)){
      this.officeForm.controls['beoMobileNo'].setValue('');
    }else if(formData?.beoMobileNo.charAt(0) == 0 && formData.beoMobileNo?.length == 10){
      // this.commonService.showPopup('Enter a valid 11-digit Contact No.',1);
      this.errorMsg='';
      this.errorMsg = 'Enter a valid 11-digit Contact No.';
      this.officeForm.controls['beoMobileNo'].setValue('');
    }else if(formData?.beoMobileNo.charAt(0) != 0 && formData?.beoMobileNo.charAt(0) < 6){
      // this.commonService.showPopup('Enter a valid Contact No.', 1);
      this.errorMsg='';
      this.errorMsg = 'Enter a valid Contact No.';
      this.officeForm.controls['beoMobileNo'].setValue('');
    }else if(formData?.beoMobileNo.charAt(0) > 5 && formData.beoMobileNo?.length == 11){
      // this.commonService.showPopup('Enter a valid 10-digit Contact No.', 1);
      this.errorMsg='';
      this.errorMsg = 'Enter a valid 10-digit Contact No.';
      this.officeForm.controls['beoMobileNo'].setValue('');
    }else if(formData?.beoMobileNo.charAt(0) == 0 && formData.beoMobileNo?.length < 11){
      // this.commonService.showPopup('Enter a valid 11-digit Contact No.',1);
      this.errorMsg='';
      this.errorMsg = 'Enter a valid 11-digit Contact No.';
      this.officeForm.controls['beoMobileNo'].setValue('');
    }
  }

  compareFn(object1: any, object2: any) {
    return object1 && object2 && object1.centerId === object2.centerId;
  }

}
