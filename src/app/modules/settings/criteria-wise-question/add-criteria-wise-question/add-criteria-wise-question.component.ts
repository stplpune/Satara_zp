import { Component, Inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MasterService } from 'src/app/core/services/master.service';
import { ValidationService } from 'src/app/core/services/validation.service';
import { WebStorageService } from 'src/app/core/services/web-storage.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { FileUploadService } from 'src/app/core/services/file-upload.service';
import { AddAssessmentConfigurationComponent } from '../../assessment-configuration/add-assessment-configuration/add-assessment-configuration.component';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { GlobalDialogComponent } from 'src/app/shared/components/global-dialog/global-dialog.component';

@Component({
  selector: 'app-add-criteria-wise-question',
  templateUrl: './add-criteria-wise-question.component.html',
  styleUrls: ['./add-criteria-wise-question.component.scss']
})
export class AddCriteriaWiseQuestionComponent {

  addCriteriaForm!: FormGroup;
  stateArr = new Array();
  districtArr = new Array();
  educationYearArr = new Array();
  assessmentTypeArr = new Array();
  standardArr = new Array();
  subjectArr = new Array();
  questionArr = new Array();
  criteriaArr = new Array();
  editObj: any;
  loginData = this.webStorageS.getLoggedInLocalstorageData();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    public webStorageS: WebStorageService,
    private masterService: MasterService,
    public validation: ValidationService,
    private fileUpload: FileUploadService,
    private commonMethod: CommonMethodsService,
    private ngxSpinner: NgxSpinnerService,
    private apiService: ApiService,
    private dialogRef: MatDialogRef<AddAssessmentConfigurationComponent>,
    private errors: ErrorsService,
    private dialog: MatDialog
  ) { this.dialog }

  ngOnInit() {
    this.addCriteria_Form();
    this.addQuestion_Form();
    this.getState();
    this.getEducatioYear();
    this.getStandard();
    this.getSubject();
    this.getQuestion();
    this.data ? this.callGetByIdApi(this.data) : '';
  }

  get f() { return this.addCriteriaForm.controls }

  addCriteria_Form() {
    this.addCriteriaForm = this.fb.group({
      id: [0],
      stateId: ['', [Validators.required]],
      districtId: ['', Validators.required],
      educationYearId: [1, Validators.required],
      standardId: ['', [Validators.required]],
      assesmentSubjectId: ['', [Validators.required]],
      questionTypeId: ['', [Validators.required]],
      criteriaId: ['', [Validators.required]],
      introduction: ['', [Validators.required, Validators.pattern(this.validation.alphaNumericSpecialCharOnly)]],
      m_Introduction: ['', [Validators.required, Validators.pattern(this.validation.marathiAlphaNumericSpecialChar)]]
    })
  }

  questionTypeChange(){
    // this.clearAddQueForm();this.addQuestionArray = [];
  (this.f['questionTypeId'].value == 1 || this.f['questionTypeId'].value == 2) ? (this.clearAddQueForm(),this.addQuestionArray = []) : '';
  }

  callCritetiaApi(){
    if(this.f['stateId'].value && this.f['districtId'].value && this.f['educationYearId'].value && 
    this.f['standardId'].value && this.f['assesmentSubjectId'].value && this.f['questionTypeId'].value){
      this.f['criteriaId'].setValue('');
      this.getCriteriaBySS_QuestionTypeId();
    }
  }

  getState() {
    this.masterService.getAllState('').subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.stateArr = res.responseData;
          this.editObj ? (this.f['stateId'].setValue(this.editObj?.stateId), this.getDistrict()) : this.loginData ? (this.f['stateId'].setValue(this.loginData?.stateId), this.getDistrict()) : this.f['stateId'].setValue(0);
        }
        else { this.stateArr = []; }
      }
    });
  }

  getDistrict() {
    this.masterService.getAllDistrict(this.webStorageS.languageFlag, this.f['stateId'].value).subscribe({
      next: (res: any) => {
        res.statusCode == "200" ? (this.districtArr = res.responseData) : (this.districtArr = []);
        this.editObj ? (this.f['districtId'].setValue(this.editObj?.districtId)) : this.loginData ? this.f['districtId'].setValue(this.loginData?.districtId) : this.f['districtId'].setValue(0);
      }
    });
  }

  getEducatioYear() {
    this.educationYearArr = [];
    this.masterService.getAcademicYears(this.webStorageS.languageFlag).subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.educationYearArr = res.responseData;
          this.editObj ? (this.f['educationYearId'].setValue(this.editObj?.educationYearId)) : '';
        }
        else { this.educationYearArr = []; }
      },
    });
  }

  getStandard() {
    this.standardArr = [];
    this.masterService.GetAllStandardClassWise(this.webStorageS.languageFlag).subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.standardArr = res.responseData;
          this.editObj ? (this.f['groupId'].setValue(this.editObj?.groupId)) : '';
        }
        else { this.standardArr = []; }
      },
    });
  }

  getSubject() {
    this.subjectArr = [];
    this.masterService.getAllSubject(this.webStorageS.languageFlag).subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.subjectArr = res.responseData;
          this.editObj ? (this.f['assesmentSubjectId'].setValue(this.editObj?.assesmentSubjectId)) : '';
        }
        else { this.subjectArr = []; }
      },
    });
  }

  getQuestion() {
    this.questionArr = [];
    this.masterService.getAllQuestionType(this.webStorageS.languageFlag).subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.questionArr = res.responseData;
          this.editObj ? (this.f['questionTypeId'].setValue(this.editObj?.questionTypeId)) : '';
        }
        else { this.questionArr = []; }
      },
    });
  }

  getCriteriaBySS_QuestionTypeId() {
    this.criteriaArr = [];
    let formValue = this.addCriteriaForm.value;
    let obj = formValue.standardId + "&SubjectId=" + formValue.assesmentSubjectId + '&QuestionTypeId=' + formValue.questionTypeId + '&flag_lang=' + this.webStorageS.getLangauge()
      + '&StateId=' + formValue.stateId + '&DistrictId=' + formValue.districtId + '&EducationYearId=' + formValue.educationYearId;
    this.apiService.setHttp('get', 'zp-satara/master/GetCriteriaByStandardSubject?StandardId=' + obj, false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.criteriaArr = res.responseData;
        }
        else { this.criteriaArr = []; }
      },
    });
  }

  onSubmit() {
    if (!this.addCriteriaForm.valid) {
      this.commonMethod.showPopup(this.webStorageS.languageFlag == 'EN' ? 'Please Enter Mandatory Fields' : 'कृपया अनिवार्य फील्ड प्रविष्ट करा', 1);
      return;
    } else if ((this.f['questionTypeId'].value == 3 || this.f['questionTypeId'].value == 4) && !this.addQuestionArray?.length) {
      this.commonMethod.showPopup(this.webStorageS.getLangauge() == 'EN' ? 'Please Add at Least One Question' : 'कृपया किमान एक प्रश्न जोडा', 1);
      return;
    } else {
      this.ngxSpinner.show();
      let formValue = this.addCriteriaForm.value;

      let obj = {
        ...this.createdByProps(),
        "id": formValue.id,
        "criteriaId": formValue.criteriaId,
        "introduction": formValue.introduction,
        "m_Introduction": formValue.m_Introduction,
        "cQuestionListModel": this.addQuestionArray,
        "lan": this.webStorageS.getLangauge()
      }

      let urlName = this.data ? 'zp-satara/AssessmentQuestion/UpdateQuestion' : 'zp-satara/AssessmentQuestion/AddQuestion';
      this.apiService.setHttp(this.data ? 'put' : 'post', urlName, false, obj, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => {
          this.ngxSpinner.hide();
          res.statusCode == "200" ? (this.commonMethod.showPopup(res.statusMessage, 0), this.dialogRef.close('yes')) : this.commonMethod.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethod.showPopup(res.statusMessage, 1);
        },
        error: ((err: any) => {
          this.ngxSpinner.hide();
          this.commonMethod.checkEmptyData(err.statusMessage) == false ? this.errors.handelError(err.statusCode) : this.commonMethod.showPopup(err.statusMessage, 1);
        })
      });
    }

  }

  callGetByIdApi(id: number) { // Edit getBy Id Api  
    this.apiService.setHttp('get', 'zp-satara/AssessmentQuestion/GetById?Id=' + id + '&lan=' + this.webStorageS.getLangauge(), false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.patchFormData(res.responseData);
        }
      }, error: ((err: any) => {
        this.commonMethod.checkEmptyData(err.statusMessage) == false ? this.errors.handelError(err.statusCode) : this.commonMethod.showPopup(err.statusMessage, 1);
      })
    });
  }

  patchFormData(obj: any) {
    this.addQuestionArray = [];
    this.editObj = obj;

    this.addCriteriaForm.patchValue({
      id: obj?.criteriaId,
      stateId: obj?.stateId,
      districtId: obj?.districtId,
      educationYearId: obj?.educationYearId,
      standardId: obj?.standardId,
      assesmentSubjectId: obj?.subjectId,
      questionTypeId: obj?.questionTypeId,
      criteriaId: obj?.criteriaId,
      introduction: obj?.introduction,
      m_Introduction: obj?.m_Introduction,
    })
    this.getDistrict(); this.getCriteriaBySS_QuestionTypeId();

    this.addQuestionArray = obj?.cQuestionModel.map((ele: any) => {
      let obj = {
        ...this.createdByProps(),
        "id": ele?.cQuestionId,
        "criteriaId": ele?.criteriaId,
        "cQuestion": ele?.cQuestion,
        "m_CQuestion": ele?.m_CQuestion,
        "expectedAns": ele?.expectedAns,
        "documentModel": ele?.documentModel,
        "m_ExpectedAns": ele?.m_ExpectedAns
      }
      return ele = obj;
    })
  }

  createdByProps(): any {  //"isDeleted": true
    return {
      "createdBy": this.webStorageS.getUserId() || 0,
      "modifiedBy": this.webStorageS.getUserId() || 0,
      "createdDate": new Date(),
      "modifiedDate": new Date(),
      "isDeleted": false,
    }
  }

  //............................................INside FormArray Form Code Start Here ......................................//

  addQuestionForm: FormGroup | any;
  addQuestionArray: any[] = [];
  imgArray = new Array();
  @ViewChild('addQueFormDirective') private addQueFormDirective!: NgForm;
  index: any;
  addQueEditFlag: boolean = false;

  get aq() { return this.addQuestionForm.controls; }

  addQuestion_Form() {
    this.addQuestionForm = this.fb.group({
      id: [0],
      cQuestion: ['', [Validators.required, Validators.pattern(this.validation.alphaNumericSpecialCharOnly)]],
      m_CQuestion: ['', [Validators.required, Validators.pattern(this.validation.marathiAlphaNumericSpecialChar)]],
      expectedAns: ['', [Validators.required, Validators.pattern(this.validation.alphaNumericSpecialCharOnly)]],
      m_ExpectedAns: ['', [Validators.required, Validators.pattern(this.validation.marathiAlphaNumericSpecialChar)]]
    })
  }

  addQueForm() {
    if (!this.addQuestionForm.valid){
      return;
    }
    // else 
    // if (!this.imgArray?.length) {
    //   this.commonMethod.showPopup(this.webStorageS.getLangauge() == 'EN' ? 'Please Upload at Least One Document' : 'कृपया किमान एक दस्तऐवज अपलोड करा', 1);
    //   return;
    // }
     else {
      let formData = this.addQuestionForm.value;
      let obj =
      {
        ...this.createdByProps(),
        "id": formData.id,
        "criteriaId": this.addCriteriaForm.value.criteriaId,
        "cQuestion": formData.cQuestion,
        "m_CQuestion": formData.m_CQuestion,
        "expectedAns": formData.expectedAns,
        "m_ExpectedAns": formData.m_ExpectedAns,
        "documentModel": this.imgArray
      }

      let checkDublicate = this.addQuestionArray?.some((x: any,index:any) => ((x.cQuestion == formData.cQuestion || x.m_CQuestion == formData.m_CQuestion) && this.index != index));

      if (checkDublicate == true) {
        this.commonMethod.snackBar(this.webStorageS.getLangauge() == 'EN' ? 'Parameter is already exist' : 'पॅरामीटर आधीपासून अस्तित्वात आहे', 1);
        return
      } else if (this.addQueEditFlag == true) {
        this.addQuestionArray[this.index] = obj;
      } else {
        this.addQuestionArray.push(obj);
      }
      this.clearAddQueForm();
    }
  }

  clearAddQueForm() {
    this.addQueFormDirective?.resetForm();
    this.addQuestion_Form();
    this.imgArray = [];
    this.addQueEditFlag = false;
  }

  editAddQuestion(obj: any, index: any) {
    this.index = index;
    this.addQueEditFlag = true;
    this.addQuestionForm.patchValue({
      id: obj?.id,
      cQuestion: obj?.cQuestion,
      m_CQuestion: obj?.m_CQuestion,
      expectedAns: obj?.expectedAns,
      m_ExpectedAns: obj?.m_ExpectedAns
    });
    this.imgArray = obj?.documentModel;

    this.imgArray.map((ele: any) => { // only For Showing Doc Icon
      let extension = ele.documentPath.split('.');
      if (extension[3] == 'pdf' || extension[3] == 'doc' || extension[3] == 'txt') {
        ele['docFlag'] = true;
      }
    });
  }

  globalDialogOpen(obj:any,index: number) {
    let dialoObj = {
      header: 'Delete',
      title: this.webStorageS.languageFlag == 'EN' ? 'Do you want to delete record?' : 'तुम्हाला रेकॉर्ड हटवायचा आहे का?',
      cancelButton: this.webStorageS.languageFlag == 'EN' ? 'Cancel' : 'रद्द करा',
      okButton: this.webStorageS.languageFlag == 'EN' ? 'Ok' : 'ओके'
    }
    const deleteDialogRef = this.dialog.open(GlobalDialogComponent, {
      width: '320px',
      data: dialoObj,
      disableClose: true,
      autoFocus: false
    })
    deleteDialogRef.afterClosed().subscribe((result: any) => {
      if (result == 'yes') {
        this.deleteAddQuestion(obj,index);
      }
    })
  }

  deleteAddQuestion(obj:any,index: number) {
    if(obj?.id == 0){
      this.addQuestionArray?.splice(index, 1);
    } else{
      obj.isDeleted = true;
      this.addQuestionArray[index] = obj;
    }
    
    this.clearAddQueForm();
  }

  //.................................... Document Upload Code Start Here ....................................//

  documentUpload(event: any) {
    if(this.imgArray.length >= 5){
      this.commonMethod.showPopup(this.webStorageS.languageFlag == 'EN' ? 'Cannot upload More than five Document/Image into Question Master ': 'प्रश्न मास्टरमध्ये पाचपेक्षा जास्त दस्तऐवज/प्रतिमा अपलोड करू शकत नाही', 3);
      return
    }else{
      let documentUrl: any = this.fileUpload.uploadStudentDocuments(event, 'Upload', 'jpg, jpeg, png')
      documentUrl.subscribe({
        next: (ele: any) => {
          if (ele.responseData != null) {
            let urlString = ele.responseData.split(',');
            urlString.forEach((res:any) => {
              let obj = {
                "id": 0,
                "cQuestionId": this.f['questionTypeId'].value,
                "documentPath": res,
                "createdBy": this.webStorageS.getUserId()
              }
              let extension = res.split('.');
              if (extension[3] == 'pdf' || extension[3] == 'doc' || extension[3] == 'txt') {
                obj['docFlag'] = true;
              }
              this.imgArray.push(obj);
            })
            this.commonMethod.showPopup(ele.statusMessage, 0);
          }
        },
      })
  
    }
  }

  viewDocoment(index: any) {
    window.open(this.imgArray[index].documentPath, 'blank');
  }

  deleteDocoment(index: any) {
    this.imgArray.splice(index, 1);
  }

  //.................................... Document Upload Code End Here ....................................//


  //............................................INside FormArray Form Code End Here ......................................//

}
