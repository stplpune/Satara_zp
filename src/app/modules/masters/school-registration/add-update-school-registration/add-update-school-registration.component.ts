import { Component, Inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { FileUploadService } from 'src/app/core/services/file-upload.service';
import { MasterService } from 'src/app/core/services/master.service';
import { ValidationService } from 'src/app/core/services/validation.service';
import { WebStorageService } from 'src/app/core/services/web-storage.service';

@Component({
  selector: 'app-add-update-school-registration',
  templateUrl: './add-update-school-registration.component.html',
  styleUrls: ['./add-update-school-registration.component.scss']
})
export class AddUpdateSchoolRegistrationComponent {

  districtArr = new Array();
  talukaArr = new Array();
  centerArr = new Array();
  highestGroupclassArr = new Array();
  lowestGroupclassArr = new Array();
  schoolTypeArr = new Array();
  villageArr = new Array();
  categoryArr = new Array();
  schoolMngArr = new Array();
  bitArr = new Array();
  schoolRegForm !: FormGroup;
  uploadImg: any;
  uploadMultipleImg: any;
  imgArray = new Array();
  editFlag: boolean = false;
  img: boolean = false;
  editObj: any;
  isKendra: any;
  userId!: number;
  eventForm !: FormGroup;
  tableDataArray = new Array();
  totalCount!: number;
  tableDatasize!: number;
  editEventObj : any;
  // schoolDocument!: FormArray;

  constructor(private masterService: MasterService,
    private errors: ErrorsService,
    private fb: FormBuilder,
    private fileUpload: FileUploadService,
    private apiService: ApiService,
    private commonMethod: CommonMethodsService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<AddUpdateSchoolRegistrationComponent>,
    public validationService: ValidationService,
    public webStorageS: WebStorageService,
    private ngxSpinner: NgxSpinnerService) { }

  ngOnInit() {
    this.formFeild();
    if (this.data) {
      (this.editObj = this.data, this.isKendra = this.data.isKendraSchool)
      this.onEdit();
    } else {
      this.getDistrict();
      this.getSchoolType();
      this.getLowestGroupClass();
    }
    this.userId = this.webStorageS.getUserTypeId();
    this.userId !== 1 ? (this.getTableData(), this.eventFormFeild()) : '';
  }

  get f() {
    return this.schoolRegForm.controls;
  }

  formFeild() {
    this.schoolRegForm = this.fb.group({
      "id": this.data ? this.data.id : 0,
      "schoolCode": [this.data ? this.data.schoolCode : '',[ Validators.required]],
      "schoolName": [this.data ? this.data.schoolName : '', [Validators.required, Validators.pattern('^[.,\n() a-zA-Z0-9]+$')]],
      "m_SchoolName": [this.data ? this.data.m_SchoolName : '', [Validators.required, Validators.pattern('^[.,\n()\u0900-\u096F ]+$')]],
      "stateId": 0,
      "districtId": ['', Validators.required],
      "talukaId": ['', Validators.required],
      "villageId": ['', Validators.required],
      "centerId": [null, Validators.required],
      "s_CategoryId": ['', Validators.required],
      "s_ManagementId": ['', Validators.required],
      "s_TypeId": ['', Validators.required],
      "g_ClassId": 0,
      "lan": this.webStorageS.languageFlag,
      "localID": 0,
      "lowestClass": ['', Validators.required],
      "highestClass": ['', Validators.required],
      "timesStamp": new Date(),
      "uploadImage": [''],
      "isKendraSchool": [this.data ? this.data.isKendraSchool : false],
      "bitId": [null, Validators.required],
      schoolDocument: this.fb.array([
        this.fb.group({
          "id": 0,
          "schoolId": 0,
          "documentId": 3,
          "docPath": [''],
          "createdBy": 0,
          "createdDate": new Date(),
          "modifiedBy": 0,
          "modifiedDate": new Date(),
          "isDeleted": true
        })
      ]),
      ...this.webStorageS.createdByProps()
    });
  }

  get multipleImg(): FormArray {
    return this.schoolRegForm.get('schoolDocument') as FormArray;
  }

  eventFormFeild(){
    this.eventForm = this.fb.group({
        "id": [this.editEventObj ? this.editEventObj?.id : 0],
        "eventName": [this.editEventObj ? this.editEventObj?.eventName : ''],
        "m_EventName": [''],
        "description": [this.editEventObj ? this.editEventObj?.description : ''],
        "createdBy": 0,
        "isDeleted": true,
        "lan": [''],
        eventImages : this.fb.array([
          this.fb.group({
            "id": 0,
            "schoolId": 0,
            "documentId": 5,
            "eventId": 0,
            "docPath": [''],
            "createdBy": 0,
            "isDeleted": true
          })
        ])
    });
  }

  get multipleEventImg(): FormArray {
    return this.eventForm.get('eventImages') as FormArray;
  }

  //#region ---------------------------------------------- School Registration Dropdown start here ----------------------------------------// 
  getDistrict() {
    this.masterService.getAllDistrict(this.webStorageS.languageFlag).subscribe({
      next: (res: any) => {
        res.statusCode == 200 ? (this.districtArr = res.responseData, this.schoolRegForm.controls['districtId'].setValue(1)) : (this.commonMethod.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethod.showPopup(res.statusMessage, 1), this.districtArr = []);
        this.editFlag ? (this.f['districtId'].setValue(this.data.districtId), this.getTaluka()) : this.getTaluka();
      },
      error: ((err: any) => { this.errors.handelError(err) })
    });
  }

  getTaluka() {
    this.masterService.getAllTaluka(this.webStorageS.languageFlag).subscribe({
      next: (res: any) => {
        res.statusCode == 200 ? this.talukaArr = res.responseData : (this.commonMethod.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethod.showPopup(res.statusMessage, 1), this.talukaArr = []);
        this.editFlag ? (this.f['talukaId'].setValue(this.data.talukaId), this.getBitOrCenter(), this.getVillage()) : '';
      },
      error: ((err: any) => { this.errors.handelError(err) })
    });
  }

  getCenter() {
    this.masterService.getAllCenter(this.webStorageS.languageFlag, this.schoolRegForm.value.talukaId).subscribe({
      next: (res: any) => {
        res.statusCode == 200 ? this.centerArr = res.responseData : (this.commonMethod.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethod.showPopup(res.statusMessage, 1), this.centerArr = []);
        this.editFlag ? (this.f['centerId'].setValue(this.data.centerId)) : '';
      },
      error: ((err: any) => { this.errors.handelError(err) })
    });
  }

  getVillage() {
    this.masterService.getAllVillage(this.webStorageS.languageFlag, this.schoolRegForm.value.talukaId).subscribe({
      next: (res: any) => {
        res.statusCode == 200 ? this.villageArr = res.responseData : (this.commonMethod.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethod.showPopup(res.statusMessage, 1), this.villageArr = []);
        this.editFlag ? (this.f['villageId'].setValue(this.data.villageId), this.getSchoolType()) : '';
      },
      error: ((err: any) => { this.errors.handelError(err) })
    });
  }

  getSchoolType() {
    this.masterService.getAllSchoolType(this.webStorageS.languageFlag).subscribe({
      next: (res: any) => {
        res.statusCode == 200 ? this.schoolTypeArr = res.responseData : (this.commonMethod.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethod.showPopup(res.statusMessage, 1), this.schoolTypeArr = []);
        this.editFlag ? (this.f['s_TypeId'].setValue(this.data.s_TypeId), this.getCategoryDes()) : this.getCategoryDes();
      },
      error: ((err: any) => { this.errors.handelError(err) })
    });
  }

  getCategoryDes() {
    this.masterService.GetSchoolCategoryDescById(this.webStorageS.languageFlag).subscribe({
      next: (res: any) => {
        res.statusCode == 200 ? this.categoryArr = res.responseData : (this.commonMethod.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethod.showPopup(res.statusMessage, 1), this.categoryArr = []);
        this.editFlag ? (this.f['s_CategoryId'].setValue(this.data.s_CategoryId), this.getSchoolMngDesc()) : this.getSchoolMngDesc();
      },
      error: ((err: any) => { this.errors.handelError(err) })
    });
  }

  getSchoolMngDesc() {
    this.masterService.GetSchoolMngDescById(this.webStorageS.languageFlag).subscribe({
      next: (res: any) => {
        res.statusCode == 200 ? this.schoolMngArr = res.responseData : (this.commonMethod.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethod.showPopup(res.statusMessage, 1), this.schoolMngArr = []);
        this.editFlag ? (this.f['s_ManagementId'].setValue(this.data.s_ManagementId), this.getLowestGroupClass()) : '';
      },
      error: ((err: any) => { this.errors.handelError(err) })
    });
  }

  getLowestGroupClass() {
    this.lowestGroupclassArr = [
      { lowestClass: 1, value: 1 },
      { lowestClass: 2, value: 2 },
      { lowestClass: 3, value: 3 },
      { lowestClass: 4, value: 4 },
      { lowestClass: 5, value: 5 },
      { lowestClass: 6, value: 6 },
      { lowestClass: 7, value: 7 },
      { lowestClass: 8, value: 8 },
    ];
    this.editFlag ? (this.f['lowestClass'].setValue(this.data.lowestClass), this.getHighestGroupClass()) : '';
  }

  getHighestGroupClass() {
    this.f['highestClass'].setValue('');
    let lowestClass = this.schoolRegForm.value.lowestClass;

    let findObj = this.lowestGroupclassArr.filter((res: any) => {
      return res.lowestClass >= lowestClass
    })
    this.highestGroupclassArr = findObj;

    this.editFlag ? this.f['highestClass'].setValue(this.data.highestClass) : '';
  }

  getBit() {
    this.masterService.GetBit(this.webStorageS.languageFlag, this.schoolRegForm.value.talukaId).subscribe({
      next: (res: any) => {
        res.statusCode == 200 ? (this.bitArr = res.responseData, this.editFlag ? (this.f['bitId'].setValue(this.data.bitId)) : null) : (this.commonMethod.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethod.showPopup(res.statusMessage, 1), this.bitArr = []);

      },
      error: ((err: any) => { this.errors.handelError(err.statusCode) })
    });
  }

  //#endregion ------------------------------------------- School Registration Dropdown end here ----------------------------------------// 

  //#region ------------------------------------------------- Upload Image start here --------------------------------------------// 
  imgUpload(event: any) {
    this.img = true;
    let type = 'jpg, jpeg, png';
    this.fileUpload.uploadDocuments(event, 'Upload', type).subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.uploadImg = res.responseData;
          this.schoolRegForm.value.uploadImage = this.uploadImg;      
          this.commonMethod.showPopup(res.statusMessage, 0);
        }
        else {
          return
        }
      },
      error: ((err: any) => { err.statusCode ? this.errors.handelError(err.statusCode) : this.commonMethod.showPopup(err, 1) })
    });
  }

  multipleImgUpload(event: any) {
    this.fileUpload.uploadMultipleDocument(event, 'Upload', 'jpg, jpeg, png').subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.uploadMultipleImg = res.responseData;        
          this.commonMethod.showPopup(res.statusMessage, 0);
          // multiple image 
          let imgArr = this.uploadMultipleImg.split(',')
          for (let i = 0; i < imgArr.length; i++) {
            let data = {
              "id": 0,
              "schoolId": 0,
              "documentId": this.userId !==1 ? 5 : 3,
              "docPath": imgArr[i],
              "createdBy": 0,
              "createdDate": new Date(),
              "modifiedBy": 0,
              "modifiedDate": new Date(),
              "isDeleted": true
            }
            this.imgArray.push(data)
          }
          console.log("imgArray : ", this.imgArray);
          
        }
        else {
          return
        }
      },
      //  error: ((err: any) => {  err.statusCode ? this.errors.handelError(err.statusCode):this.commonMethod.showPopup(err, 1) })
    });
  }

  viewImg() {
    if (this.editFlag == true) {
      let viewImg = this.data.uploadImage;
      this.uploadImg ? window.open(this.uploadImg, 'blank') : window.open(viewImg, 'blank')
    }
    else {
      window.open(this.uploadImg, 'blank');
    }
  }
  //#endregionegion ------------------------------------------------- Upload Image end here --------------------------------------------// 

  //#region ------------------------------------------------- Add/Update Record start here --------------------------------------------//
  onSubmit() {
    let formValue = this.schoolRegForm.value;
    !formValue.centerId ? formValue.centerId = this.editObj?.centerId : formValue.centerId = formValue.centerId;
    formValue.uploadImage ? formValue.uploadImage = this.uploadImg : '';
    formValue.uploadImage = this.schoolRegForm.value.uploadImage;
    // }
    formValue.schoolDocument = this.imgArray;  
    // return

    if (formValue.isKendraSchool == true) {
      this.f['centerId'].clearValidators();
      this.f['centerId'].updateValueAndValidity();
    } else {
      this.f['bitId'].clearValidators();
      this.f['bitId'].updateValueAndValidity();
    }
    let url = this.editObj ? 'Update' : 'Add'
    if (!this.schoolRegForm.valid) {
      this.commonMethod.showPopup(this.webStorageS.languageFlag == 'EN' ? 'Please Enter Mandatory Fields' : 'कृपया अनिवार्य फील्ड प्रविष्ट करा', 1);
      return
    }
    else {
      this.ngxSpinner.show();
      this.apiService.setHttp(this.editObj ? 'put' : 'post', 'zp-satara/School/' + url, false, formValue, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => {
          this.ngxSpinner.hide();
          this.apiService.staticData.next('getRefreshStaticdata');
          res.statusCode == 200 ? (this.commonMethod.showPopup(res.statusMessage, 0)) : this.commonMethod.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethod.showPopup(res.statusMessage, 1);
          res.statusCode == 200 ? this.dialogRef.close('yes') : this.ngxSpinner.hide();
        },
        error: ((err: any) => {
          this.ngxSpinner.hide();
          this.commonMethod.checkEmptyData(err.statusMessage) == false ? this.errors.handelError(err.statusCode) : this.commonMethod.showPopup(err.statusMessage, 1);
        })
      });
    }
  }
  //#endregiongion ------------------------------------------ Add/Update Record end here --------------------------------------------//


  //#region ------------------------------------------------- Edit Record start here --------------------------------------------//
  onEdit(data ?: any) {
    this.editFlag = true;
    if(this.userId == 1){
    this.schoolRegForm.controls['uploadImage'].setValue(this.data?.uploadImage);
    this.uploadImg = this.data?.uploadImage   
    this.data.schoolDocument.map((res: any) => {
      let schoolDocumentObj = {
        "id": res.id,
        "schoolId": res.schoolId,
        "documentId": res.documentId,
        "docPath": res.docPath,
        "createdBy": 0,
        "createdDate": new Date(),
        "modifiedBy": 0,
        "modifiedDate": new Date(),
        "isDeleted": true
      };
      this.imgArray.push(schoolDocumentObj);
    })
    this.getDistrict();
    }
    else{
      console.log("edit data : ", data);
      this.editEventObj = data;
      this.eventFormFeild();
      this.editEventObj.eventImages.map((res: any) => {
        console.log("res : ", res);
        
        // let eventImgObj = {
        //     "id": res.id,
        //     "schoolId": 0,
        //     "documentId": 5,
        //     "eventId": 0,
        //     "docPath": [''],
        //     "createdBy": 0,
        //     "isDeleted": true
        // }
      })


    }
  }
  //#endregiongion ---------------------------------------------- Edit Record end here --------------------------------------------//

  //#region ------------------------------------------------- Clear Img field start here --------------------------------------------//
  clearImg() {   
    this.uploadImg = '';
    this.schoolRegForm.value.uploadImage = '';
    this.f['uploadImage'].setValue('');
    // this.editObj.uploadImage = '';
  }

  clearMultipleImg(index: any) {
    this.imgArray.splice(index, 1);
  }
  //#endregionegion --------------------------------------------- Clear Img field end here --------------------------------------------//

  //#region ----------------------------------------------- Clear dropdown on change start here --------------------------------------------//
  clearDropdown(dropdown: string) {
    this.editFlag = false;
    if (dropdown == 'Taluka') {
      this.centerArr = [];
      // this.f['centerId'].setValue(null);
      this.f['villageId'].setValue('');
    }
    else if (dropdown == 'LowestClass') {
      this.f['highestClass'].setValue('');
    }
  }

  updateValidation(event: any) {
    let eventValue = event.currentTarget.checked;
    this.isKendra = eventValue
    if (eventValue == true) {
      this.f['bitId'].setValidators(Validators.required);
      this.f['bitId'].updateValueAndValidity();
      this.f['centerId'].clearValidators();
      this.f['centerId'].updateValueAndValidity();
    }
    else if (eventValue == false) {     
      this.f['centerId'].setValidators(Validators.required);
      this.f['centerId'].updateValueAndValidity();

      this.f['bitId'].clearValidators();
      this.f['bitId'].updateValueAndValidity();
    }

  }
  //#endregiongion ----------------------------------------------- Clear dropdown on change end here --------------------------------------------//

  getBitOrCenter() {
    if (this.isKendra) {
      this.getBit();
    } else {
      this.getCenter();
    }
  }

  getTableData() {
    this.ngxSpinner.show();
  
    let str = `pageno=1&pagesize=10&TextSearch=&lan=EN`;
    // let str = `pageno=1&pagesize=10&TextSearch=event&lan=EN`;

    this.apiService.setHttp('GET', 'zp-satara/SchoolEvent/GetAllEvent?' + str, false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({

      next: (res: any) => {
        if (res.statusCode == 200) {
          this.ngxSpinner.hide();
          this.tableDataArray = res.responseData.responseData1;
          this.totalCount = res.responseData.responseData2.pageCount;
          this.tableDatasize = res.responseData.responseData2.pageCount;        
        }
        else {
          this.ngxSpinner.hide();
          this.tableDataArray = [];
          this.tableDatasize = 0;
        }
        // this.languageChange();
      },
      error: ((err: any) => { this.commonMethod.checkEmptyData(err.statusText) == false ? this.errors.handelError(err.statusCode) : this.commonMethod.showPopup(err.statusText, 1); })
    });
  }

  onSubmitEvent(){
    let formValue = this.eventForm.value;
    formValue.eventImages = this.imgArray;  
    console.log("onSubmit event : ", formValue);
    // return

    let url = this.editEventObj ? 'UpdateEvent' : 'AddEvent'
    if (!this.eventForm.valid) {
      this.commonMethod.showPopup(this.webStorageS.languageFlag == 'EN' ? 'Please Enter Mandatory Fields' : 'कृपया अनिवार्य फील्ड प्रविष्ट करा', 1);
      return
    }
    else {
      this.ngxSpinner.show();
      this.apiService.setHttp(this.editEventObj ? 'put' : 'post', 'zp-satara/SchoolEvent/' + url, false, formValue, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => {
          this.ngxSpinner.hide();
          this.apiService.staticData.next('getRefreshStaticdata');
          res.statusCode == 200 ? (this.commonMethod.showPopup(res.statusMessage, 0)) : this.commonMethod.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethod.showPopup(res.statusMessage, 1);
          res.statusCode == 200 ? (this.ngxSpinner.hide(), this.getTableData()) : '';
          // this.dialogRef.close('yes')
        },
        error: ((err: any) => {
          this.ngxSpinner.hide();
          this.commonMethod.checkEmptyData(err.statusMessage) == false ? this.errors.handelError(err.statusCode) : this.commonMethod.showPopup(err.statusMessage, 1);
        })
      });
  }
}



}
