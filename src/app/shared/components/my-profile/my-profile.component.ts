import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ApiService } from 'src/app/core/services/api.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { WebStorageService } from 'src/app/core/services/web-storage.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FileUploadService } from 'src/app/core/services/file-upload.service';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { AddUpdateAgencyRegistrationComponent } from 'src/app/modules/masters/agency-registration/add-update-agency-registration/add-update-agency-registration.component';
import { ValidationService } from 'src/app/core/services/validation.service';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { MasterService } from 'src/app/core/services/master.service'
import { MatSelectModule } from '@angular/material/select';
@Component({
  standalone: true,
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.scss'],
  imports: [
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    TranslateModule,
    CommonModule,
    MatSelectModule
  ]
})
export class MyProfileComponent {
  userProfile !: FormGroup;
  uploadImg: string = "assets/images/user.png";
  imgFlag: boolean = false;
  userType: any;
  editObj: any
  designationData = new Array();
  showButton: boolean = false;
  @ViewChild('uploadImage') imageFile!: ElementRef;

  constructor(private api: ApiService, private error: ErrorsService, private fileUpl: FileUploadService, private masterService: MasterService,
    public webStorage: WebStorageService, private fb: FormBuilder, public dialogRef: MatDialogRef<AddUpdateAgencyRegistrationComponent>,
    private commonMethods: CommonMethodsService, public validation: ValidationService) { this.dialogRef.disableClose = true }

  ngOnInit() {
    // this.getUserById();
    // this.getUser();
    this.userType = this.webStorage.getLoggedInLocalstorageData();    
    this.getUser();
    this.defaultForm();
 
  }
  get fc() { return this.userProfile.controls }

  getUserById() {
    this.api.setHttp('get', `zp-satara/app-login/GetTeacherProfile?TeacherId=${this.webStorage.getLoggedInLocalstorageData().refId}`, false, false, false, 'baseUrl');
    this.api.getHttp().subscribe({
      next: (res: any) => {
        res.statusCode == 200 ? this.defaultForm(res.responseData) : '';
      },
      error: (error: any) => {
        this.error.handelError(error.statusMessage)
      }
    })
  }

  getUserByAdmin() {
    this.api.setHttp('get', `zp-satara/user-registration/GetAdminProfile?Id=${this.webStorage.getUserId()}`, false, false, false, 'baseUrl');
    this.api.getHttp().subscribe({
      next: (res: any) => {
        res.statusCode == 200 ? this.defaultForm(res.responseData) : '';
      },
      error: (error: any) => {
        this.error.handelError(error.statusMessage)
      }
    })

  }

  getUserByOffice() {
    this.api.setHttp('get', `zp-satara/user-registration/GetOfficeProfileById?Id=${this.webStorage.getUserId()}`, false, false, false, 'baseUrl');
    this.api.getHttp().subscribe({
      next: (res: any) => {
        res.statusCode == 200 ? (this.defaultForm(res.responseData), this.editObj = res.responseData, this.getDesignation()) : '';
      },
      error: (error: any) => {
        this.error.handelError(error.statusMessage)
      }
    })
  }

  getUser() {
    let data = this.webStorage.getLoggedInLocalstorageData();
    data.userTypeId == 1 ? this.getUserByAdmin() : data.userTypeId == 4 ? this.getUserById() : this.getUserByOffice()
  }

  getDesignation() {
    let lan = this.webStorage.getLangauge();
    this.masterService.GetDesignationByLevelId(lan, this.editObj.designationLevelId).subscribe({
      next: (res: any) => {
        this.designationData = res.responseData;

      }, error: (error: any) => {
        this.error.handelError(error.statusMessage)
      }
    });
  }

  defaultForm(data?: any) {
    console.log("profile pic", data?.profilePhoto);
    
    this.userProfile = this.fb.group({
      "name": [data ? data?.name : ''],
      "mobileNo": [data ? data?.mobileNo : '', [Validators.required, Validators.pattern(this.validation.mobile_No)]],
      "emailId": [data ? data?.emailId : '', [Validators.required, Validators.pattern(this.validation.email)]],
      "profilePhoto": [data ? data?.profilePhoto : this.uploadImg],
      "designationLevelId": [data ? data?.designationId : ''],
      "subUserTypeId": [data ? data?.subUserType : '']
    })

    // image patch when its officer (not admin)
    // data && (this.webStorage.getUserTypeId() != 1) && (this.webStorage.getUserSubTypeId() != 1) ? (this.uploadImg = data?.profilePhoto, this.showButton = true) : (this.uploadImg = "assets/images/user.png", this.showButton = false)
    data && data.profilePhoto != '' ? (this.uploadImg = data?.profilePhoto, this.showButton = true) : (this.uploadImg = "assets/images/user.png", this.showButton = false)

  }


  fileUpload(event: any) {
    this.imgFlag = true;
    this.fileUpl.uploadDocuments(event, 'Upload', 'jpg, jpeg, png').subscribe((res: any) => {
      if (res.statusCode == 200) {
        this.uploadImg = res.responseData;
        console.log("upload profie",this.uploadImg);
        
        this.fc['profilePhoto'].setValue(this.uploadImg);
        this.showButton = true;
        this.commonMethods.snackBar(res.statusMessage, 0);
      } else {
        this.uploadImg = "assets/images/user.png"
      }
    });
  }

  removeImg() {
    this.imageFile.nativeElement.value = '';
    this.showButton = false;
    this.uploadImg = "assets/images/user.png"
    this.fc['profilePhoto'].setValue(this.uploadImg);
  }

  onSubmit() {
    let obj = this.userProfile.value;
    let data = this.webStorage.getLoggedInLocalstorageData();
    
    let lan = this.webStorage.getLangauge();

    let uploadData = {}
    let obj1 = {}
    if (data.userTypeId == '4') {
      uploadData = {
        "id": data.refId,
        "userTypeId": data.userTypeId,
        "subUserTypeId": data.subUserTypeId,
        "name": obj.name,
        "m_Name": obj.m_Name,
        "mobileNo": obj.mobileNo,
        "emailId": obj.emailId,
        "profilePhoto": obj.profilePhoto,
        "modifiedBy": 0,
        "modifiedDate": new Date()
      }

    } else {
      obj1 = {
        "id": data.id,
        "refId": data.refId,
        "name": obj.name,
        "m_Name": "",
        "mobileNo": obj.mobileNo,
        "emailId": obj.emailId,
        "designationId": this.editObj.designationId,
        "profilePhoto": obj.profilePhoto,
        "modifiedBy": 0,
        "modifiedDate": new Date(),
        "lan": lan
      }
    }

    if (this.userProfile.valid) {
      let headmasterStr = 'app-login/UpdateProfile'
      let officerStr = 'user-registration/UpdateOfficerProfile'
      this.api.setHttp('put', 'zp-satara/' + (data.userTypeId == '4' ? headmasterStr : officerStr), false, data.userTypeId == '4' ? uploadData : obj1, false, 'baseUrl');
      this.api.getHttp().subscribe({
        next: (res: any) => {
          res.statusCode == 200 ? (this.commonMethods.snackBar(res.statusMessage, 0), this.dialogRef.close()) : this.commonMethods.snackBar(res.statusMessage, 1);
        },
        error: (error: any) => {
          this.error.handelError(error.statusMessage)
        }
      })
    }
    else {
      this.commonMethods.snackBar(this.webStorage.languageFlag == 'EN' ? 'Please Enter Mandatory Fields' : 'कृपया अनिवार्य फील्ड प्रविष्ट करा', 1);
      return;
    }
  }
}
