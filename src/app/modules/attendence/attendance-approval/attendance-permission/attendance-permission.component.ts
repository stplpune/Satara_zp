import { DatePipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { ValidationService } from 'src/app/core/services/validation.service';
import { WebStorageService } from 'src/app/core/services/web-storage.service';


@Component({
  selector: 'app-attendance-permission',
  templateUrl: './attendance-permission.component.html',
  styleUrls: ['./attendance-permission.component.scss']
})
export class AttendancePermissionComponent {
  permissionForm !: FormGroup;

  constructor(
    private webStorageS: WebStorageService,
    private ngxSpinner: NgxSpinnerService,
    private apiService: ApiService,
    private errors: ErrorsService,
    private fb: FormBuilder,
    public validators: ValidationService,
    private datePipe: DatePipe,
    private commonMethodS: CommonMethodsService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<AttendancePermissionComponent>
  ) { }

  ngOnInit() {
    this.formField();
  }

  formField(){
    this.permissionForm = this.fb.group({
      remark: ['']
    });
  }

  onApproveReject(flag: string) {
    let formValue = this.permissionForm.value

    if (flag == 'reject' && formValue.remark == '') {
      this.applyValidation();
    }
    else {
      let date = this.dateFormat(this.data?.date);
      let isApproved = flag == 'reject' ? 0 : 1;
      this.ngxSpinner.show();
      let str = `TeacherId=${this.data?.teacherId}&Date=${date}&IsApproved=${isApproved}&ApprovalRemark=${(formValue.remark || '')}&UserId=${this.webStorageS.getUserId()}&lan=${this.webStorageS.languageFlag}`;
      this.apiService.setHttp('post', 'zp-satara/Attendance/SaveAttendanceApproval?' + str, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => {
          this.ngxSpinner.hide();
          if (res.statusCode == "200") {
            this.dialogRef.close('yes');
          }
          else {
            this.commonMethodS.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethodS.showPopup(res.statusMessage, 1);
          }
        },
        error: ((err: any) => {
          this.ngxSpinner.hide();
          this.commonMethodS.checkEmptyData(err.statusMessage) == false ? this.errors.handelError(err.statusCode) : this.commonMethodS.showPopup(err.statusMessage, 1);
        })
      });
    }
  }

  applyValidation() {
    this.permissionForm.controls['remark'].setValidators([Validators.required]);
    this.permissionForm.controls['remark'].updateValueAndValidity();
  }

  dateFormat(date: any) {
    return this.datePipe.transform(date, 'yyyy-MM-dd');
  }
}
