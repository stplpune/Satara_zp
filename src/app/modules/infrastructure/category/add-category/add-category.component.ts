import { Component, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { WebStorageService } from 'src/app/core/services/web-storage.service';

@Component({
  selector: 'app-add-category',
  templateUrl: './add-category.component.html',
  styleUrls: ['./add-category.component.scss']
})
export class AddCategoryComponent {
  // editData: any;
  editObj: any;
  category = new FormControl('', [Validators.required]);
  editFlag = false;
  editId: any;
  constructor(private apiService: ApiService,
    private commonMethod: CommonMethodsService,
    private errors: ErrorsService,
    private webStorage: WebStorageService,
    private dialogRef: MatDialogRef<AddCategoryComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {

  }

  ngOnInit() {
    this.data ? this.editData() : '';
  }


  onSubmit() {
    if (this.category.invalid) {
      return;
    }
    console.log(this.category.value);
    let data = this.webStorage.createdByProps();
    console.log(data);

    let formData = this.category.value;
    let obj = {
      "createdBy": data.createdBy,
      "modifiedBy": data.modifiedBy,
      "createdDate": data.createdDate,
      "modifiedDate": data.modifiedDate,
      "isDeleted": data.isDeleted,
      "id":  this.editFlag?this.editId:0,
      "category": formData,
      "m_Category": "",
      "lan": ""
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
    this.editId = this.data.id
    this.category.patchValue(this.data?.category)
  }
}
