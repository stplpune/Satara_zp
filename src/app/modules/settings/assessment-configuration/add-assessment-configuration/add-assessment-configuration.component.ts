import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { FileUploadService } from 'src/app/core/services/file-upload.service';
import { MasterService } from 'src/app/core/services/master.service';
import { ValidationService } from 'src/app/core/services/validation.service';
import { WebStorageService } from 'src/app/core/services/web-storage.service';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import { GlobalDialogComponent } from 'src/app/shared/components/global-dialog/global-dialog.component';

@Component({
  selector: 'app-add-assessment-configuration',
  templateUrl: './add-assessment-configuration.component.html',
  styleUrls: ['./add-assessment-configuration.component.scss']
})
export class AddAssessmentConfigurationComponent {
  questionForm!: FormGroup;
  paramterForm!: FormGroup;
  stateArr = new Array();
  districtArr = new Array();
  educationYearArr = new Array();
  assessmentTypeArr = new Array();
  standardArr = new Array();
  subjectArr = new Array();
  questionArr = new Array();
  imgArray = new Array();
  paramterArray = new Array();
  editObj: any;
  questionEditObj: any;
  index: any;
  isExpectedFlag: boolean = false;
  get f() { return this.questionForm.controls }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.paramterArray, event.previousIndex, event.currentIndex);
    this.paramterArray.map((x: any) => {
      if(x.checked == true){
        let i = this.paramterArray.indexOf(x);
        this.questionForm.value.expectedGrade = Number(i + 1);
      }
    });
  }

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    public webStorageS: WebStorageService,
    private masterService: MasterService,
    private fileUpload: FileUploadService,
    private commonMethod: CommonMethodsService,
    public validation: ValidationService,
    private ngxSpinner: NgxSpinnerService,
    private apiService: ApiService,
    private dialogRef: MatDialogRef<AddAssessmentConfigurationComponent>,
    private errors: ErrorsService,
    private dialog: MatDialog) { }

  ngOnInit() {
    this.formField();
    this.paratmeterFormField();
    this.initialDropdown();
    
    this.data ? this.onEdit(this.data) : '';
  }

  formField() {
    this.questionForm = this.fb.group({
      ...this.webStorageS.createdByProps(),
      id: [this.editObj ? this.editObj?.id : 0],
      stateId: ['', [Validators.required]],
      districtId: ['', Validators.required],
      educationYearId: ['', Validators.required],
      assessmentTypeId: [2],
      groupId: ['', [Validators.required]],
      assesmentSubjectId: ['', [Validators.required]],
      grade: [0],
      question: [this.editObj ? this.editObj?.question : '', [Validators.required, Validators.pattern(this.validation.alphaNumericOnly)]],
      m_Question: [this.editObj ? this.editObj?.m_Question : '', [Validators.required, Validators.pattern(this.validation.marathiAlphanumeric)]],
      isOption: [this.paramterArray.length ? 1 : 0],
      expectedGrade: [this.editObj ? this.editObj.expectedGrade : 0],
      questionTypeId: ['', [Validators.required]],
      options: [],
      questionSetUrls: []
    });
  }

  paratmeterFormField() {
    this.paramterForm = this.fb.group({
      optionName: [this.questionEditObj ? this.questionEditObj.optionName : '', [Validators.pattern(this.validation.alphaNumericOnly)]],
      m_OptionName: [this.questionEditObj ? this.questionEditObj.m_OptionName : '', [Validators.pattern(this.validation.marathiAlphanumeric)]]
    })
  }

  //#region -------------------------------------------------------- dropdown start here ---------------------------------------------------
  initialDropdown(){
    this.getState();
    this.getEducatioYear();
    // this.getAssessmentType();
    this.getStandard();
    this.getSubject();
    this.getQuestion();
  }

  getState() {
    this.masterService.getAllState('').subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.stateArr = res.responseData;
          this.editObj ? (this.f['stateId'].setValue(this.editObj?.stateId), this.getDistrict()) : '';
        }
        else {
          this.stateArr = [];
        }
      }
    });
  }

  getDistrict() {
    let stateId = this.questionForm.value.stateId;
    this.masterService.getAllDistrict(this.webStorageS.languageFlag, stateId).subscribe({
      next: (res: any) => {
        res.statusCode == "200" ? (this.districtArr = res.responseData) : (this.districtArr = []);
        this.editObj ? (this.f['districtId'].setValue(this.editObj?.districtId)) : '';
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
        else {
          this.educationYearArr = [];
        }
      },
    });
  }

  // getAssessmentType() {
  //   this.assessmentTypeArr = [];
  //   this.masterService.getAssementType(this.webStorageS.languageFlag).subscribe({
  //     next: (res: any) => {
  //       if (res.statusCode == "200") {
  //         this.assessmentTypeArr = res.responseData;
  //         this.editObj ? (this.f['assessmentTypeId'].setValue(this.editObj?.assessmentTypeId)) : '';
  //       }
  //       else {
  //         this.assessmentTypeArr = [];
  //       }
  //     },
  //   });
  // }

  getStandard() {
    this.standardArr = [];
    this.masterService.GetAllStandardClassWise(this.webStorageS.languageFlag).subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.standardArr = res.responseData;
          this.editObj ? (this.f['groupId'].setValue(this.editObj?.groupId)) : '';
        }
        else {
          this.standardArr = [];
        }
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
        else {
          this.subjectArr = [];
        }
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
        else {
          this.questionArr = [];
        }
      },
    });
  }
  //#endregion ----------------------------------------------------- dropdown end here -----------------------------------------------------

  //#region ---------------------------------------- Upload, view, delete multiple document start here -------------------------------------
  multipleImgUpload(event: any) {
    this.fileUpload.uploadMultipleDocument(event, 'Upload', 'jpg, jpeg, png, pdf, doc, txt').subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          let uploadMultipleImg = res.responseData;
          this.commonMethod.showPopup(res.statusMessage, 0);
          // multiple image 
          let imgArr = uploadMultipleImg.split(',')
          for (let i = 0; i < imgArr.length; i++) {
            let data = {
              id: 0,
              questionId: 0,
              docPath: imgArr[i]
            }
            this.imgArray.push(data)
          }
        }
        else {
          return
        }
        this.imgArray.map((x: any) => {
          let imgPath = x.docPath;
          let extension = imgPath.split('.');
          if (extension[3] == 'pdf' || extension[3] == 'doc' || extension[3] == 'txt') {
            x.docFlag = true;
          }
        });
      },
      //  error: ((err: any) => {  err.statusCode ? this.errors.handelError(err.statusCode):this.commonMethod.showPopup(err, 1) })
    });
  }

  onViewDoc(index: any) {
    window.open(this.imgArray[index].docPath, 'blank');
  }

  clearMultipleImg(index: any) {
    this.imgArray.splice(index, 1);
  }
  //#endregion ---------------------------------------- Upload, view, delete multiple document end here -------------------------------------

  //#region ---------------------------------------------- Add and remove Parameter start here ----------------------------------------------
  addParametereData() {
    this.addValidation();
    let formValue = this.paramterForm.value;

    let obj = {
      id: this.questionEditObj ? this.questionEditObj.id : 0,
      questionId: this.questionEditObj ? this.questionEditObj.questionId : 0,
      optionName: formValue.optionName,
      m_OptionName: formValue.m_OptionName,
      optionGrade: this.questionEditObj ? this.questionEditObj.optionGrade : 0,
      assessmentTypeId: this.questionEditObj ? this.questionEditObj.assessmentTypeId : 0,
      checked: false,
      ...this.webStorageS.createdByProps(),
    }

    if(!this.paramterForm.valid){
      return
    }
    else if(this.paramterArray.length > 0 && !this.questionEditObj){
      let duplicateOptionName = this.paramterArray.some((x: any) => {
        return x.optionName == formValue.optionName
      });

      let duplicatem_OptionName = this.paramterArray.some((x: any) => {
        return x.m_OptionName == formValue.m_OptionName
      });

      if(duplicateOptionName || duplicatem_OptionName && !this.questionEditObj){
        this.commonMethod.snackBar(this.webStorageS.getLangauge() == 'EN' ? 'Parameter is already exist' : 'पॅरामीटर आधीपासून अस्तित्वात आहे', 1);
          return
      }
      else{
        this.paramterArray.push(obj);
      }
    }
    else{
      if(this.questionEditObj){
        this.paramterArray[this.index] = obj;
        this.paramterArray = [...this.paramterArray];
      }
      else{
        this.paramterArray.push(obj);
        // this.paramterArray = [...this.paramterArray];
      }
    }

    // this.paramterArray.push(obj);
    this.removeValidation();
    this.paramterForm.controls['optionName'].setValue('');
    this.paramterForm.controls['m_OptionName'].setValue('');
  }

  // removeAddData(index: any) {
  //   this.paramterArray.splice(index, 1);
  // }
  //#endregion ------------------------------------------- Add and remove Parameter end here ------------------------------------------------

  //#region ---------------------------------------------- Add and remove validation start here ---------------------------------------------
  addValidation(){
    this.paramterForm.controls['optionName'].setValidators([Validators.required, Validators.pattern(this.validation.alphaNumericOnly)]);
    this.paramterForm.controls['m_OptionName'].setValidators([Validators.required, Validators.pattern(this.validation.marathiAlphanumeric)]);

    this.paramterForm.controls['optionName'].updateValueAndValidity();
    this.paramterForm.controls['m_OptionName'].updateValueAndValidity();
  }

  removeValidation(){
    this.paramterForm.controls['optionName'].clearValidators();
    this.paramterForm.controls['m_OptionName'].clearValidators();
  }

  //#endregion ------------------------------------------- Add and remove validation end here -----------------------------------------------

  isExpectedCondition(){
    console.log("this.questionForm.value.expectedGrade : ", this.questionForm.value.expectedGrade);
    console.log("this.editObj ? this.editObj?.expectedGrade ",this.editObj?.expectedGrade);
    
    
    if(this.questionForm.value.expectedGrade == 0 && (this.questionForm.value.questionTypeId == 1 || this.questionForm.value.questionTypeId == 2)){
      this.isExpectedFlag = true;
    }
    else{
      this.isExpectedFlag = false;
    }
  }

  //#region ---------------------------------------------- Submit and Update start here -----------------------------------------------------
  onSubmit(){
    let formValue = this.questionForm.value;

    for(let i = 0; i < this.paramterArray.length; i++){
      this.paramterArray[i].optionGrade = i + 1;
    }
    
    formValue.isOption = this.paramterArray.length ? 1 : 0;
    formValue.grade = formValue.isOption == 0 ? 1 : this.paramterArray.length;
    formValue.questionSetUrls = this.imgArray;
    formValue.options = this.paramterArray;
    !this.paramterArray.length ? formValue.expectedGrade = 1 : formValue.expectedGrade = formValue.expectedGrade;

    this.isExpectedCondition();

    let url = this.data ? 'UpdateCriteria' : 'AddCriteria';
    if(!this.questionForm.valid){
      this.commonMethod.showPopup(this.webStorageS.languageFlag == 'EN' ? 'Please Enter Mandatory Fields' : 'कृपया अनिवार्य फील्ड प्रविष्ट करा', 1);
      return
    }
    else if(!this.paramterArray.length && (formValue.questionTypeId == 1 || formValue.questionTypeId == 2)){
      this.commonMethod.showPopup(this.webStorageS.languageFlag == 'EN' ? 'Please Enter At Least One Parameter' : 'कृपया किमान एक पॅरामीटर प्रविष्ट करा', 1);
      return
    }
    else if(this.isExpectedFlag == true){
      this.commonMethod.showPopup(this.webStorageS.languageFlag == 'EN' ? 'Please Select isExpected From Any Parameter ' : 'कृपया कोणत्याही पॅरामीटरमधून इज एक्सपेक्टेड निवडा', 1);
      return
    }
    else{
      this.ngxSpinner.show();
      this.apiService.setHttp(this.data ? 'put' : 'post', 'zp-satara/AssessmentConfiguration/' + url + '?lang=' + this.webStorageS.getLangauge(), false, formValue, false, 'baseUrl');
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
  //#endregion ------------------------------------------- Submit and Update end here --------------------------------------------------------

  //#region -------------------------------------------- Patch values on Edit start here -----------------------------------------------------
  onEdit(id?: number){
    this.apiService.setHttp('get', 'zp-satara/AssessmentConfiguration/GetById?Id=' + id + '&lan=' + this.webStorageS.getLangauge(), false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if(res.statusCode == "200"){
          this.editObj = res.responseData;
          console.log("editObj: ", this.editObj);
          // this.questionForm.value.expectedGrade = this.editObj.expectedGrade;
          
          this.formField();
          this.initialDropdown();

          this.editObj?.questionSetUrls.map((res: any) => {
            let questionSetObj = {
              id: res.id,
              questionId: res.questionId,
              docPath: res.docPath
            }
            this.imgArray.push(questionSetObj);
          });

          this.imgArray.map((x: any) => {
            let imgPath = x.docPath;
            let extension = imgPath.split('.');
            if (extension[3] == 'pdf' || extension[3] == 'doc' || extension[3] == 'txt') {
              x.docFlag = true;
            }
          });

          this.editObj?.options.map((res: any) => {
            let optionObj = {
              id: res.id,
              questionId: res.questionId,
              optionName: res.optionName,
              m_OptionName: res.m_OptionName,
              optionGrade: res.optionGrade,
              assessmentTypeId: res.assessmentTypeId,
            }
            this.paramterArray.push(optionObj);
          });

          for(let i = 0; i < this.paramterArray.length; i++){
            if(this.editObj?.expectedGrade == i+1){
              this.paramterArray[i].checked = true;
            }
          }
        }
      }
    });
  }
  //#endregion ------------------------------------------ Patch values on Edit end here ------------------------------------------------------

  onCheck(index: number, event: any){
    this.questionForm.value.expectedGrade = Number(index + 1);
    if(event.checked == true){
      this.paramterArray.map((x: any) => {
        x.checked = false;
      })
    }
    else{
      this.questionForm.value.expectedGrade = 0;
    }
    this.paramterArray[index].checked = true;
  }

  onEditParameter(obj?: any, index?: number){
    this.index = index;
    this.questionEditObj = obj;
    this.paratmeterFormField();
  }

  globalDialogOpen(index: number) {
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
        this.onDeleteCriteria(index);
      }
    })
  }

  onDeleteCriteria(index: number){
    this.paramterArray?.splice(index, 1);
  }
}
