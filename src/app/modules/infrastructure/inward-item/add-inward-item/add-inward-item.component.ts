import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { FileUploadService } from 'src/app/core/services/file-upload.service';
import { MasterService } from 'src/app/core/services/master.service';
import { ValidationService } from 'src/app/core/services/validation.service';
import { WebStorageService } from 'src/app/core/services/web-storage.service';
import { AddUpdateSchoolRegistrationComponent } from 'src/app/modules/masters/school-registration/add-update-school-registration/add-update-school-registration.component';

@Component({
  selector: 'app-add-inward-item',
  templateUrl: './add-inward-item.component.html',
  styleUrls: ['./add-inward-item.component.scss']
})
export class AddInwardItemComponent {
  uploadImg: string = '';
  itemForm!: FormGroup;
  editFlag: boolean = false;
  editObj: any;
  categoryArr = new Array();
  subCategoryArr = new Array();
  itemArr = new Array();
  imgValidation : boolean = true;
  get f() { return this.itemForm.controls };

  constructor(private fb: FormBuilder,
    private commonMethodS: CommonMethodsService,
    private masterService: MasterService,
    private errors: ErrorsService,
    public webStorageS: WebStorageService, 
    private fileUpload : FileUploadService,
    private ngxSpinner: NgxSpinnerService,
    private apiService: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<AddUpdateSchoolRegistrationComponent>,
    public validationService : ValidationService) { }

  ngOnInit() {
    this.formFeild();
    this.getCategoryDrop();
    this.data ? this.onEdit() : '';
  }

  formFeild() {
    this.itemForm = this.fb.group({
      "id": [this.editObj ? this.editObj.id : 0],
      "schoolId": [this.editObj ? this.editObj.schoolId : 2104],
      "categoryId": ['', Validators.required],
      "subCategoryId": ['', Validators.required],
      "itemId": ['', Validators.required],
      "quantity": [this.editObj ? this.editObj.quantity : '', [Validators.required]],
      "purchase_Sales_Date": [this.editObj ? this.editObj.purchase_Sales_Date : '', Validators.required],
      "price": [this.editObj ? this.editObj.price : '', [Validators.required]],
      "remark": [this.editObj ? this.editObj.remark : ''],
      "photo": [this.editObj ? this.editObj.photo : ''],
      "lan": this.webStorageS.languageFlag,
      ...this.webStorageS.createdByProps()
    })
  }

  getCategoryDrop() {
    this.categoryArr = [];
    this.masterService.GetAllAssetCategory('').subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.categoryArr.push({ "id": 0, "category": "All", "m_Category": "सर्व" }, ...res.responseData);
          this.editFlag ? (this.f['categoryId'].setValue(this.editObj.categoryId), this.getSubCategoryDrop()) : '';
        } else {
          this.commonMethodS.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethodS.showPopup(res.statusMessage, 1);
          this.categoryArr = [];
        }
      }
    });
  }

  getSubCategoryDrop() {
    this.subCategoryArr = [];
    this.masterService.GetAssetSubCateByCateId(this.itemForm.value.categoryId, '').subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.subCategoryArr.push({ "id": 0, "subCategory": "All", "m_SubCategory": "सर्व" }, ...res.responseData);
          this.editFlag ? (this.f['subCategoryId'].setValue(this.editObj.subCategoryId), this.getItemDrop()) : '';
        } else {
          this.commonMethodS.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethodS.showPopup(res.statusMessage, 1);
          this.subCategoryArr = [];
        }
      }
    });
  }

  getItemDrop() {
    this.itemArr = [];
    this.masterService.GetAllItem(this.itemForm.value.subCategoryId, '').subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.itemArr.push({ "id": 0, "item": "All", "m_Item": "सर्व" }, ...res.responseData);
          this.editFlag ? (this.f['itemId'].setValue(this.editObj.itemId)) : '';
        } else {
          this.commonMethodS.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethodS.showPopup(res.statusMessage, 1);
          this.itemArr = [];
        }
      }
    });
  }
  
  imgUpload(event : any){
    let type = 'jpg, jpeg, png';
    this.fileUpload.uploadDocuments(event, 'Upload', type).subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.uploadImg = res.responseData;
          this.itemForm.value.photo = this.uploadImg;     
          this.commonMethodS.showPopup(res.statusMessage, 0);
        }
        else {
          return
        }
      },
      error: ((err: any) => { err.statusCode ? this.errors.handelError(err.statusCode) : this.commonMethodS.showPopup(err, 1) })
    });
  }

  viewImg() {
    if (this.editFlag == true) {
      let viewImg = this.editObj.photo;
      this.uploadImg ? window.open(this.uploadImg, 'blank') : window.open(viewImg, 'blank')
    }
    else {
      window.open(this.uploadImg, 'blank');
    }
  }

  clearImg() {   
    this.uploadImg = '';
    this.itemForm.value.photo = '';
    this.f['photo'].setValue('');
    // this.editObj.photo = '';
  }

  onSubmit(){
    let formValue = this.itemForm.value;
    formValue.price = Number(formValue?.price);
    formValue.quantity = Number(formValue?.quantity);
    formValue.photo ? formValue.photo = this.uploadImg : this.imgValidation = false;
    formValue.photo = this.itemForm.value.photo;

    let url = this.editObj ? 'UpdateInward' : 'AddInward'
    if (!this.itemForm.valid) {
      this.commonMethodS.showPopup(this.webStorageS.languageFlag == 'EN' ? 'Please Enter Mandatory Fields' : 'कृपया अनिवार्य फील्ड प्रविष्ट करा', 1);
      return
    }
    else {
      this.ngxSpinner.show();
      this.apiService.setHttp(this.editObj ? 'put' : 'post', 'zp-satara/Inward/' + url, false, formValue, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => {
          this.ngxSpinner.hide();
          this.apiService.staticData.next('getRefreshStaticdata');
          res.statusCode == 200 ? (this.commonMethodS.showPopup(res.statusMessage, 0)) : this.commonMethodS.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethodS.showPopup(res.statusMessage, 1);
          res.statusCode == 200 ? this.dialogRef.close('yes') : this.ngxSpinner.hide();
        },
        error: ((err: any) => {
          this.ngxSpinner.hide();
          this.commonMethodS.checkEmptyData(err.statusMessage) == false ? this.errors.handelError(err.statusCode) : this.commonMethodS.showPopup(err.statusMessage, 1);
        })
      });
    }
  }

  onEdit(){
    this.editFlag = true;
    this.editObj = this.data;
    this.formFeild();
    this.uploadImg = this.editObj.photo;
  }

  onChangeDropD(label: string) {
    switch (label) {
      case 'category':
        this.f['subCategoryId'].setValue(0);
        this.itemArr = [];
        break;
      case 'subCategory':
        this.f['itemId'].setValue(0);
        break;
    }
  }
}
