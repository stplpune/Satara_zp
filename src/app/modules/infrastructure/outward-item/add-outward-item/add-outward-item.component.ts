import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
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
  subcategoryresp:any;
  itemresp:any;
  constructor(private masterService: MasterService,
    public webStorage: WebStorageService,
    private errors: ErrorsService,
    private commonMethod: CommonMethodsService,
    private apiService: ApiService,
    public Validation: ValidationService,
    private fb:FormBuilder,
    private dialogRef: MatDialogRef<AddOutwardItemComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.getCategory();
    this.defaultForm();
    this.data?.label=='Edit' ? this.editData():'';
  }

  defaultForm(){
    this.itemForm=this.fb.group({
      categoryId:['',[Validators.required]],
      subcategoryId:['',[Validators.required]],
      itemId:['',[Validators.required]],
      unit:['',[Validators.required]],
      sellprice:['',[Validators.required]],
      date:['',[Validators.required]],
      onwordto:['',[Validators.required]],
      remark:['',[Validators.required]],
    })
  }

  getCategory() {
    this.categoryresp = [];
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

  getSubCategory(categoryId: any) {
    this.masterService.GetAssetSubCateByCateId(categoryId, '').subscribe({
      next: (res: any) => {
        console.log(res);
        
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

  getItem(subcategoryId: any) {
    this.apiService.setHttp('GET', 'zp-satara/master/GetAllItem?SubCategoryId=' + subcategoryId + '&flag_lang=e', false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.itemresp = res.responseData;
        } else {
          this.itemresp = [];
        }
      },
      error: ((err: any) => { this.errors.handelError(err) })
    });
  }

  onSubmit() {
  
    if (this.itemForm.invalid) {
      return;
    }
    console.log(this.itemForm.value);
    
    let data = this.webStorage.createdByProps();
    let formData = this.itemForm.value;

    let obj={
      "id": 0,
      "schoolId": 0,
      "categoryId": formData.categoryId,
      "subCategoryId": formData.subcategoryId,
      "itemId":  formData.itemId,
      "quantity": Number(formData.unit),
      "purchase_Sales_Date":  formData.date,
      "price":  Number(formData.sellprice),
      "remark":  formData.remark,
      "outwardTo":formData.onwordto,
      "photo": '',
      "createdDate": data.createdDate,
      "createdBy":data.createdBy,
      "moifiedDate":data.modifiedDate,
      "modifiedBy": data.modifiedBy,
      "isDeleted": data.isDeleted,
      "lan": this.webStorage.languageFlag,
    }

    let method = this.editFlag ? 'PUT' : 'POST';
    let url = this.editFlag ? 'UpdateOutward' : 'AddOutward';
    this.apiService.setHttp(method, 'zp-satara/Outward/'+url, false, obj, false, 'baseUrl');
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

  editData(){
    this.editFlag=true;
    
  }

}
