import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { MasterService } from 'src/app/core/services/master.service';
import { WebStorageService } from 'src/app/core/services/web-storage.service';

@Component({
  selector: 'app-add-asset',
  templateUrl: './add-asset.component.html',
  styleUrls: ['./add-asset.component.scss']
})
export class AddAssetComponent {
  editData:any;
  editObj:any;
  categoryArr = new Array();
  subCategoryArr = new Array();
  assetTypeArr = new Array();
  assetRegForm! : FormGroup;
  languageFlag!: string;
  
  constructor(private masterService: MasterService,
              private commonMethods: CommonMethodsService,
              private errorService: ErrorsService,
              private fb: FormBuilder,
              private webService: WebStorageService,
              private ngxSpinner: NgxSpinnerService,
              private apiService: ApiService,
              public dialogRef: MatDialogRef<AddAssetComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any){}

  ngOnInit(){
    this.webService.langNameOnChange.subscribe(lang => {
      this.languageFlag = lang;
    });

    this.defaultAssetRegForm();
    this.getCategoryDrop();
  }

  defaultAssetRegForm() {
    this.assetRegForm = this.fb.group({
      ... this.webService.createdByProps(),
      "id": [0],
      "categoryId": ['' , [Validators.required]],
      "subCategoryId": ['', [Validators.required]],
      "typeId": ['', [Validators.required]],
      "brand": ['', [Validators.required]],
      "quantity": ['', [Validators.required]],
      "description": ['', [Validators.required]],
      "lan": ['']
    });
  }

  getCategoryDrop(){
    this.categoryArr = [];
    this.masterService.GetAllAssetCategory('').subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.categoryArr.push(...res.responseData);
        } else {
          this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errorService.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
          this.categoryArr = [];
        }
      }
    });

  }

  getSubCategoryDrop(){
    this.subCategoryArr = [];
    this.masterService.GetAssetSubCateByCateId(this.assetRegForm.value.categoryId,'').subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.subCategoryArr.push(...res.responseData);
        } else {
          this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errorService.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
          this.subCategoryArr = [];
        }
      }
    });

  }

  getAssetTypeDrop(){
    this.assetTypeArr = [];
    this.masterService.GetAllAssetType(this.assetRegForm.value.subCategoryId, '').subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.assetTypeArr.push(...res.responseData);
        } else {
          this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errorService.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
          this.assetTypeArr = [];
        }
      }
    });

  }

  submitData() {
    let formData = this.assetRegForm.value;
    if (!this.assetRegForm.valid) {
      return
    }
    else{
      this.ngxSpinner.show();
        this.apiService.setHttp(this.data ? 'put' : 'post', 'zp-satara/Asset/' + (this.data ? 'UpdateAsset' : 'AddAsset'), false, formData, false, 'baseUrl');
        this.apiService.getHttp().subscribe({
          next: (res: any) => {
            this.apiService.staticData.next('getRefreshStaticdata');
            res.statusCode == 200 ? (this.commonMethods.showPopup(res.statusMessage, 0), this.dialogRef.close('Yes'), this.ngxSpinner.hide()) : (this.commonMethods.showPopup(res.statusMessage, 1), this.ngxSpinner.hide());
            res.statusMessage == "MobileNo Already Exist." ? this.ngxSpinner.hide() : ''
          },
          error: ((err: any) => { this.errorService.handelError(err) })
        })
      // else  (this.agencyRegisterForm.invalid) {
      //   this.common.showPopup(this.webStorageService.languageFlag == 'EN' ? 'Please Enter Mandatory Fields' : 'कृपया अनिवार्य फील्ड प्रविष्ट करा', 1);
      //   this.ngxSpinner.hide();
      //   return;
      // }
  
    }
  }

  clearDrop(flag?: string){
    switch(flag){
      case 'category':
        this.assetRegForm.controls['subCategoryId'].setValue('');
        this.assetRegForm.controls['typeId'].setValue('');
        break;
        case 'subCategory':
          this.assetRegForm.controls['typeId'].setValue('')
    }

  }

}
