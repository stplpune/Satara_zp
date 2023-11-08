import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { MasterService } from 'src/app/core/services/master.service';
import { WebStorageService } from 'src/app/core/services/web-storage.service';

@Component({
  selector: 'app-add-assessment-subject',
  templateUrl: './add-assessment-subject.component.html',
  styleUrls: ['./add-assessment-subject.component.scss']
})
export class AddAssessmentSubjectComponent {
  editData: any;
  subjectForm!: FormGroup;
  stateArr = new Array();
  districtArr = new Array();
  languageFlag: any;
  editObj: any;

  constructor(private masterService: MasterService,
    private commonMethods: CommonMethodsService,
    private errors: ErrorsService,
    private fb: FormBuilder,
    private webService: WebStorageService,
    private ngxSpinner: NgxSpinnerService,
    private apiService: ApiService,
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
      id: 0,
      stateId: [0],
      districtId: [0],
      subjectName: [''],
      m_SubjectName: [''],
      lan: this.languageFlag
    })
  }

  getState(){
    this.stateArr = [
      {"id": 1, "state": "Maharashtra", "m_State": "महाराष्ट्र"}
    ];
  }

  getDistrict() {
    this.districtArr = [];
    // let stateId = this.subjectForm.value.stateId;
    this.masterService.getAllDistrict('').subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.districtArr = res.responseData;
          // this.subjectForm.controls['districtId'].setValue(0);
        }
        else {
          this.districtArr = [];
        }
      },
      error: ((err: any) => { this.commonMethods.checkEmptyData(err.statusText) == false ? this.errors.handelError(err.statusCode) : this.commonMethods.showPopup(err.statusText, 1); })
    });
  }

  onSubmit(){
    let formValue = this.subjectForm.value;
    console.log("formValue: ", formValue);

    let url = this.editObj ? 'UpdateAssessmentSubject' : 'AddAssessmentSubject';
    if(!this.subjectForm.valid){
      this.commonMethods.showPopup(this.languageFlag == 'English' ? 'Please Enter Mandatory Fields' : 'कृपया अनिवार्य फील्ड प्रविष्ट करा', 1);
      return
    }else{
      this.ngxSpinner.show();
      this.apiService.setHttp(this.editObj ? 'put' : 'post', 'zp-satara/AssessmentSubject/' + url, false, formValue, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => {
          res.statusCode == "200" ? (this.commonMethods.showPopup(res.statusMessage, 0), this.dialogRef.close('yes')) : this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
          this.ngxSpinner.hide();
        },
        error: ((err: any) => {
          this.ngxSpinner.hide();
          this.commonMethods.checkEmptyData(err.statusMessage) == false ? this.errors.handelError(err.statusCode) : this.commonMethods.showPopup(err.statusMessage, 1);
        })
      })

    }
    
  }

  clearDropdown(){
    this.subjectForm.controls['districtId'].setValue(0);
  }
}
