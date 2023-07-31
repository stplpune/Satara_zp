import { Component ,Inject} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { MasterService } from 'src/app/core/services/master.service';
import { ValidationService } from 'src/app/core/services/validation.service';
import { WebStorageService } from 'src/app/core/services/web-storage.service';
// import { AddUpdateDesignationMasterComponent } from 'src/app/modules/masters/designation-master/add-update-designation-master/add-update-designation-master.component';

@Component({
  selector: 'app-add-sub-category',
  templateUrl: './add-sub-category.component.html',
  styleUrls: ['./add-sub-category.component.scss']
})
export class AddSubCategoryComponent {
  editFlag=false;
  editId:any;
  editObj: any;
  subCategoryFrm!: FormGroup;
  categoryresp: any;

  constructor(private fb: FormBuilder,
    private apiService: ApiService,
    private errors: ErrorsService,
    private commonMethod: CommonMethodsService,
    private masterService:MasterService,
    private dialogRef: MatDialogRef<AddSubCategoryComponent>,
    public webStorage:WebStorageService,
    public validation:ValidationService,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.defaultForm();
    this.getCategory();
    this.data?.label=='Edit' ? this.editData():'';
    
  }

  defaultForm() {
    this.subCategoryFrm = this.fb.group({
      category: ['', [Validators.required]],
      subcategory: ['', [Validators.required]],
      m_subcategory: ['',[Validators.required, Validators.pattern('^[\u0900-\u0965 ]+$')]],
    })
  }

  get f() {
    return this.subCategoryFrm.controls;
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


  onSubmit() {
    if (this.subCategoryFrm.invalid) {
      return;
    }
    let data = this.webStorage.createdByProps();
    let formData = this.subCategoryFrm.value;
    let obj = {
      "createdBy":data.createdBy,
      "modifiedBy":data.modifiedBy,
      "createdDate": data.createdDate,
      "modifiedDate": data.modifiedDate,
      "isDeleted": data.isDeleted,
      "id": this.editFlag ? this.editId : 0,
      "categoryId": formData.category,
      "subCategory": formData.subcategory,
      "m_SubCategory": formData.m_subcategory,
      "lan": this.webStorage.languageFlag,
    }

    let method = this.editFlag ? 'PUT' : 'POST';
    let url = this.editFlag ? 'UpdateSubCategory' : 'AddSubCategory';
    this.apiService.setHttp(method, 'zp-satara/AssetSubCategory/'+url, false, obj, false, 'baseUrl');
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
    this.editId=this.data.id
    this.subCategoryFrm.patchValue({
      category:this.data.categoryId,
      subcategory:this.data.subCategory,
      m_subcategory:this.data.m_SubCategory
    })
  }

}
