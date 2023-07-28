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
  selector: 'app-add-item',
  templateUrl: './add-item.component.html',
  styleUrls: ['./add-item.component.scss']
})
export class AddItemComponent {
  itemForm!: FormGroup;
  editFlag: boolean = false;
  editObj: any;
  languageFlag!:string;
  categoryArr = new Array();
  subCategoryArr = new Array();

  constructor (private fb: FormBuilder, 
    private apiService: ApiService,
    public webService: WebStorageService,    
    private errors: ErrorsService,
    private masterService: MasterService,
    private commonMethods: CommonMethodsService,
    public dialogRef: MatDialogRef<AddItemComponent>,
    private ngxSpinner: NgxSpinnerService,
    public validators: ValidationService,
    @Inject(MAT_DIALOG_DATA) public data: any){}

 

  ngOnInit(): void {   
    this.languageFlag = this.webService.languageFlag;
    this.formData();
    this.getAllCategory();
  }

  get f() {
    return this.itemForm.controls;
  }

  formData(){
    this.itemForm = this.fb.group({
        "id": [this.data?.id ||0],
        "categoryId": ['',[Validators.required]],
        "category": [this.data?.category ||''],
        "m_Category": [this.data?.m_Category ||''],
        "subCategoryId": ['',[Validators.required]],
        "subCategory": [this.data?.subCategory ||''],
        "m_SubCategory": [this.data?.m_SubCategory ||''],
        "itemName": [this.data?.itemName ||'',[Validators.required,Validators.pattern(this.validators.name)]],
        "m_ItemName": [this.data?.m_ItemName ||''],
        "description": [this.data?.description ||'',[Validators.required,Validators.pattern(this.validators.name)]],
        "createdBy": [0],
        "isDeleted": true,
        "lan": [this.data?.lan ||'EN']
      
    })

  }

  getAllCategory() {
    this.categoryArr = [];
    this.masterService.GetAllAssetCategory(this.languageFlag).subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.categoryArr= res.responseData;
          this.data ? (this.f['categoryId'].setValue(this.data.categoryId),this.getAllSubCategory()):'';
        } else {
          this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
          this.categoryArr = [];
        }
      },
      error: ((err: any) => { this.errors.handelError(err.statusCode) })
    });
  }

  getAllSubCategory() {
    let catId = this.itemForm.value.categoryId; 
    this.subCategoryArr = [];
    this.masterService.GetAssetSubCateByCateId(catId,this.languageFlag).subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.subCategoryArr= res.responseData;
          this.data ? this.f['subCategoryId'].setValue(this.data.subCategoryId):'';
        } else {
          this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
          this.subCategoryArr = [];
        }
      },
      error: ((err: any) => { this.errors.handelError(err.statusCode) })
    });
  }

  onSubmit(){
    let postData = this.itemForm.value;
    if(this.itemForm.invalid){
      return;
    }else{
      this.ngxSpinner.show();
      let url = this.data ? 'UpdateItem' : 'AddItemMaster'
      this.apiService.setHttp('post', 'zp-satara/ItemMaster/' + url, false, postData, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => {
          if (res.statusCode == 200) {
            this.ngxSpinner.hide();
            this.commonMethods.showPopup(res.statusMessage, 0);
            this.dialogRef.close('yes')
     
          } else {
            this.ngxSpinner.hide();
            this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
          }
        },
        error: ((err: any) => {  this.errors.handelError(err.statusCode) })
      });
    }   
  }

  clearDropdown(dropdown: string) {   
    if (dropdown == 'categoryId') {
      this.itemForm.controls['subCategoryId'].setValue('');  
      this.data.subCategoryId = ''   
      this.subCategoryArr = [];
    }
  }
}
