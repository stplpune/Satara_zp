import { DatePipe } from '@angular/common';
import { Component, Inject, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { FileUploadService } from 'src/app/core/services/file-upload.service';
import { MasterService } from 'src/app/core/services/master.service';
import { ValidationService } from 'src/app/core/services/validation.service';
import { WebStorageService } from 'src/app/core/services/web-storage.service';


@Component({
  selector: 'app-add-outward-item',
  templateUrl: './add-outward-item.component.html',
  styleUrls: ['./add-outward-item.component.scss']
})
export class AddOutwardItemComponent {
  uploadImg: string = '';
  itemForm!: FormGroup;
  editFlag: boolean = false;
  editObj: any;
  categoryresp: any;
  subcategoryresp: any;
  itemresp: any;
  imageData: any;
  imgArray = new Array();
  openingStock: number = 0;
  uploadMultipleImg: any;
  currentDate = new Date();
  imgValidation: boolean = true;
  get f() { return this.itemForm.controls };
  @ViewChild('uploadImgDoc') imgDocFile!: ElementRef;

  constructor(private masterService: MasterService,
    public webStorage: WebStorageService,
    private errors: ErrorsService,
    private commonMethod: CommonMethodsService,
    private apiService: ApiService,
    public Validation: ValidationService,
    private fb: FormBuilder,
    private fileUpload: FileUploadService,
    private datePipe:DatePipe,
    private dialogRef: MatDialogRef<AddOutwardItemComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.getCategory();
    this.defaultForm();
    this.data?.label == 'Edit' ? this.editData() : '';
  }

  defaultForm() {
    let localSchoolId = this.webStorage.getLoggedInLocalstorageData();
    this.itemForm = this.fb.group({
      categoryId: ['', [Validators.required]],
      subcategoryId: ['', [Validators.required]],
      itemId: ['', [Validators.required]],
      unit: [this.editObj ? this.editObj.quantity : '', [Validators.required]],
      sellprice: [this.editObj ? this.editObj.price : '', [Validators.required,Validators.pattern(this.Validation.numericWithdecimaluptotwoDigits)]],
      date: [this.editObj ? this.editObj.purchase_Sales_Date : '', [Validators.required]],
      onwordto: [this.editObj ? this.editObj.outwardTo : '', [Validators.required]],
      remark: [this.editObj ? this.editObj.remark : ''],
      photo: [''],
      schoolId: [this.editObj ? this.editObj.schoolId : localSchoolId.schoolId],
    })
  }

  getCategory() {
    this.categoryresp = [];
    this.masterService.GetAllAssetCategory(this.webStorage.languageFlag).subscribe({
      next: ((res: any) => {
        if (res.statusCode == 200 && res.responseData.length) {
          this.categoryresp = res.responseData;
          this.editFlag ? (this.f['categoryId'].setValue(this.editObj.categoryId), this.getSubCategory(this.itemForm.value.categoryId)) : '';
        } else {
          this.categoryresp = [];
        }
      })
    })
  }

  getSubCategory(categoryId: any) {
    this.masterService.GetAssetSubCateByCateId(categoryId, '').subscribe({
      next: (res: any) => {
        if (res.statusCode == '200') {
          this.subcategoryresp = res.responseData;
          this.editFlag ? (this.f['subcategoryId'].setValue(this.editObj.subCategoryId), this.getItem(this.editObj.subCategoryId)) : '';
        } else {
          this.subcategoryresp = [];
          this.commonMethod.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethod.showPopup(res.statusMessage, 1);
          this.subcategoryresp = [];
        }
      }
    });
  }

  getItem(subcategoryId: any) {
    this.masterService.GetAllItem(subcategoryId, '').subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.itemresp = res.responseData;
          this.editFlag ? (this.f['itemId'].setValue(this.editObj.itemId), this.getOpeningStock()) : '';
        } else {
          this.itemresp = [];
        }
      }
    });
  }

  // imgUpload(event : any){
  //   let type = 'jpg, jpeg, png';
  //   this.fileUpload.uploadDocuments(event, 'Upload', type).subscribe({
  //     next: (res: any) => {
  //       if (res.statusCode == 200) {
  //         this.uploadImg = res.responseData;
  //         this.itemForm.value.photo = this.uploadImg;     
  //         this.commonMethod.showPopup(res.statusMessage, 0);
  //       }
  //       else {
  //         return
  //       }
  //     },
  //     error: ((err: any) => { err.statusCode ? this.errors.handelError(err.statusCode) : this.commonMethod.showPopup(err, 1) })
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
  //   this.itemForm.controls['photo'].setValue('');
  // }

  multipleImgUpload(event: any) {
    this.fileUpload.uploadMultipleDocument(event, 'Upload', 'jpg, jpeg, png, pdf, doc, txt').subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.uploadMultipleImg = res.responseData;
          this.imgValidation = true;
          this.commonMethod.showPopup(res.statusMessage, 0);
          let imgArr = this.uploadMultipleImg.split(',')
          for (let i = 0; i < imgArr.length; i++) {
            let data = {
              "id": 0,
              "schoolId": 0,
              "inwardOutwardId": 0,
              "type": "",
              "documentId": 0,
              "photo": imgArr[i],
              "createdby": 0
            }
            this.imgArray.push(data)
          }
        }
        else {
          this.uploadMultipleImg = '';
          this.imgDocFile.nativeElement.value = '';
        }
        this.imgArray.map((x: any) => {
          let imgPath = x.photo;
          let extension = imgPath.split('.');
          if (extension[3] == 'pdf' || extension[3] == 'doc' || extension[3] == 'txt') {
            x.docFlag = true;
          }
        });
      },
      //  error: ((err: any) => {  err.statusCode ? this.errors.handelError(err.statusCode):this.commonMethod.showPopup(err, 1) })
    });
  }

  getOpeningStock() {
    let formValue = this.itemForm.value;
    this.masterService.GetAllOpeningQty((formValue.schoolId || 0), (formValue.categoryId || 0), (formValue.subcategoryId || 0), (formValue.itemId || 0), this.webStorage.getLangauge()).subscribe({
      next: (res: any) => {
        res.statusCode == "200" ? this.openingStock = res?.responseData?.quantity : 0;
      }
    });
  }

  getUnitByQty() {
    let unit = Number(this.itemForm.value.unit);
    if ((unit) > (this.openingStock)) {
      this.f['unit'].setValue('');
      this.commonMethod.snackBar(this.webStorage.languageFlag == 'EN' ? 'Unit Should Be Less Than Opening Stock' : 'युनिट ओपनिंग स्टॉकपेक्षा कमी असावे', 1);
      return;
    }
  }

  clearMultipleImg(index: any) {
    this.imgArray.splice(index, 1);
    !this.imgArray.length ? this.imgValidation = false : '';
    this.uploadMultipleImg = '';
    this.imgDocFile.nativeElement.value = '';
  }

  onViewDoc(index: any) {
    window.open(this.imgArray[index].photo, 'blank');
  }

  onSubmit() {
    let formData = this.itemForm.getRawValue();
    let fromDate = this.datePipe.transform(formData.date, 'yyyy-MM-dd' + 'T' + 'HH:mm:ss.ms');
    !this.imgArray.length ? this.imgValidation = false : '';
    if (this.itemForm.invalid || this.imgValidation == false || formData.subcategoryId == 0 || formData.itemId == 0) {
      this.commonMethod.showPopup(this.webStorage.languageFlag == 'EN' ? 'Please Enter Mandatory Fields' : 'कृपया अनिवार्य फील्ड प्रविष्ट करा', 1);
      return;
    }
    // else if(this.openingStockFlag == true){
    //   this.commonMethod.snackBar(this.webStorage.languageFlag == 'EN' ? 'Unit Should Be Less Than Opening Stock' : 'युनिट ओपनिंग स्टॉकपेक्षा कमी असावे',1);
    //   this.openingStockFlag = true;
    //   return;
    // }
    else {
      let data = this.webStorage.createdByProps();
      let localSchoolId = this.webStorage.getLoggedInLocalstorageData();


      let obj = {
        "id": this.editObj ? this.editObj.id : 0,
        "stateId": this.editObj ? this.editObj.stateId : localSchoolId?.stateId,
        "districtId": this.editObj ? this.editObj.districtId : localSchoolId?.districtId,
        "talukaId": this.editObj ? this.editObj.talukaId : localSchoolId?.talukaId,
        "centerId": this.editObj ? this.editObj.centerId : localSchoolId?.centerId,
        "villageId": this.editObj ? this.editObj.villageId : localSchoolId?.villageId,
        "schoolId": this.editObj ? this.editObj.schoolId : localSchoolId?.schoolId,
        "categoryId": formData.categoryId,
        "subCategoryId": formData.subcategoryId,
        "itemId": formData.itemId,
        "quantity": Number(formData.unit),
        "purchase_Sales_Date": fromDate,
        "price": Number(formData.sellprice),
        "outwardTo": formData.onwordto,
        "remark": formData.remark,
        "createdDate": data.createdDate,
        "createdBy": data.createdBy,
        "moifiedDate": data.modifiedDate,
        "modifiedBy": data.modifiedBy,
        "isDeleted": data.isDeleted,
        "lan": this.webStorage.languageFlag,
        "inwardOutwardDocs": this.imgArray
      }


      let method = 'POST';
      let url = this.editFlag ? 'UpdateOutward' : 'AddOutward';
      this.apiService.setHttp(method, 'zp-satara/Outward/' + url, false, obj, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => {
          if (res.statusCode == "200") {
            this.commonMethod.showPopup(res.statusMessage, 0);
            this.dialogRef.close('yes')
          } else {
            this.commonMethod.showPopup(res.statusMessage, 1);
          }
        },
        error: ((err: any) => { this.errors.handelError(err) })
      });
    }
  }

  editData() {
    this.editFlag = true;
    this.imgArray = [];
    this.editObj = this.data;
    this.defaultForm();
    this.editObj?.inwardOutwardDocs.map((res: any) => {
      let imgObj = {
        "id": res.id,
        "schoolId": res.schoolId,
        "inwardOutwardId": res.inwardOutwardId,
        "type": res.type,
        "documentId": res.documentId,
        "photo": res.photo,
        "createdby": 0,
      }
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

  onChangeDropD(label: any) {
    if (label == 'category') {
      this.itemForm.controls['subcategoryId']?.setValue(0);
      this.itemForm.controls['itemId']?.setValue(0);
    } else if (label == 'subcategory') {
      this.itemForm.controls['itemId']?.setValue(0);
    }
  }

}
