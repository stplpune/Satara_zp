import { DatePipe } from '@angular/common';
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
  editFlag: any;
  attendenceForm !: FormGroup;
  AttType!:number;

  constructor(private fb: FormBuilder,
    private apiService: ApiService,
    private commonMethod: CommonMethodsService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<AddTasksheetComponent>,
    private errors: ErrorsService,
    public webStorageS: WebStorageService,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    this.defaultForm(); 
  }

  defaultForm() {
    this.attendenceForm = this.fb.group({
      isPresent: [1],
      remark: [this.data?.remark || '', [Validators.required]],
      inTime:[this.data?.checkInTime || '', [Validators.required]],
      OutTime:[this.data?.checkOutTime || '', [Validators.required]]
    });
  }

  onSubmit() {
    let formValue = this.attendenceForm.getRawValue();
    
    // if(this.data.checkInTime == null &&  this.data.checkOutTime != null){    
    //   this.AttType = 1
    // }else if (this.data.checkOutTime == null && this.data.checkInTime != null ){     
    //   this.AttType = 2
    // }else if(this.data.checkInTime == null &&  this.data.checkOutTime == null){   
    //   this.AttType = 3
    // }else if((this.data.checkInTime != null &&  this.data.checkOutTime != null )){
    //   this.AttType = 4
    // }

    if(this.data.checkInTime == null &&  this.data.checkOutTime != null){    
      this.AttType = 1
    }else if (this.data.checkOutTime == null && this.data.checkInTime != null ){     
      this.AttType = 1
    }else if(this.data.checkInTime == null &&  this.data.checkOutTime == null){   
      this.AttType = 2
    }else if(this.data.remark == null ){
      this.AttType = 3
    }else{
      this.AttType = 3
    }
    
    this.data.date = this.datePipe.transform(this.data.date, 'yyyy-MM-dd');

    if (this.attendenceForm.invalid || formValue.isPresent == 0) {
      this.commonMethod.showPopup(this.webStorageS.languageFlag == 'EN' ? 'Please Enter Mandatory Fields' : 'कृपया अनिवार्य फील्ड प्रविष्ट करा', 1);
      return;
    } else {
      this.apiService.setHttp('POST', `zp-satara/Attendance/SaveManualAttendance?UserId=${this.webStorageS.getUserId()}&Date=${this.data.date }&Attendance=${formValue.isPresent}&AttType=${this.AttType}&InTime=${formValue.inTime}&OutTime=${formValue.OutTime}&Remark=${formValue.remark}&lan=${this.webStorageS.languageFlag}`, false, false, false, 'baseUrl');
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
