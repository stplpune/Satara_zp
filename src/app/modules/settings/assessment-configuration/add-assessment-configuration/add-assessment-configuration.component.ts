import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { FileUploadService } from 'src/app/core/services/file-upload.service';
import { MasterService } from 'src/app/core/services/master.service';
import { ValidationService } from 'src/app/core/services/validation.service';
import { WebStorageService } from 'src/app/core/services/web-storage.service';

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
  subjectArr = new Array();
  questionArr = new Array();
  imgArray = new Array();
  paramterArray = new Array();

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    public webStorageS: WebStorageService,
    private masterService: MasterService,
    private fileUpload: FileUploadService,
    private commonMethod: CommonMethodsService,
    public validation: ValidationService) { }

  ngOnInit() {
    this.formField();
    this.paratmeterFormField();
    this.getState();
    this.getEducatioYear();
    this.getAssessmentType();
    this.getSubject();
    this.getQuestion();
    console.log("data: ", this.data);
  }

  formField() {
    this.questionForm = this.fb.group({
      ...this.webStorageS.createdByProps(),
      // createdBy: 0,
      // modifiedBy: 0,
      // createdDate: new Date(),
      // modifiedDate: new Date(),
      // isDeleted: true,
      id: [0],
      stateId: [0],
      districtId: [0],
      educationYearId: [0],
      assessmentTypeId: [0],
      groupId: [0],
      assesmentSubjectId: [0],
      grade: [0],
      question: [''],
      m_Question: [''],
      isOption: [0],
      imgPath: [''],      //extra key
      options: [
        // {
        //   createdBy: 0,
        //   modifiedBy: 0,
        //   createdDate: new Date(),
        //   modifiedDate: new Date(),
        //   isDeleted: true,
        //   id: [0],
        //   questionId: [0],
        //   optionName: [''],
        //   m_OptionName: [''],
        //   optionGrade: [0],
        //   assessmentTypeId: [0]
        // }
      ],
      questionSetUrls: [
        // {
        //   id: [0],
        //   questionId: [0],
        //   docPath: ['']
        // }
      ]
    })
  }

  paratmeterFormField() {
    this.paramterForm = this.fb.group({
      optionName: [''],
      m_OptionName: ['']
    })
  }

  //#region -------------------------------------------------------- dropdown start here ---------------------------------------------------
  getState() {
    this.masterService.getAllState('').subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.stateArr = res.responseData;
          // this.editFlag ? (this.f['stateId'].setValue(this.data.stateId), this.getDistrict()) : '';
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
        // this.editFlag ? (this.f['districtId'].setValue(this.data?.obj.districtId), this.getTaluka()) : '';
      }
    });
  }

  getEducatioYear() {
    this.educationYearArr = [];
    this.masterService.getAcademicYears(this.webStorageS.languageFlag).subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.educationYearArr = res.responseData;
        }
        else {
          this.educationYearArr = [];
        }
      },
    });
  }

  getAssessmentType() {
    this.assessmentTypeArr = [];
    this.masterService.getAssementType(this.webStorageS.languageFlag).subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.assessmentTypeArr = res.responseData;
        }
        else {
          this.assessmentTypeArr = [];
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
              id: [0],
              questionId: [0],
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
    window.open(this.imgArray[index].url, 'blank');
  }

  clearMultipleImg(index: any) {
    this.imgArray.splice(index, 1);
  }
  //#endregion ---------------------------------------- Upload, view, delete multiple document end here -------------------------------------

  //#region ---------------------------------------------- Add and remove Parameter start here ----------------------------------------------
  addParametereData() {
    let formValue = this.paramterForm.value;

    let obj = {
      id: [0],
      questionId: [0],
      optionName: formValue.optionName,
      m_OptionName: formValue.m_OptionName,
      optionGrade: [0],
      assessmentTypeId: [0],
      ...this.webStorageS.createdByProps(),
    }

    if(this.paramterArray.length > 0){
      // this.paramterArray.map((x: any) => { 
      //   if(x.optionName == formValue.optionName || x.m_OptionName == formValue.m_OptionName){
      //     this.commonMethod.snackBar(this.webStorageS.getLangauge() == 'EN' ? 'Parameter is already exist' : 'पॅरामीटर आधीपासून अस्तित्वात आहे', 1);
      //     return
      //   }
      //  });

      let duplicateOptionName = this.paramterArray.some((x: any) => {
        return x.optionName == formValue.optionName
      });

      let duplicatem_OptionName = this.paramterArray.some((x: any) => {
        return x.m_OptionName == formValue.m_OptionName
      });

      if(duplicateOptionName || duplicatem_OptionName){
        this.commonMethod.snackBar(this.webStorageS.getLangauge() == 'EN' ? 'Parameter is already exist' : 'पॅरामीटर आधीपासून अस्तित्वात आहे', 1);
          return
      }
    }

    this.paramterArray.push(obj);
    this.paramterForm.controls['optionName'].setValue('');
    this.paramterForm.controls['m_OptionName'].setValue('');
  }

  removeAddData(index: any) {
    this.paramterArray.splice(index, 1);
  }
  //#endregion ------------------------------------------- Add and remove Parameter end here ------------------------------------------------

  //#region ---------------------------------------------- Submit and Edit start here -------------------------------------------------------
  onSubmit(){
    let formValue = this.questionForm.value;
    formValue.questionSetUrls = this.imgArray;
    formValue.options = this.paramterArray;

    console.log("formValue: ", formValue);
    



  }
  //#endregion ------------------------------------------- Submit and Edit end here ---------------------------------------------------------



}
