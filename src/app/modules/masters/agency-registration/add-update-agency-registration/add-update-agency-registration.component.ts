import { Component, Inject } from '@angular/core';
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
  selector: 'app-add-update-agency-registration',
  templateUrl: './add-update-agency-registration.component.html',
  styleUrls: ['./add-update-agency-registration.component.scss']
})
export class AddUpdateAgencyRegistrationComponent {
  agencyRegisterForm!: FormGroup;
  stateData = new Array();
  districtData = new Array();
  talukaData = new Array();
  editData: any;
  loginData = this.webStorageService.getLoggedInLocalstorageData();

  constructor(public dialogRef: MatDialogRef<AddUpdateAgencyRegistrationComponent>, private api: ApiService, public webStorageService: WebStorageService,
    private fb: FormBuilder, private master: MasterService, public validation: ValidationService, private ngxSpinner: NgxSpinnerService,
    private common: CommonMethodsService, @Inject(MAT_DIALOG_DATA) public data: any, private errors: ErrorsService) { }

  ngOnInit() {
    this.editData = this.data
    this.defaultForm(this.editData);
    this.getState();
    // this.getAllDistricts();
    // this.getAllTalukas();
  }

  defaultForm(data?: any) {
    this.agencyRegisterForm = this.fb.group({
      ...this.webStorageService.createdByProps(),
      "id": data ? data.id : 0,
      "agency_Name": [data ? data.agency_Name : "", [Validators.required, Validators.pattern(this.validation.fullName)]],
      "m_Agency_Name": [data ? data.m_Agency_Name : "", [Validators.required, Validators.pattern('^[\u0900-\u0965 ]+$')]],
      "contactPerson_Name": [data ? data.contactPerson_Name : "", [Validators.required, Validators.pattern(this.validation.fullName)]],
      "agency_MobileNo": [data ? data.agency_MobileNo : "", [Validators.required, Validators.pattern(this.validation.mobile_No)]],
      "contact_No": [data ? data.contact_No : "", [Validators.required, Validators.pattern(this.validation.mobile_No)]],
      "emailId": [data ? data.emailId : "", [Validators.pattern(this.validation.email)]],
      "agency_EmailId": [data ? data.agency_EmailId : "", [Validators.pattern(this.validation.email)]],
      "address": [data ? data.address : "", [Validators.required]],
      "agency_Address": [data ? data.agency_Address : "", [Validators.required]],
      "stateId": [this.data ? this.data.stateId : '' , [Validators.required]],
      "districtId": [this.data ? this.data.districtId : '' , [Validators.required]],
      "talukaId": ["", Validators.required],
      "lan": this.webStorageService.languageFlag,
      "localID": 0,
      "timestamp": new Date()
    })
    data ? (this.getState()) : ''
  }

  get fc() { return this.agencyRegisterForm.controls }

  getState(){
    this.master.getAllState('').subscribe({
    next: (res: any) => {
      if(res.statusCode == "200"){
        this.stateData = res.responseData;
        // this.loginData ? (this.fc['stateId'].setValue(this.loginData.stateId), this.getAllDistricts()) : this.fc['stateId'].setValue(0);
        this.editData ? (this.fc['stateId'].setValue(this.editData.stateId), this.getAllDistricts()) : '';
      }
      else{
        this.stateData = [];
      }
    }
  });
  }

  getAllDistricts() {
    let stateId = this.agencyRegisterForm.value.stateId;
    this.master.getAllDistrict(this.webStorageService.languageFlag, stateId).subscribe((res: any) => {
      res.statusCode == 200 ? this.districtData = res.responseData : this.districtData = [];
      // this.loginData ? (this.fc['districtId'].setValue(this.loginData.districtId), this.getAllTalukas()) : this.fc['districtId'].setValue(0);
      this.editData ? (this.fc['districtId'].setValue(this.editData?.districtId), this.getAllTalukas()) : '';
    })
  }

  getAllTalukas() {
    let districtId = this.agencyRegisterForm.value.districtId;
    this.master.getAllTaluka(this.webStorageService.languageFlag, districtId).subscribe((res: any) => {
      res.statusCode == 200 ? this.talukaData = res.responseData : this.talukaData = [];
      // this.loginData ? this.fc['talukaId'].setValue(this.loginData.talukaId) : this.fc['talukaId'].setValue(0);
      this.editData ? this.fc['talukaId'].setValue(this.editData.talukaId) : '';
    })
  }

  onSubmit(clear: any) {
    this.ngxSpinner.show();
    let obj = this.agencyRegisterForm.value;
    obj.districtId = 1;
    if (this.agencyRegisterForm.valid && obj.contact_No != obj.agency_MobileNo) {
      this.api.setHttp(this.data ? 'put' : 'post', 'zp-satara/Agency/' + (this.data ? 'Update' : 'Add'), false, obj, false, 'baseUrl');
      this.api.getHttp().subscribe({
        next: (res: any) => {
          this.api.staticData.next('getRefreshStaticdata');
          res.statusCode == 200 ? (this.common.showPopup(res.statusMessage, 0), this.dialogRef.close('Yes'), clear.resetForm(), this.ngxSpinner.hide(), this.defaultForm()) : (this.common.showPopup(res.statusMessage, 1), this.ngxSpinner.hide());
          res.statusMessage == "MobileNo Already Exist." ? this.ngxSpinner.hide() : ''
        },
        error: ((err: any) => { this.errors.handelError(err) })
      })
    }
    else if (this.agencyRegisterForm.invalid) {
      this.common.showPopup(this.webStorageService.languageFlag == 'EN' ? 'Please Enter Mandatory Fields' : 'कृपया अनिवार्य फील्ड प्रविष्ट करा', 1);
      this.ngxSpinner.hide();
      return;
    }
    else {
      if(obj.emailId != '' && obj.agency_EmailId != ''){
        obj.emailId == obj.agency_EmailId ? this.common.showPopup(this.webStorageService.languageFlag == 'EN' ? 'Email Id & Email Id Can Not Be Same' : 'ईमेल आयडी आणि एजन्सीचा ईमेल आयडी एकच असू शकत नाही', 1) : '';
      }
      
      obj.contact_No == obj.agency_MobileNo ? this.common.showPopup(this.webStorageService.languageFlag == 'EN' ? 'Mobile No. and Contact Person No. Can Not Be Same' : 'संपर्क क्रमांक आणि एजन्सीचा संपर्क क्रमांक एकच असू शकत नाही', 1) : '';
      this.ngxSpinner.hide();
      return;
    }
  }
}
