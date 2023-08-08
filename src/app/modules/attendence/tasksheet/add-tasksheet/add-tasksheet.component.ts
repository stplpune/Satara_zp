import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
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
    private apiService:ApiService,
    private commonMethod:CommonMethodsService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<AddTasksheetComponent>,
    private errors:ErrorsService,
    public webStorageS : WebStorageService
    ){}

  ngOnInit(){
    this.defaultForm();
    console.log("data : ", this.data);
  }

  defaultForm(){
    this.attendenceForm=this.fb.group({
      isPresent: [1],
      remark: ['',[Validators.required]]
    })
  }


  onSubmit() {
    let formValue = this.attendenceForm.value
    console.log("onSubmit : ",formValue);
    // return
    if (this.attendenceForm.invalid) {
      return;
    }else{
      // zp-satara/Attendance/SaveManualAttendance?UserId=5&Attendance=1&Date=08%2F01%2F2023%2000%3A00%3A00&Remark=ee&lan=EN
    this.apiService.setHttp('POST', 'zp-satara/Attendance/SaveManualAttendance?UserId=' + this.webStorageS.getUserId() + '&Attendance=' + formValue.isPresent + '&Date=' + this.data.date + '&Remark=' + formValue.remark + '&lan=' + this.webStorageS.languageFlag, false, false, false, 'baseUrl');
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
