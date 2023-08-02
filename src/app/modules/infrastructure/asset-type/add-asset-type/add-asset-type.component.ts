import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { MasterService } from 'src/app/core/services/master.service';
import { WebStorageService } from 'src/app/core/services/web-storage.service';

@Component({
  selector: 'app-add-asset-type',
  templateUrl: './add-asset-type.component.html',
  styleUrls: ['./add-asset-type.component.scss']
})
export class AddAssetTypeComponent {

  editObj: any;
  categoryresp: any;
  subcategoryresp: any;
  assetTypeFrm!: FormGroup;
  editFlag: boolean = false;
  editId: any;
  constructor(private fb: FormBuilder,
    private apiService: ApiService,
    private commonMethod: CommonMethodsService,
    private errors: ErrorsService,
    private webStorage: WebStorageService,
    private masterService: MasterService,
    private dialogRef: MatDialogRef<AddAssetTypeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.defaultFrom();
    this.getCategory();
    this.data ? this.editData() : '';
  }

  defaultFrom() {
    this.assetTypeFrm = this.fb.group({
      category: ['', [Validators.required]],
      subCategory: ['', [Validators.required]],
      assetType: ['', [Validators.required]],
    })
  }

  getCategory() {
    // this.categoryresp = [];
    this.masterService.GetAllAssetCategory(this.webStorage.languageFlag).subscribe({
      next: ((res: any) => {

        if (res.statusCode == 200 && res.responseData.length) {
          this.categoryresp = res.responseData;
        } else {
          this.categoryresp = [];
        }
      }),
      //  error: (error: any) => {
      //   this.errors.handelError(error.statusCode)}
    })
  }

  // getSubCategory(categoryId: any) {
  //   this.apiService.setHttp('get', 'zp-satara/master/GetAllAssetSubCategory?CategoryId=' + categoryId + '&flag_lang=m', false, false, false, 'baseUrl');
  //   this.apiService.getHttp().subscribe({
  //     next: (res: any) => {
  //       if (res.statusCode == "200") {
  //         this.subcategoryresp = res.responseData;
  //       } else {
  //         this.subcategoryresp = [];
  //       }
  //     },
  //     error: ((err: any) => { this.errors.handelError(err) })
  //   });

  // }
  getSubCategory(categoryId: any) {
    this.masterService.GetAssetSubCateByCateId(categoryId, '').subscribe({
      next: (res: any) => {
        if (res.statusCode == '200') {
          this.subcategoryresp = res.responseData;
        } else {
          this.subcategoryresp = [];
          this.commonMethod.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethod.showPopup(res.statusMessage, 1);
          this.subcategoryresp = [];
        }
      }
    });
  }



  onSubmit() {
    if (this.assetTypeFrm.invalid) {
      return;
    }
    let data = this.webStorage.createdByProps();
    let formData = this.assetTypeFrm.value;
    let obj = {
      "createdBy": data.createdBy,
      "modifiedBy": data.modifiedBy,
      "createdDate": data.createdDate,
      "modifiedDate": data.modifiedDate,
      "isDeleted": data.isDeleted,
      "id": this.editFlag ? this.editId : 0,
      "categoryId": formData.category,
      "subCategoryId": formData.subCategory,
      "type": formData.assetType,
      "m_Type": "",
      "lan": ""
    }

    let method = this.editFlag ? 'PUT' : 'POST';
    let url = this.editFlag ? 'UpdateType' : 'AddType';
    this.apiService.setHttp(method, 'zp-satara/AssetType/' + url, false, obj, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.commonMethod.showPopup(res.statusMessage, 0);
          this.dialogRef.close('yes');
        } else {
          this.commonMethod.showPopup(res.statusMessage, 1);
        }
      },
      error: ((err: any) => { this.errors.handelError(err) })
    });

  }

  editData() {
    this.editFlag = true;
    this.editId = this.data.id;
    this.assetTypeFrm.patchValue({
      category: this.data.categoryId,
      subCategory: this.data.subCategoryId,
      assetType: this.data.type,
    })
    this.getSubCategory(this.data.categoryId);
  }

  clearDrop(flag?: string) {
    if (flag == 'category') {
      this.assetTypeFrm.controls['subCategory'].setValue(0);
    } 
    
  }


}
