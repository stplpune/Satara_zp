import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { MasterService } from 'src/app/core/services/master.service';
import { ValidationService } from 'src/app/core/services/validation.service';
import { WebStorageService } from 'src/app/core/services/web-storage.service';
import { GlobalDialogComponent } from 'src/app/shared/components/global-dialog/global-dialog.component';

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
  cameraDetailsArr = new Array();
  editCctvObj: any;
  editObj: any;
  currentDate = new Date();
  public loginData: any;
  cctvCameraTypeArr = new Array();
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
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<AddCctvLocationComponent>,
    
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.loginData = this.webService.getLoggedInLocalstorageData();
      console.log("this.loginData", this.loginData);
      
     }

  ngOnInit() {
    this.data ? (this.editFlag = true, this.onEdit(this.data)) : this.editFlag = false;
    this.webService.langNameOnChange.subscribe(lang => {
      this.languageFlag = lang;
    });
    this.filterFormData();
    this.cameraFormData();
    this.getTaluka();
    this.getCCTVLocation();
    this.getCameraType()
  }

  filterFormData() {
    this.cctvLocationForm = this.fb.group({
      ...this.webStorageS.createdByProps(),
      "id": [this.editObj ? this.editObj.id : 0],
      "districtId": [this.editObj?.districtId || 1, [Validators.required]],
      "talukaId": ['', [Validators.required]],
      "centerId": ['', [Validators.required]],
      "villageId": ['', [Validators.required]],
      "schoolId": ['', [Validators.required]],
      "cctvLocationId": ['', [Validators.required]],
      "remark": [this.editObj?.remark || ''],
      "lan": [''],
      "cctvDetailModel": [],
    });
  }

  cameraFormData() {
    this.cameraDetailsForm = this.fb.group({
      "createdBy": this.webService.getUserId() || 0,
      "modifiedBy": this.webService.getUserId() || 0,
      "createdDate": new Date(),
      "modifiedDate": new Date(),
      "isDeleted": false,
      "id": [this.editCctvObj ? this.editCctvObj.id : 0],
      "cctvRegisterId": [this.editCctvObj ? this.editCctvObj.cctvRegisterId : 0],
      "cctvTypeId": [this.editCctvObj ? this.editCctvObj.cctvTypeId : '',],
      "ipAddress": [this.editCctvObj? this.editCctvObj.ipAddress:""],
      "cctvName": [this.editCctvObj ? this.editCctvObj.cctvName : '',],
      "cctvModel": [this.editCctvObj ? this.editCctvObj.cctvModel : '',],
      "registerDate": [this.editCctvObj ? this.editCctvObj.registerDate : ''],
      "deviceId": [this.editCctvObj ? this.editCctvObj.deviceId : '',],
      "userName": [this.editCctvObj ? this.editCctvObj.userName : '',],
      "password": [this.editCctvObj ? this.editCctvObj.password : '',],
      "link": [this.editCctvObj ? this.editCctvObj.link : ""]
    });
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
          this.editObj && this.editFlag ? (this.cctvLocationForm.controls['talukaId'].setValue(this.editObj?.talukaId), this.getAllCenter()) : this.loginData?.talukaId ? (this.cctvLocationForm.controls['talukaId'].setValue(this.loginData?.talukaId), this.getAllCenter()):'';
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
            this.editObj && this.editFlag ? (this.cctvLocationForm.controls['centerId'].setValue(this.editObj?.centerId), this.getVillage()) : this.loginData?.centerId ? (this.cctvLocationForm.controls['centerId'].setValue(this.loginData.centerId), this.getVillage()) : '';
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
          this.editObj && this.editFlag ? (this.cctvLocationForm.controls['villageId'].setValue(this.editObj?.villageId), this.getAllSchoolsByCenterId()) : this.loginData?.villageId ? (this.cctvLocationForm.controls['villageId'].setValue(this.loginData.villageId),this.getAllSchoolsByCenterId()):'';
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
          this.editObj && this.editFlag ? (this.cctvLocationForm.controls['schoolId'].setValue(this.editObj?.schoolId)) : this.loginData?.schoolId ? this.cctvLocationForm.controls['schoolId'].setValue(this.loginData?.schoolId):'';
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
          this.editObj && this.editFlag ? (this.cctvLocationForm.controls['cctvLocationId'].setValue(this.editObj?.cctvLocationId)) : '';
        } else {
          this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
          this.CCTVLocation = [];
        }
      },
      // error: ((err: any) => { this.errors.handelError(err.statusCode || err.status) })
    });
  }

  getCameraType(){
    this.cctvCameraTypeArr = [];
    this.masterService.getCCTVType('').subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.cctvCameraTypeArr = res.responseData;
          // this.editObj && this.editFlag ? (this.cctvLocationForm.controls['cctvLocationId'].setValue(this.editObj?.cctvLocationId)) : '';
        } else {
          this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
          this.cctvCameraTypeArr = [];
        }
      },
      // error: ((err: any) => { this.errors.handelError(err.statusCode || err.status) })
    });
    }

  addValidations(status?: any) {
    if (status) {
      this.cf['cctvTypeId'].setValidators([Validators.required]);
      this.cf['cctvTypeId'].value == 1 ? this.cf['ipAddress'].setValidators([Validators.required, Validators.pattern(this.validators.IpAddress)]): this.cf['ipAddress'].clearValidators();
      this.cf['cctvName'].setValidators([Validators.required]);
      this.cf['cctvModel'].setValidators([Validators.required]);
      this.cf['deviceId'].setValidators([Validators.required]);
      this.cf['registerDate'].setValidators([Validators.required]);
      this.cf['userName'].setValidators([Validators.required]);
      this.cf['password'].setValidators([Validators.required, Validators.pattern(this.validators.valPassword)]);
    } else {
      this.cf['cctvTypeId'].clearValidators();
      this.cf['ipAddress'].clearValidators();
      this.cf['cctvName'].clearValidators();
      this.cf['cctvModel'].clearValidators();
      this.cf['deviceId'].clearValidators();
      this.cf['registerDate'].clearValidators();
      this.cf['userName'].clearValidators();
      this.cf['password'].clearValidators();
    }
    this.cf['cctvTypeId'].updateValueAndValidity();
    this.cf['ipAddress'].updateValueAndValidity()
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

    let cctyTypeName = this.cctvCameraTypeArr.find((cctv:any)=>cctv.id == formValue.cctvTypeId )
    

    if (this.cameraDetailsForm.invalid) {
      return
    } else {
      let obj = {
        "createdBy": this.webService.getUserId() || 0,
        "modifiedBy": this.webService.getUserId() || 0,
        "createdDate": new Date(),
        "modifiedDate": new Date(),
        "isDeleted": formValue.isDeleted,
        "id": formValue.id,
        "cctvRegisterId": formValue.cctvRegisterId,
        "cctvTypeId": formValue.cctvTypeId,
        "cctvTypeName": cctyTypeName.cctvType,
        "ipAddress":formValue.ipAddress,
        "cctvName": formValue.cctvName,
        "cctvModel": formValue.cctvModel,
        "registerDate": formValue.registerDate,
        "deviceId": formValue.deviceId,
        "userName": formValue.userName,
        "password": formValue.password,
        "link":formValue.link
      }
      if (this.data) {
        this.cameraDetailsArr = this.cameraDetailsArr.filter((x) => x.id != this.cameraDetailsForm.value.id);
        this.cameraDetailsArr.unshift(obj);
        this.cameraDetailsArr = [...this.cameraDetailsArr];
      }
      else {
        this.cameraDetailsArr = this.cameraDetailsArr.filter((x) => x.id != this.cameraDetailsForm.value.id);
        this.cameraDetailsArr.push(obj);
        this.cameraDetailsArr = [...this.cameraDetailsArr];
      }
      this.cameraFormData();
      this.addValidations();
    }
  }

  onEditCctv(data: any) {
    this.editCctvObj = data;
    this.cameraFormData();
  }

  onSubmit() {
    let postData = this.cctvLocationForm.value;
    postData.cctvDetailModel = this.cameraDetailsArr;

    if (this.cctvLocationForm.invalid) {
      return;
    }
    else if(!this.cameraDetailsArr.length){
      this.commonMethods.showPopup(this.languageFlag == "English" ? 'Please Enter Add Atleast One Camera Details' : 'कृपया किमान एक कॅमेरा तपशील जोडा' , 1);
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

  onEdit(id: number) {
    this.apiService.setHttp('GET', 'zp-satara/CCTVLocation/GetById?Id=' + id, false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.editObj = res.responseData;
          this.filterFormData();
          this.editObj.cctvDetailsModelResponse?.forEach((res: any) => {
            let obj = {
              "id": res?.id,
              "cctvRegisterId": res?.cctvRegisterId,
              "cctvName": res?.cctvName,
              "cctvModel": res?.cctvModel,
              "registerDate": res?.registerDate,
              "deviceId": res?.deviceId,
              "userName": res?.userName,
              "password": res?.password,
              "isDeleted": res?.isDeleted
            }
            this.cameraDetailsArr.push(obj);
          });
        }
        else{
          this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
        }
      }
    });
  }

  deleteCctvDetail(data: any, i: any) {
    // var arrDelete = this.cameraDetailsArr.filter((x: any) => x.isDeleted == false);
    // if (arrDelete?.length) {
    let dialoObj = {
      img: 'assets/images/trash.gif',
      header: this.webService.languageFlag == 'EN' ? 'Delete' : 'हटवा',
      title: this.webService.languageFlag == 'EN' ? 'Do You Want To Delete CCTV Details?' : 'तुम्हाला CCTV चे तपशील हटवायचे आहेत का?',
      cancelButton: this.webService.languageFlag == 'EN' ? 'Cancel' : 'रद्द करा',
      okButton: this.webService.languageFlag == 'EN' ? 'Ok' : 'ओके'
    }

    const dialogRef = this.dialog.open(GlobalDialogComponent, {
      width: '320px',
      data: dialoObj,
      disableClose: true,
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(res => {
      if (res == 'yes') {
        if (this.cameraDetailsArr[i]?.id != 0) {
          data.isDeleted = true;
          this.editCctvObj = null;
          this.cameraFormData();
        }
        else {
          this.cameraDetailsArr = this.cameraDetailsArr.filter((x) => x != data);
          this.editCctvObj = null;
          this.cameraFormData();
        }
      }
    });
    // }
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
