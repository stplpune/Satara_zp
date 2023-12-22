import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { MasterService } from 'src/app/core/services/master.service';
import { ValidationService } from 'src/app/core/services/validation.service';
import { WebStorageService } from 'src/app/core/services/web-storage.service';

@Component({
  selector: 'app-add-assessment-subject',
  templateUrl: './add-assessment-subject.component.html',
  styleUrls: ['./add-assessment-subject.component.scss']
})
export class AddAssessmentSubjectComponent {
  subjectForm!: FormGroup;
  stateArr = new Array();
  districtArr = new Array();
  languageFlag: any;
  loginData = this.webService.getLoggedInLocalstorageData();
  get f() { return this.subjectForm.controls }

  constructor(private masterService: MasterService,
    private commonMethods: CommonMethodsService,
    private errors: ErrorsService,
    private fb: FormBuilder,
    private webService: WebStorageService,
    private ngxSpinner: NgxSpinnerService,
    private apiService: ApiService,
    public validationService: ValidationService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<AddAssessmentSubjectComponent>){}

  ngOnInit(){
    this.languageFlag = this.webService.languageFlag;
    this.webService.langNameOnChange.subscribe(lang => {
      this.languageFlag = lang;
    });
    this.getState();
    this.formField();
  }

  formField(){
    this.subjectForm = this.fb.group({
      id: [this.data ? this.data.id : 0],
      stateId: ['', Validators.required],
      districtId: ['', Validators.required],
      subjectName: [this.data ? this.data.subjectName : '', [Validators.required, Validators.pattern(this.validationService.alphaNumericOnly)]],
      m_SubjectName: [this.data ? this.data.m_SubjectName : '', [Validators.required, Validators.pattern(this.validationService.alphanumericMarathi)]],
      isConsiderForAssessed: [this.data ? this.data?.isConsiderForAssessed : false],
      createdBy: 0,
      modifiedBy: 0,
      lan: this.languageFlag
    })
  }

  getState(){
    this.stateArr = [];
    this.masterService.getAllState('').subscribe({
      next: (res: any) => {
        if(res.statusCode == "200"){
          this.stateArr = res.responseData;
          this.data ? (this.f['stateId'].setValue(this.data?.stateId), this.getDistrict())  : this.loginData ? (this.f['stateId'].setValue(this.loginData?.stateId), this.getDistrict()) : this.f['stateId'].setValue(0);
        }
        else{
          this.stateArr = [];
        }
      }
    });
  }

  getDistrict() {
    this.districtArr = [];
    let stateId = this.subjectForm.value.stateId;
    this.masterService.getAllDistrict('', stateId).subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.districtArr = res.responseData;
          this.data ? (this.f['districtId'].setValue(this.data?.districtId))  : this.loginData ? this.f['districtId'].setValue(this.loginData?.districtId) : this.f['districtId'].setValue(0);
        }
        else {
          this.districtArr = [];
        }
      }
    });
  }

  onSubmit(){
    let formValue = this.subjectForm.value;
    console.log("formValue: ", formValue);

    let url = this.data ? 'UpdateAssessmentSubject' : 'AddAssessmentSubject';
    if(!this.subjectForm.valid){
      this.commonMethods.showPopup(this.languageFlag == 'English' ? 'Please Enter Mandatory Fields' : 'कृपया अनिवार्य फील्ड प्रविष्ट करा', 1);
      return
    }else{
      this.ngxSpinner.show();
      this.apiService.setHttp(this.data ? 'put' : 'post', 'zp-satara/AssessmentSubject/' + url, false, formValue, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => {
          res.statusCode == "200" ? (this.commonMethods.showPopup(res.statusMessage, 0), this.dialogRef.close('yes')) : this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
          this.ngxSpinner.hide();
        },
        error: ((err: any) => {
          this.ngxSpinner.hide();
          this.commonMethods.checkEmptyData(err.statusMessage) == false ? this.errors.handelError(err.statusCode) : this.commonMethods.showPopup(err.statusMessage, 1);
        })
      });
    }
  }

  clearDropdown(){
    this.subjectForm.controls['districtId'].setValue('');
  }
}
