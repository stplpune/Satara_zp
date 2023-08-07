import { DatePipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  imgValidation: boolean = true;
  openingStock: number = 0;
  openingStockFlag: boolean = false;
  uploadMultipleImg: any;
  imgArray = new Array();
  get f() { return this.itemForm.controls };
  currentDate = new Date();

  constructor(private fb: FormBuilder,
    private commonMethodS: CommonMethodsService,
    private masterService: MasterService,
    private errors: ErrorsService,
    public webStorageS: WebStorageService,
    private fileUpload: FileUploadService,
    private ngxSpinner: NgxSpinnerService,
    private apiService: ApiService,
    private datePipe:DatePipe,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<AddUpdateSchoolRegistrationComponent>,
    public validationService: ValidationService) { }

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
      inwardOutwardDocs: this.fb.array([
        this.fb.group({
          "id": 0,
          "schoolId": 0,
          "inwardOutwardId": 0,
          "type": "string",
          "documentId": 0,
          "photo": "string",
          "createdby": 0
        })
      ]),
      ...this.webStorageS.createdByProps()
    })
  }

  get multipleImg(): FormArray {
    return this.itemForm.get('inwardOutwardDocs') as FormArray;
  }

  getCategoryDrop() {
    this.categoryArr = [];
    this.masterService.GetAllAssetCategory('').subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.categoryArr = res.responseData;
          this.editFlag && this.editObj ? (this.f['categoryId'].setValue(this.editObj.categoryId), this.getSubCategoryDrop()) : '';
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
        if (res.statusCode == "200") {
          this.subCategoryArr = res.responseData;
          this.editFlag && this.editObj ? (this.f['subCategoryId'].setValue(this.editObj.subCategoryId), this.getItemDrop()) : '';
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
          this.itemArr = res.responseData;
          this.editFlag && this.editObj ? (this.f['itemId'].setValue(this.editObj.itemId), this.getOpeningStock()) : '';
        } else {
          this.commonMethodS.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethodS.showPopup(res.statusMessage, 1);
          this.itemArr = [];
        }
      }
    });
  }

  multipleImgUpload(event: any) {
    this.fileUpload.uploadMultipleDocument(event, 'Upload', 'jpg, jpeg, png, pdf, doc, txt').subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.uploadMultipleImg = res.responseData;
          this.imgValidation = true;
          this.commonMethodS.showPopup(res.statusMessage, 0);
          // multiple image 
          let imgArr = this.uploadMultipleImg.split(',')
          for (let i = 0; i < imgArr.length; i++) {
            let data = {
              "id": 0,
              "schoolId": 0,
              "inwardOutwardId": 0,
              "type": "string",
              "documentId": 0,
              "photo": imgArr[i],
              "createdby": 0
            }
            this.imgArray.push(data)
          }
        }
        else {
          return
        }

        this.imgArray.map((x: any) => {
          let imgPath = x.photo;
          let extension = imgPath.split('.');
          if (extension[3] == 'pdf' || extension[3] == 'doc' || extension[3] == 'txt') {
            x.docFlag = true;
          }
        });
      },
    });
  }

  // imgUpload(event: any) {
  //   let type = 'jpg, jpeg, png';
  //   this.fileUpload.uploadDocuments(event, 'Upload', type).subscribe({
  //     next: (res: any) => {
  //       if (res.statusCode == 200) {
  //         this.uploadImg = res.responseData;
  //         this.itemForm.value.photo = this.uploadImg;
  //         this.commonMethodS.showPopup(res.statusMessage, 0);
  //       }
  //       else {
  //         return
  //       }
  //     },
  //     error: ((err: any) => { err.statusCode ? this.errors.handelError(err.statusCode) : this.commonMethodS.showPopup(err, 1) })
  //   });
  // }

  // viewImg() {
  //   if (this.editFlag == true) {
  //     let viewImg = this.editObj.photo;
  //     this.uploadImg ? window.open(this.uploadImg, 'blank') : window.open(viewImg, 'blank')
  //   }
  //   else {
  //     window.open(this.uploadImg, 'blank');
  //   }
  // }

  // clearImg() {
  //   this.uploadImg = '';
  //   this.itemForm.value.photo = '';
  //   this.f['photo'].setValue('');
  // }

  onViewDoc(index: any) {
    window.open(this.imgArray[index].photo, 'blank');
  }

  clearMultipleImg(index: any) {
    this.imgArray.splice(index, 1);
    !this.imgArray.length ? this.imgValidation = false : '';
  }

  getOpeningStock() {
    let formValue = this.itemForm.value;
    this.masterService.GetAllOpeningQty((formValue.schoolId || 0), (formValue.categoryId || 0), (formValue.subCategoryId || 0), (formValue.itemId || 0), this.webStorageS.getLangauge()).subscribe({
      next: (res: any) => {
        res.statusCode == "200" ? this.openingStock = res?.responseData?.quantity : 0;
      }
    });
  }

  getUnitByQty() {
    let unit = Number(this.itemForm.value.quantity);
    if (unit <= 0) {
      this.openingStockFlag = true;
      this.f['quantity'].setValue('');
      this.commonMethodS.snackBar(this.webStorageS.languageFlag == 'EN' ? 'Unit Should Be Greater Than 0' : 'युनिट 0 पेक्षा जास्त असावे', 1);
      return;
    }
  }

  onSubmit() {
    let formValue = this.itemForm.value;
    formValue.purchase_Sales_Date = this.datePipe.transform(formValue.purchase_Sales_Date, 'yyyy-MM-dd' + 'T' + 'HH:mm:ss.ms');
    formValue.price = Number(formValue?.price);
    formValue.quantity = Number(formValue?.quantity);
    // formValue.photo ? formValue.photo = this.uploadImg : this.imgValidation = false;
    // formValue.photo = this.itemForm.value.photo;

    !this.imgArray.length ? this.imgValidation = false : '';
    formValue.inwardOutwardDocs = this.imgArray;

    let url = this.editObj ? 'UpdateInward' : 'AddInward'
    if (!this.itemForm.valid || this.openingStockFlag == true || this.imgValidation == false || formValue.subCategoryId == 0 || formValue.itemId == 0) {
      this.commonMethodS.showPopup(this.webStorageS.languageFlag == 'EN' ? 'Please Enter Mandatory Fields' : 'कृपया अनिवार्य फील्ड प्रविष्ट करा', 1);
      return
    }
    else {
      this.ngxSpinner.show();
      this.apiService.setHttp('post', 'zp-satara/Inward/' + url, false, formValue, false, 'baseUrl');
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

  onEdit() {
    this.editFlag = true;
    this.editObj = this.data;
    this.formFeild();
    // this.uploadImg = this.editObj.photo;

    this.data?.inwardOutwardDocs?.map((res: any) => {
      let imgObj = {
        "id": res.id,
        "schoolId": res.schoolId,
        "inwardOutwardId": res.inwardOutwardId,
        "type": res.type,
        "documentId": res.documentId,
        "photo": res.photo,
        "createdby": 0
      };
      this.imgArray.push(imgObj);
    });

    this.imgArray.map((x: any) => {
      let imgPath = x.photo;
      let extension = imgPath.split('.');
      if (extension[3] == 'pdf' || extension[3] == 'doc' || extension[3] == 'txt') {
        x.docFlag = true;
      }
    });
  }

  onChangeDropD(label: string) {
    switch (label) {
      case 'category':
        this.f['subCategoryId'].setValue('');
        this.f['itemId'].setValue('');
        this.itemArr = [];
        this.editObj ? this.editObj.subCategoryId = null : '';
        this.editObj ? this.editObj.itemId = null : '';
        break;
      case 'subCategory':
        this.f['itemId'].setValue('');
        this.editObj ? this.editObj.itemId = null : '';
        break;
    }
  }

}
