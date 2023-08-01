import { Component, Inject } from '@angular/core';
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
  subcategoryresp:any;
  itemresp:any;
  openingStock : number = 0;
  openingStockFlag : boolean = true;
  get f(){ return this.itemForm.controls };

  constructor(private masterService: MasterService,
    public webStorage: WebStorageService,
    private errors: ErrorsService,
    private commonMethod: CommonMethodsService,
    private apiService: ApiService,
    public Validation: ValidationService,
    private fb:FormBuilder,
    private fileUpload : FileUploadService,
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
      unit:[this.editObj ? this.editObj.quantity : '',[Validators.required]],
      sellprice:[this.editObj ? this.editObj.price : '',[Validators.required]],
      date:[this.editObj ? this.editObj.purchase_Sales_Date : '',[Validators.required]],
      onwordto:[this.editObj ? this.editObj.outwardTo : '',[Validators.required]],
      remark:[this.editObj ? this.editObj.remark : ''],
      photo: [''],
      schoolId: [this.editObj ? this.editObj.schoolId : 2104],
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
          this.editFlag ? (this.f['subcategoryId'].setValue(this.editObj.subCategoryId), this.getItem(categoryId)) : '';
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
          this.editFlag ? (this.f['itemId'].setValue(this.editObj.itemId)) : '';
        } else {
          this.itemresp = [];
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
          this.commonMethod.showPopup(res.statusMessage, 0);
        }
        else {
          return
        }
      },
      error: ((err: any) => { err.statusCode ? this.errors.handelError(err.statusCode) : this.commonMethod.showPopup(err, 1) })
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
    this.itemForm.controls['photo'].setValue('');
  }

  getOpeningStock(){
    let formValue = this.itemForm.value;
    this.masterService.GetAllOpeningQty((formValue.schoolId || 0), (formValue.categoryId || 0), (formValue.subCategoryId || 0), (formValue.itemId || 0), this.webStorage.getLangauge()).subscribe({
      next : (res : any)=>{
        res.statusCode == "200" ? this.openingStock = res?.responseData?.quantity : 0;
      }
    });  
  }

  getUnitByQty(){
    if(this.openingStock < this.itemForm.value.unit){
      this.openingStockFlag = false;
      return
    }
  }

  onSubmit() {
    if (this.itemForm.invalid && this.openingStockFlag == false) {
      this.commonMethod.showPopup(this.webStorage.languageFlag == 'EN' ? 'Please Enter Mandatory Fields' : 'कृपया अनिवार्य फील्ड प्रविष्ट करा', 1);
      return;
    }
    let data = this.webStorage.createdByProps();
    let formData = this.itemForm.value;

    let obj={
      "id": this.editObj ? this.editObj.id : 0,
      "schoolId": this.editObj ? this.editObj.schoolId : 2104,
      "categoryId": formData.categoryId,
      "subCategoryId": formData.subcategoryId,
      "itemId":  formData.itemId,
      "quantity": Number(formData.unit),
      "purchase_Sales_Date":  formData.date,
      "price":  Number(formData.sellprice),
      "remark":  formData.remark,
      "outwardTo":formData.onwordto,
      "photo": this.uploadImg,
      "createdDate": data.createdDate,
      "createdBy":data.createdBy,
      "moifiedDate":data.modifiedDate,
      "modifiedBy": data.modifiedBy,
      "isDeleted": data.isDeleted,
      "lan": this.webStorage.languageFlag,
    }

    let method = 'POST';
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
    this.editObj = this.data;
    this.defaultForm();
    this.uploadImg = this.editObj.photo;
  }

}
