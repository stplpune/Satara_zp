import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { WebStorageService } from 'src/app/core/services/web-storage.service';

@Component({
  selector: 'app-add-tasksheet',
  templateUrl: './add-tasksheet.component.html',
  styleUrls: ['./add-tasksheet.component.scss']
})
export class AddTasksheetComponent {
  editFlag:any;
  attendenceForm !: FormGroup;
 
  constructor(private fb:FormBuilder,
    private webStorage:WebStorageService,
    private apiService:ApiService,
    private commonMethod:CommonMethodsService,
    private dialogRef: MatDialogRef<AddTasksheetComponent>,
    private errors:ErrorsService,
    ){}

  ngOnInit(){
    this.defaultForm();
  }

  defaultForm(){
    this.attendenceForm=this.fb.group({
      remark:['',[Validators.required]]
    })
  }


  onSubmit() {
    console.log(this.attendenceForm.value);
    
    if (this.attendenceForm.invalid) {
      return;
    }else{
      let data = this.webStorage.createdByProps();
    let formData = this.attendenceForm.value;
    let obj = {
      "createdBy": data.createdBy,
      "modifiedBy": data.modifiedBy,
      "createdDate": data.createdDate,
      "modifiedDate": data.modifiedDate,
      "isDeleted": data.isDeleted,
      "id":  this.editFlag,
      "category": formData.category,
      "m_Category":formData.M_category,
      // "lan": this.languageFlag
    }

    // let method = this.editFlag ? 'PUT' : 'POST';
    // let url = this.editFlag ? 'UpdateCategory' : 'AddCategory';
    this.apiService.setHttp('POST', 'zp-satara/AssetCategory/AddCategory', false, obj, false, 'baseUrl');
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
    
  }

}
