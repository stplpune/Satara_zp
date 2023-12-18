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
  selector: 'app-add-biometric-device-registration',
  templateUrl: './add-biometric-device-registration.component.html',
  styleUrls: ['./add-biometric-device-registration.component.scss']
})
export class AddBiometricDeviceRegistrationComponent {
  // editFlag = true;
  biometricForm!: FormGroup;
  stateArr = new Array();
  districtArr = new Array();
  talukaArr = new Array();
  centerArr = new Array();
  villageArr = new Array();
  schoolArr = new Array();
  connectionTypeArr = ['Tcp/IP', 'USB'];
  deviceDirectionArr = [{ name: 'In Device', shortName: 'in' },
  { name: 'Out Device', shortName: 'out' },
  { name: 'Alternate In/Out Device', shortName: 'altinout' },
  { name: 'System Direction(In/Out) Device', shortName: 'inout' }];

  faceDeviceArr = ['Normal', 'Android', 'FaceTMP', 'ExternalTMP'];
  get f() { return this.biometricForm.controls }
  loginData = this.webStorageS.getLoggedInLocalstorageData();

  constructor(private fb: FormBuilder,
    private masterService: MasterService,
    public webStorageS: WebStorageService,
    public validationService: ValidationService,
    private apiService: ApiService,
    private commonMethodS: CommonMethodsService,
    private ngxSpinner: NgxSpinnerService,
    private errors: ErrorsService,
    private dialogRef: MatDialogRef<AddBiometricDeviceRegistrationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.formField();
    this.getState();
  }

  formField() {
    this.biometricForm = this.fb.group({
      stateId: ['', Validators.required],
      districtId: ['', Validators.required],
      talukaId: ['', Validators.required],
      centerId: ['', Validators.required],
      villageId: ['', Validators.required],

      id: [0],
      schoolId: ['', Validators.required],
      deviceName: [this.data ? this.data?.deviceName : '', [Validators.required, Validators.pattern(this.validationService.alphaNumericSpecialCharOnly)]],
      m_DeviceName: [this.data ? this.data?.m_DeviceName : '', [Validators.required, Validators.pattern(this.validationService.marathiAlphaNumericSpecialChar)]],
      shortName: [this.data ? this.data?.shortName : '', [Validators.required, Validators.pattern(this.validationService.alphaNumericSpecialCharOnly)]],
      m_ShortName: [this.data ? this.data?.m_ShortName : '', [Validators.required, Validators.pattern(this.validationService.marathiAlphaNumericSpecialChar)]],
      deviceDirection: [this.data ? this.data?.deviceDirection : '', Validators.required],
      serialNumber: [this.data ? this.data?.serialNumber : '', [Validators.required, Validators.pattern(this.validationService.alphaNumericSpecialCharOnly)]],
      connectionType: [this.data ? this.data?.connectionType : '', Validators.required],
      ipAddress: [this.data ? this.data?.ipAddress : '', [Validators.required, Validators.pattern(this.validationService.IpAddress)]],
      lastPing: new Date(),
      deviceType: [this.data ? this.data?.deviceType : 'Attendance'],
      faceDeviceType: [this.data ? this.data?.faceDeviceType : '', Validators.required],
      lan: this.webStorageS.languageFlag
    })
  }

  //#region ------------------------------------------- dropdown with dependencies start here ------------------------------------------------
  getState() {
    this.masterService.getAllState('').subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.stateArr.push({ "id": 0, "state": "All", "m_State": "सर्व" }, ...res.responseData);
          this.data ? (this.f['stateId'].setValue(this.data?.stateId), this.getDistrict())   : this.loginData ? (this.f['stateId'].setValue(this.loginData?.stateId), this.getDistrict()) : this.f['stateId'].setValue(0);
        }
        else {
          this.stateArr = [];
        }
      }
    });
  }

  getDistrict() {
    this.districtArr = [];
    let stateId = this.f['stateId'].value;
    if (stateId > 0) {
      this.masterService.getAllDistrict('', stateId).subscribe({
        next: (res: any) => {
          if (res.statusCode == "200") {
            this.districtArr = res.responseData;
            this.data ? (this.f['districtId'].setValue(this.data?.districtId), this.getTaluka()) : this.loginData ? (this.f['districtId'].setValue(this.loginData?.districtId), this.getTaluka()) : this.f['districtId'].setValue(0);
          }
          else {
            this.districtArr = [];
          }
        },
      });
    } else {
      this.districtArr = [];
    }
  }

  getTaluka() {
    this.talukaArr = [];
    let districtId = this.f['districtId'].value;
    if (districtId > 0) {
      this.masterService.getAllTaluka('', districtId).subscribe({
        next: (res: any) => {
          if (res.statusCode == "200") {
            this.talukaArr = res.responseData;
            this.data ? (this.f['talukaId'].setValue(this.data?.talukaId), this.getAllCenter()) : this.loginData ? (this.f['talukaId'].setValue(this.loginData?.talukaId), this.getAllCenter()) : this.f['talukaId'].setValue(0);
          } else {
            this.talukaArr = [];
          }
        }
      });
    } else {
      this.talukaArr = [];
    }
  }

  getAllCenter() {
    this.centerArr = [];
    let id = this.f['talukaId'].value;
    if (id != 0) {
      this.masterService.getAllCenter('', id).subscribe({
        next: (res: any) => {
          if (res.statusCode == "200") {
            this.centerArr = res.responseData;
            this.data ? (this.f['centerId'].setValue(this.data?.centerId), this.getVillage()) : this.loginData ? (this.f['centerId'].setValue(this.loginData?.centerId), this.getVillage()) : this.f['centerId'].setValue(0);
          } else {
            this.centerArr = [];
          }
        }
      });
    } else {
      this.centerArr = [];
    }
  }

  getVillage() {
    this.villageArr = [];
    let Cid = this.f['centerId'].value;
    if (Cid != 0) {
      this.masterService.getAllVillage('', Cid).subscribe({
        next: (res: any) => {
          if (res.statusCode == 200) {
            this.villageArr = res.responseData;
            this.data ? (this.f['villageId'].setValue(this.data?.villageId), this.getAllSchools()) : this.loginData ? (this.f['villageId'].setValue(this.loginData?.villageId), this.getAllSchools()) : this.f['villageId'].setValue(0);
          } else {
            this.villageArr = [];
          }
        }
      });
    } else {
      this.villageArr = [];
    }
  }

  getAllSchools() {
    this.schoolArr = [];
    let Tid = this.f['talukaId'].value;
    let Cid = this.f['centerId'].value || 0;
    let Vid = this.f['villageId'].value || 0;
    if (Tid > 0 && Cid > 0 && Vid > 0) {
      this.masterService.getAllSchoolByCriteria('', Tid, Vid, Cid).subscribe({
        next: (res: any) => {
          if (res.statusCode == 200) {
            this.schoolArr = res.responseData;
            this.data ? this.f['schoolId'].setValue(this.data?.schoolId)  : this.loginData ? this.f['schoolId'].setValue(this.loginData?.schoolId) : this.f['schoolId'].setValue(0);
          } else {
            this.schoolArr = [];
          }
        }
      });
    } else {
      this.schoolArr = [];
    }
  }
  //#endregion ---------------------------------------- dropdown with dependencies end here --------------------------------------------------

  //#region ------------------------------------------- Submit and Update start here ---------------------------------------------------------
  onSubmit() {
    let formValue = this.biometricForm.value;
    let obj = {
      ... this.webStorageS.createdByProps(),
      id: this.data ? this.data?.id : 0,
      schoolId: formValue?.schoolId,
      deviceName: formValue?.deviceName,
      m_DeviceName: formValue?.m_DeviceName,
      shortName: formValue?.shortName,
      m_ShortName: formValue?.m_ShortName,
      deviceDirection: formValue?.deviceDirection,
      serialNumber: formValue?.serialNumber,
      connectionType: formValue?.connectionType,
      ipAddress: formValue?.ipAddress,
      lastPing: new Date(),
      deviceType: formValue?.deviceType,
      faceDeviceType: formValue?.faceDeviceType,
      lan: this.webStorageS.languageFlag
    }

    let str = this.data ? 'UpdateDevice' : 'AddBiometricDevice';

    if (!this.biometricForm.valid) {
        this.commonMethodS.showPopup(this.webStorageS.languageFlag == 'EN' ? 'Please Enter Mandatory Fields' : 'कृपया अनिवार्य फील्ड प्रविष्ट करा', 1);
        return
    } else {
      this.ngxSpinner.show();
      this.apiService.setHttp(this.data ? 'put' : 'post', 'zp-satara/BioMetricDevice/' + str, false, obj, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => {
          res.statusCode == "200" ? (this.commonMethodS.showPopup(res.statusMessage, 0), this.dialogRef.close('yes')) : this.commonMethodS.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethodS.showPopup(res.statusMessage, 1);
          this.ngxSpinner.hide();
        },
        error: ((err: any) => {
          this.ngxSpinner.hide();
          this.commonMethodS.checkEmptyData(err.statusMessage) == false ? this.errors.handelError(err.statusCode) : this.commonMethodS.showPopup(err.statusMessage, 1);
        })
      })
    }
  }
  //#endregion ---------------------------------------- Submit and Update end here -----------------------------------------------------------

  //#region ------------------------------------------------ onChange dropdown start here ----------------------------------------------------
  onChangeDropD(label: string) {
    switch (label) {
      case 'state':
        this.f['districtId'].setValue('');
        this.f['talukaId'].setValue('');
        this.f['centerId'].setValue('');
        this.f['villageId'].setValue('');
        this.f['schoolId'].setValue('');
        this.talukaArr = [];
        this.centerArr = [];
        this.villageArr = [];
        this.schoolArr = [];
        break;
      case 'district':
        this.f['talukaId'].setValue('');
        this.f['centerId'].setValue('');
        this.f['villageId'].setValue('');
        this.f['schoolId'].setValue('');
        this.centerArr = [];
        this.villageArr = [];
        this.schoolArr = [];
        break;
      case 'taluka':
        this.f['centerId'].setValue('');
        this.f['villageId'].setValue('');
        this.f['schoolId'].setValue('');
        this.villageArr = [];
        this.schoolArr = [];
        break;
      case 'center':
        this.f['villageId'].setValue('');
        this.f['schoolId'].setValue('');
        this.schoolArr = [];
        break;
      case 'village':
        this.f['schoolId'].setValue('');
        break;
    }
  }
  //#endregion --------------------------------------------- onChange dropdown end here ------------------------------------------------------

}
