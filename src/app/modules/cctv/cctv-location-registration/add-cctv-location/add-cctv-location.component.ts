import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { MasterService } from 'src/app/core/services/master.service';
import { ValidationService } from 'src/app/core/services/validation.service';
import { WebStorageService } from 'src/app/core/services/web-storage.service';

@Component({
  selector: 'app-add-cctv-location',
  templateUrl: './add-cctv-location.component.html',
  styleUrls: ['./add-cctv-location.component.scss']
})
export class AddCctvLocationComponent {

  cctvLocationForm !: FormGroup;
  cameraDetailsForm !: FormGroup;
  languageFlag!: string;
  $districts?: Observable<any>;
  talukaArr = new Array();
  centerArr = new Array();
  villageArr = new Array();
  schoolArr = new Array();
  CCTVLocation = new Array();
  editFlag: boolean = false;
  isDelete : boolean = false;
  cameraDetailsArr = new Array();
  get cf() { return this.cameraDetailsForm.controls };

  constructor(public webService: WebStorageService,
    private fb: FormBuilder,
    private ngxSpinner: NgxSpinnerService,
    private apiService: ApiService,
    private commonMethods: CommonMethodsService,
    private errors: ErrorsService,
    // public datepipe: DatePipe,
    private masterService: MasterService,
    public validators: ValidationService,
    private webStorageS: WebStorageService,
    public dialogRef: MatDialogRef<AddCctvLocationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    console.log("onEdit : ", this.data);

    this.data ? (this.editFlag = true, this.onEdit(this.data)) : this.editFlag = false;
    this.webService.langNameOnChange.subscribe(lang => {
      this.languageFlag = lang;
    });
    this.filterFormData();
    this.cameraFormData();
    this.getTaluka();
    this.getCCTVLocation();
  }

  filterFormData() {
    this.cctvLocationForm = this.fb.group({
      ...this.webStorageS.createdByProps(),
      "id": [0],
      "districtId": [this.data?.districtId || 1, [Validators.required]],
      "talukaId": ['', [Validators.required]],
      "centerId": ['', [Validators.required]],
      "villageId": ['', [Validators.required]],
      "schoolId": ['', [Validators.required]],
      "cctvLocationId": ['', [Validators.required]],
      // "cctvName": [this.data?.cctvName || '',[Validators.required]],
      // "cctvModel": [this.data?.cctvModel || '',[Validators.required]],
      // "cloudId": [this.data?.cloudId || '',[Validators.required]],
      // "registrationDate": [this.data?.registrationDate || '',[Validators.required]],
      "remark": [this.data?.remark || ''],
      "lan": [''],
      "cctvDetailModel": []
    });
  }

  cameraFormData() {
    this.cameraDetailsForm = this.fb.group({
      "createdBy": this.webService.getUserId() || 0,
      "modifiedBy": this.webService.getUserId() || 0,
      "createdDate": new Date(),
      "modifiedDate": new Date(),
      "isDeleted": false,
      "id": [0],
      "cctvRegisterId": [0],
      "cctvName": ['',],
      "cctvModel": ['',],
      "registerDate": [''],
      "deviceId": ['',],
      "userName": ['',],
      "password": ['',]
    })
  }

  // getDistrict() {
  //   this.$districts = this.masterService.getAlllDistrict(this.languageFlag);   
  //   this.getTaluka();
  // }

  getTaluka() {
    this.talukaArr = [];
    this.masterService.getAllTaluka('').subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.talukaArr = res.responseData;
          this.data && this.editFlag ? (this.cctvLocationForm.controls['talukaId'].setValue(this.data?.talukaId), this.getAllCenter()) : '';
        } else {
          this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
          this.talukaArr = [];
        }
      },
      // error: ((err: any) => { this.errors.handelError(err.statusCode || err.status) })
    });
  }

  getAllCenter() {
    this.centerArr = [];
    let id = this.cctvLocationForm.value.talukaId;
    if (id != 0) {
      this.masterService.getAllCenter('', id).subscribe({
        next: (res: any) => {
          if (res.statusCode == 200) {
            this.centerArr = res.responseData;
            this.data && this.editFlag ? (this.cctvLocationForm.controls['centerId'].setValue(this.data?.centerId), this.getVillage()) : '';
          } else {
            this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
            this.centerArr = [];
          }
        },
        // error: ((err: any) => { this.errors.handelError(err.statusCode || err.status) })
      });
    }
  }

  getVillage() {
    this.villageArr = [];
    let Cid = this.cctvLocationForm.value.centerId;
    this.masterService.getAllVillage('', Cid).subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.villageArr = res.responseData;
          this.data && this.editFlag ? (this.cctvLocationForm.controls['villageId'].setValue(this.data?.villageId), this.getAllSchoolsByCenterId()) : '';
        } else {
          this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
          this.villageArr = [];
        }
      },
      // error: ((err: any) => { this.errors.handelError(err.statusCode || err.status) })
    });
  }

  getAllSchoolsByCenterId() {
    this.schoolArr = [];
    let Tid = this.cctvLocationForm.value.talukaId || 0;
    let Cid = this.cctvLocationForm.value.centerId || 0;
    let Vid = this.cctvLocationForm.value.villageId || 0;
    this.masterService.getAllSchoolByCriteria('', Tid, Vid, Cid).subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.schoolArr = res.responseData;
          this.data && this.editFlag ? (this.cctvLocationForm.controls['schoolId'].setValue(this.data?.schoolId)) : '';
        } else {
          this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
          this.schoolArr = [];
        }
      },
      // error: ((err: any) => { this.errors.handelError(err.statusCode || err.status) })
    });
  }

  getCCTVLocation() {
    this.CCTVLocation = [];
    this.masterService.getCCTVLocation('').subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.CCTVLocation = res.responseData;
          this.data && this.editFlag ? (this.cctvLocationForm.controls['cctvLocationId'].setValue(this.data?.cctvLocationId)) : '';
        } else {
          this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
          this.CCTVLocation = [];
        }
      },
      // error: ((err: any) => { this.errors.handelError(err.statusCode || err.status) })
    });
  }

  addValidations(status?: any) {
    if (status) {
      this.cf['cctvName'].setValidators([Validators.required]);
      this.cf['cctvModel'].setValidators([Validators.required]);
      this.cf['deviceId'].setValidators([Validators.required]);
      this.cf['registerDate'].setValidators([Validators.required]);
      this.cf['userName'].setValidators([Validators.required]);
      this.cf['password'].setValidators([Validators.required, Validators.pattern(this.validators.valPassword)]);
    } else {
      this.cf['cctvName'].clearValidators();
      this.cf['cctvModel'].clearValidators();
      this.cf['deviceId'].clearValidators();
      this.cf['registerDate'].clearValidators();
      this.cf['userName'].clearValidators();
      this.cf['password'].clearValidators();
    }
    this.cf['cctvName'].updateValueAndValidity();
    this.cf['cctvModel'].updateValueAndValidity();
    this.cf['deviceId'].updateValueAndValidity();
    this.cf['registerDate'].updateValueAndValidity();
    this.cf['userName'].updateValueAndValidity();
    this.cf['password'].updateValueAndValidity();
  }

  onSubmitCameraDetails() {
    this.addValidations(true);
    let formValue = this.cameraDetailsForm.value;
    console.log("formValue : ", formValue, this.cameraDetailsForm.invalid);
    // return

    let obj = {
      "createdBy": this.webService.getUserId() || 0,
      "modifiedBy": this.webService.getUserId() || 0,
      "createdDate": new Date(),
      "modifiedDate": new Date(),
      "isDeleted": this.isDelete,
      "id": formValue.id,
      "cctvRegisterId": formValue.cctvRegisterId,
      "cctvName": formValue.cctvName,
      "cctvModel": formValue.cctvModel,
      "registerDate": formValue.registerDate,
      "deviceId": formValue.deviceId,
      "userName": formValue.userName,
      "password": formValue.password
    }

    if (this.cameraDetailsForm.invalid) {
      return
    } else {

      if(this.data){
        this.cameraDetailsArr.unshift(obj);
        this.cameraDetailsArr = [...this.cameraDetailsArr];
      }
      else{
        this.cameraDetailsArr.push(obj);
        this.cameraDetailsArr = [...this.cameraDetailsArr];
      }

      this.cameraFormData();
      this.addValidations();



    }
  }

  onSubmit() {
    let postData = this.cctvLocationForm.value;
    postData.cctvDetailModel = this.cameraDetailsArr;

    if (this.cctvLocationForm.invalid) {
      return;
    } else {
      this.ngxSpinner.show();
      let url = this.data ? 'UpdateCCTVLocation' : 'AddCCTVLocation'
      this.apiService.setHttp(this.data ? 'put' : 'post', 'zp-satara/CCTVLocation/' + url, false, postData, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => {
          if (res.statusCode == 200) {
            this.ngxSpinner.hide();
            this.commonMethods.showPopup(res.statusMessage, 0);
            this.dialogRef.close('yes')
          } else {
            this.ngxSpinner.hide();
            this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
          }
        },
        error: ((err: any) => { this.errors.handelError(err.statusCode) })
      });
    }
  }

  onEdit(data: any) {
    data.cctvDetailsModelResponse?.forEach((res: any) => {
      let obj = {
        "id": res?.id,
        "cctvRegisterId": res?.cctvRegisterId,
        "cctvName": res?.cctvName,
        "cctvModel": res?.cctvModel,
        "registerDate": res?.registerDate,
        "deviceId": res?.deviceId,
        "userName": res?.userName,
        "password": res?.password
      }
      this.cameraDetailsArr.push(obj);
    });
  }

  deleteCctvDetail(index: any) {
    console.log("index : ", index);
    this.isDelete = true;
  }

  clearDependency(flag: any) {
    this.editFlag = false
    if (flag == 'taluka') {
      this.cctvLocationForm.controls['centerId'].setValue('');
      this.cctvLocationForm.controls['villageId'].setValue('');
      this.cctvLocationForm.controls['schoolId'].setValue('');
      this.centerArr = [];
      this.villageArr = [];
      this.schoolArr = [];
    } else if (flag == 'centerId') {
      this.cctvLocationForm.controls['villageId'].setValue('');
      this.cctvLocationForm.controls['schoolId'].setValue('');
      this.villageArr = [];
      this.schoolArr = [];
    } else if (flag == 'villageId') {
      this.cctvLocationForm.controls['schoolId'].setValue('');
      this.schoolArr = [];

    }
  }

}
