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
  districts = new Array();
  talukas = new Array();
  centers = new Array();
  schools = new Array();
  others = new Array();
  bits = new Array();
  submitted : boolean = false;
  errorMsg : any;
  kendraErrorMsg :any
  officeCenterSchoolModelArr = new Array();

  constructor(private masterService: MasterService,
    private fb: FormBuilder,
    private apiService: ApiService,
    private commonService: CommonMethodsService,
    private error: ErrorsService,
    private dialogRef: MatDialogRef<AddUpdateOfficeUsersComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public validation: ValidationService,
    public webStorageService: WebStorageService,
    private ngxSpinner: NgxSpinnerService) { }

  ngOnInit() {
    this.defaultForm();
    this.getDistrictDrop();
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
        "emailId": [this.data ? this.data.emailId : "", [Validators.required, Validators.pattern(this.validation.email)]],
        "address": [this.data ? this.data.address : "",],
        "schoolId": [this.data ? this.data.schoolId : null],
        "designationId": [this.data ? this.data.designationId : null, [Validators.required]],
        "designationLevelId": [this.data ? this.data.designationLevelId : null,[Validators.required]],
        "stateId": [this.data ? 0 : 0],
        "districtId": [{ value: this.data ? this.data.districtId :1 , disabled: true } , Validators.required ],
        "talukaId": [this.data ? this.data.talukaId : null, Validators.required ],
        "userTypeId": [this.webStorageService.getUserTypeId()],
        "subUserTypeId": [this.data ? 0 : 0],
        // "kendraMobileNo": [this.data ? this.data.kendraMobileNo : "", [Validators.pattern('[0-9]\\d{9,10}')]],
        "kendraMobileNo": [this.data ? this.data.kendraMobileNo : "",],

        "kendraEmailId": [this.data ? this.data.kendraEmailId : "", [Validators.pattern(this.validation.email)]],
        "beoEmailId": [this.data ? this.data.beoEmailId : "", [Validators.pattern(this.validation.email)]],
        "beoMobileNo": [this.data ? this.data.beoMobileNo : "",],
        "centerId": [this.data ? this.data.centerId : null],
        "bitId": [this.data ? this.data.bitId : null],
        "lan": [this.webStorageService.languageFlag],
        "agencyId": [this.data ? this.data.agencyId : null],
        "isBlock" : true,
        "userId": [this.data ? this.data.userId : 0], 
        "officeCenterSchoolModel":[]
      })
    this.data ? (this.data, this.getLevelDrop(), this.getDistrictDrop(), this.getTalukaDrop(), this.getDesignationByLevelId(), this.getAgencyDrop(), this.getBitDrop(),this.onEdit()) : ''
  }

  get fc() { return this.officeForm.controls }

  

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
    this.getTalukaDrop();
    // this.getDesignationByLevelId();
    this.officeForm.value.designationLevelId == 7 ? this.getAgencyDrop(): ''
  }

  getDesignationByLevelId() {   
    let levelId = this.officeForm.value.designationLevelId;
    this.masterService.GetDesignationByLevelId(this.webStorageService.languageFlag, levelId).subscribe({
      next: (resp: any) => {
        resp.statusCode == "200" ? this.designations = resp.responseData : this.designations = [];
     
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

  getDistrictDrop() {
    this.masterService.getAllDistrict(this.webStorageService.languageFlag).subscribe({
      next: (resp: any) => {
        resp.statusCode == "200" ? this.districts = resp.responseData : this.districts = [];
      },
      error: (error: any) => {
        { this.error.handelError(error) };
      }
    });
  }

  getTalukaDrop() {
    this.masterService.getAllTaluka(this.webStorageService.languageFlag).subscribe({
      next: (resp: any) => {
        resp.statusCode == "200" ? (this.talukas = resp.responseData) : this.talukas = [];
      },
      error: (error: any) => {
        { this.error.handelError(error) };
      }
    });
  }

  onchangeTaluka(){
    this.officeForm.value.designationLevelId == 5 ? this.getBitDrop(): '';
    this.getDesignationByLevelId();

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
    if(this.officeForm.value.talukaId && this.officeForm.value.designationLevelId == 3 && this.officeForm.value.designationId == 18){     
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
      let getcenter = this.data.officeCenterSchoolResponseModel   
      let arr = new Array;
      if(getcenter.length){
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
    let formData = this.officeForm.value
    // return;
    if (this.officeForm.value.designationId == 18 && (this.officeForm.value.kendraMobileNo == this.officeForm.value.mobileNo)) {
      this.commonService.showPopup(this.webStorageService.languageFlag == 'EN' ? 'Contact No.(Kendra) and Mobile No. Can Not Be Same' : 'संपर्क क्रमांक (केंद्र) आणि संपर्क क्रमांक एकच असू शकत नाही', 1);
      return
    }
    if (this.officeForm.value.designationId == 11 && (this.officeForm.value.beoMobileNo == this.officeForm.value.mobileNo)) {
      this.commonService.showPopup(this.webStorageService.languageFlag == 'EN' ? 'Contact No.(BEO Office) and Mobile No. Can Not Be Same' : 'संपर्क क्रमांक (BEO कार्यालय) आणि संपर्क क्रमांक एकच असू शकत नाही', 1);
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

      formData.districtId = 1;
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
    if ((event.value == 1 || event.value == 2) && label == 'Level') {
      this.fc['talukaId'].setValidators(Validators.required);
      this.fc['talukaId'].updateValueAndValidity();

      this.fc['designationId'].setValidators(Validators.required);
      this.fc['designationId'].updateValueAndValidity();

      this.fc['address'].clearValidators();
      this.fc['address'].updateValueAndValidity();

      this.fc['bitId'].clearValidators();
      this.fc['bitId'].updateValueAndValidity();

      this.fc['agencyId'].clearValidators();
      this.fc['agencyId'].updateValueAndValidity();
    }
   else if (event.value == 5 && label == 'Level') {
      this.fc['talukaId'].setValidators(Validators.required);
      this.fc['talukaId'].updateValueAndValidity();

      this.fc['designationId'].setValidators(Validators.required);
      this.fc['designationId'].updateValueAndValidity();

      this.fc['bitId'].setValidators(Validators.required);
      this.fc['bitId'].updateValueAndValidity();
      // clear
      this.fc['address'].clearValidators();
      this.fc['address'].updateValueAndValidity();

      this.fc['agencyId'].clearValidators();
      this.fc['agencyId'].updateValueAndValidity();
    }
    else if (event.value == 7 && label == 'Level') {
      this.fc['address'].setValidators([Validators.required, Validators.maxLength(500)]);
      this.fc['agencyId'].setValidators([Validators.required]);
      this.fc['address'].updateValueAndValidity();
      this.fc['agencyId'].updateValueAndValidity();
      this.fc['bitId'].clearValidators();
      this.fc['bitId'].updateValueAndValidity();
    }
    else if (event.value == 11 && label == 'Designation') {
      this.fc['beoMobileNo'].setValidators([Validators.required]);
      this.fc['beoMobileNo'].updateValueAndValidity();
      this.fc['beoEmailId'].setValidators([Validators.required, Validators.pattern(this.validation.email)]);
      this.fc['beoEmailId'].updateValueAndValidity();
      this.fc['bitId'].clearValidators();
      this.fc['bitId'].updateValueAndValidity();

      this.fc['agencyId'].clearValidators();
      this.fc['agencyId'].updateValueAndValidity();
    }
    else if (event.value == 18 && label == 'Designation') {
      this.fc['centerId'].setValidators([Validators.required]);
      this.fc['centerId'].updateValueAndValidity();

      // this.fc['schoolId'].setValidators([Validators.required]);
      // this.fc['schoolId'].updateValueAndValidity();
      
      this.fc['bitId'].clearValidators();
      this.fc['bitId'].updateValueAndValidity();

      // clear
      this.fc['beoMobileNo'].clearValidators();
      this.fc['beoMobileNo'].updateValueAndValidity();
      this.fc['beoEmailId'].clearValidators();
      this.fc['beoEmailId'].updateValueAndValidity();

      this.fc['agencyId'].clearValidators();
      this.fc['agencyId'].updateValueAndValidity();
    }

    else if (event.value != 18 && label == 'Designation') {
      // clear
      this.fc['beoMobileNo'].clearValidators();
      this.fc['beoMobileNo'].updateValueAndValidity();
      this.fc['beoEmailId'].clearValidators();
      this.fc['beoEmailId'].updateValueAndValidity();
      this.fc['address'].clearValidators();
      this.fc['address'].updateValueAndValidity();
      this.fc['agencyId'].clearValidators();
      this.fc['agencyId'].updateValueAndValidity();
    }

  }

  // clearShilpa
    clearDropDown(label: string) {
    if (label == 'Level') {         
      (this.officeForm.value.designationLevelId == 7)  ? this.fc['agencyId'].setValue(null) : this.fc['agencyId'].setValue(0) ;
      (this.officeForm.value.designationLevelId == 6 || this.officeForm.value.designationLevelId == 7) ?this.fc['talukaId'].setValue(0) : this.fc['talukaId'].setValue(null);
      ( this.officeForm.value.designationLevelId == 7) ? this.fc['designationId'].setValue(31) : (this.fc['designationId'].setValue(null), this.designations = []);
      (this.officeForm.value.designationLevelId != 7)  ? this.fc['address'].setValue('') : this.fc['address'].setValue(this.officeForm.value.address) ;
      (this.officeForm.value.designationId != 3 ) ? (this.fc['centerId'].setValue(null), this.fc['schoolId'].setValue(null)) : '';

      this.fc['beoEmailId'].setValue('');
      this.fc['beoMobileNo'].setValue('');

      this.fc['kendraEmailId'].setValue('');
      this.fc['kendraMobileNo'].setValue('');
      this.fc['bitId'].setValue(null);
    }
    else if(label == 'agency'){
      this.fc['beoEmailId'].setValue('');
      this.fc['beoMobileNo'].setValue('');
      this.fc['kendraEmailId'].setValue('');
      this.fc['kendraMobileNo'].setValue('');
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
