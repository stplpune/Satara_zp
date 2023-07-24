import { Component ,Inject} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
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
    private dialogRef: MatDialogRef<AddSubCategoryComponent>,
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
    })
  }

  getCategory() {
    this.apiService.setHttp('GET', 'zp-satara/AssetSubCategory/GetAll?PageNo=1&PageSize=10', false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.categoryresp = res.responseData.responseData1;
        } else {
          this.categoryresp = [];
        }

      },
      error: ((err: any) => { this.errors.handelError(err) })
    });
  }

  onSubmit() {
    if (this.subCategoryFrm.invalid) {
      return;
    }
    
    let formData = this.subCategoryFrm.value;
    let obj = {
      "createdBy": 0,
      "modifiedBy": 0,
      "createdDate": new Date(),
      "modifiedDate": new Date(),
      "isDeleted": false,
      "id": this.editFlag ? this.editId : 0,
      "categoryId": formData.category,
      "subCategory": formData.subcategory,
      "m_SubCategory": "",
      "lan": ""
    }

    let method = this.editFlag ? 'PUT' : 'POST';
    let url = this.editFlag ? 'UpdateSubCategory' : 'AddSubCategory';
    this.apiService.setHttp(method, 'zp-satara/AssetSubCategory/'+url, false, obj, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.commonMethod.showPopup(res.statusMessage, 0);
          this.dialogRef.close('yes')
          //  this.categoryresp =res.responseData.responseData1;
        } else {
          this.commonMethod.showPopup(res.statusMessage, 0);
          // this.categoryresp = [];
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
      subcategory:this.data.subCategory
    })
  }

}
