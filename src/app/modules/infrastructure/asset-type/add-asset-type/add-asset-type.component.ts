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
  editData: any;
  editObj: any;
  categoryresp:any;
  subcategoryresp:any;
  assetTypeFrm!: FormGroup;
  constructor(private fb: FormBuilder,
    private apiService:ApiService,
    private commonMethod:CommonMethodsService,
    private errors:ErrorsService,
    private webStorage:WebStorageService,
    private masterService:MasterService,
    private dialogRef: MatDialogRef<AddAssetTypeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.defaultFrom();
    this.getCategory();
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
      }), error: (error: any) => {
        this.errors.handelError(error.statusCode)
      }
    })
  }

  getSubCategory(categoryId:any) {
    this.apiService.setHttp('get', 'zp-satara/master/GetAllAssetSubCategory?CategoryId='+categoryId+'&flag_lang=m', false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        console.log(res);
        if (res.statusCode == "200") {
          this.subcategoryresp = res.responseData;
        } else {
          this.subcategoryresp = [];
        }
      },
      error: ((err: any) => { this.errors.handelError(err) })
    });

  }



  onSubmit() {
    if (this.assetTypeFrm.invalid) {
      return;
    }
    console.log(this.assetTypeFrm.value);
    let data = this.webStorage.createdByProps();
    console.log(data);
    let formData=this.assetTypeFrm.value;
    let obj={
      "createdBy": data.createdBy,
      "modifiedBy": data.modifiedBy,
      "createdDate":  data.createdDate,
      "modifiedDate": data.modifiedDate,
      "isDeleted":  data.isDeleted,
      "id": 0,
      "categoryId": formData.category,
      "subCategoryId": formData.subCategory,
      "type":formData.assetType,
      "m_Type": "",
      "lan": ""
    }

    // let method = this.editFlag ? 'PUT' : 'POST';
    // let url = this.editFlag ? 'UpdateCategory' : 'AddCategory';
    this.apiService.setHttp('post', 'zp-satara/AssetType/AddType', false, obj, false, 'baseUrl');
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

  // onSubmit() {
  //   if (this.category.invalid) {
  //     return;
  //   }
  //   console.log(this.category.value);
  //   let data = this.webStorage.createdByProps();
  //   console.log(data);

  //   let formData = this.category.value;
  //   let obj = {
  //     "createdBy": data.createdBy,
  //     "modifiedBy": data.modifiedBy,
  //     "createdDate": data.createdDate,
  //     "modifiedDate": data.modifiedDate,
  //     "isDeleted": data.isDeleted,
  //     "id":  this.editFlag?this.editId:0,
  //     "category": formData,
  //     "m_Category": "",
  //     "lan": ""
  //   }

  //   let method = this.editFlag ? 'PUT' : 'POST';
  //   let url = this.editFlag ? 'UpdateCategory' : 'AddCategory';
  //   this.apiService.setHttp(method, 'zp-satara/AssetCategory/'+url, false, obj, false, 'baseUrl');
  //   this.apiService.getHttp().subscribe({
  //     next: (res: any) => {
  //       if (res.statusCode == "200") {
  //         this.commonMethod.showPopup(res.statusMessage, 0);
  //         this.dialogRef.close('yes');
  //       } else {
  //         this.commonMethod.showPopup(res.statusMessage, 1);
  //       }

  //     },
  //     error: ((err: any) => { this.errors.handelError(err) })
  //   });
  // }


}
