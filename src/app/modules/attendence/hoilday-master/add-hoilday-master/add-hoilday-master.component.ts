import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { ValidationService } from 'src/app/core/services/validation.service';
import { WebStorageService } from 'src/app/core/services/web-storage.service';

@Component({
  selector: 'app-add-hoilday-master',
  templateUrl: './add-hoilday-master.component.html',
  styleUrls: ['./add-hoilday-master.component.scss']
})
export class AddHoildayMasterComponent {
  editFlag: any;
  holidayFrm!: FormGroup;
  constructor(private fb: FormBuilder,
    private apiService:ApiService,
    private commonMethod:CommonMethodsService,
    private errors:ErrorsService,
    private webStorage:WebStorageService,
    public validation:ValidationService,
    private dialogRef: MatDialogRef<AddHoildayMasterComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.defaultForm();
  }

  defaultForm() {
    this.holidayFrm = this.fb.group({
      date: ['',[Validators.required]],
      holidayName: ['',[Validators.required]]
    })
  }


  onSubmit() {
    if (this.holidayFrm.invalid) {
      return
    }
    let data = this.webStorage.createdByProps();
    let formData=this.holidayFrm.getRawValue();
    let obj={
      "id": 0,
      "holidayName": formData.holidayName,
      "holidayDate": formData.date,
      "year": 0,
      "isDeleted": data.isDeleted,
      "createdBy":data.createdBy,
      "lan": this.webStorage.languageFlag,
    }
    
    console.log(this.holidayFrm.value);
    this.apiService.setHttp('POST', 'zp-satara/HolidayMaster/AddHoliday', false, obj, false, 'baseUrl');
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

