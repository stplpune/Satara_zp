import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { ValidationService } from 'src/app/core/services/validation.service';
import { WebStorageService } from 'src/app/core/services/web-storage.service';

@Component({
  selector: 'app-add-category',
  templateUrl: './add-category.component.html',
  styleUrls: ['./add-category.component.scss']
})
export class AddCategoryComponent {
  // editData: any;
  
  categoryForm !:FormGroup;
  languageFlag !:string;
  editObj: any;
  // category = new FormControl('', [Validators.required]);
  // M_category = new FormControl('', [Validators.required]);
  editFlag = false;
  editId: any;
  constructor(private fb : FormBuilder,
   private apiService: ApiService,
    private commonMethod: CommonMethodsService,
    private errors: ErrorsService,
    private webStorage: WebStorageService,   
    private dialogRef: MatDialogRef<AddCategoryComponent>,
    public validators : ValidationService,
    @Inject(MAT_DIALOG_DATA) public data: any) {

  }

  ngOnInit() {
    this.languageFlag = this.webStorage.languageFlag;
    this.formData();
    this.data ? this.editData() : '';
  }

  formData(){
    this.categoryForm = this.fb.group({
      category:['',[Validators.required,Validators.pattern(this.validators.name)]],
      M_category:['',[Validators.required, Validators.pattern('^[\u0900-\u0965 ]+$')]]
    })
  }

  get f() {
    return this.categoryForm.controls;
  }
  onSubmit() {
    if (this.categoryForm.invalid) {
      return;
    } 
    let data = this.webStorage.createdByProps();
    let formData = this.categoryForm.value;
    let obj = {
      "createdBy": data.createdBy,
      "modifiedBy": data.modifiedBy,
      "createdDate": data.createdDate,
      "modifiedDate": data.modifiedDate,
      "isDeleted": data.isDeleted,
      "id":  this.editFlag?this.editId:0,
      "category": formData.category,
      "m_Category":formData.M_category,
      "lan": this.languageFlag
    }

    let method = this.editFlag ? 'PUT' : 'POST';
    let url = this.editFlag ? 'UpdateCategory' : 'AddCategory';
    this.apiService.setHttp(method, 'zp-satara/AssetCategory/'+url, false, obj, false, 'baseUrl');
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
    this.f['category'].setValue(this.data?.category)
    this.f['M_category'].setValue(this.data?.m_Category)

  }
}
