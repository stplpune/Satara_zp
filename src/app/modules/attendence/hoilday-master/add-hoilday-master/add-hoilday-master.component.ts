import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { ErrorsService } from 'src/app/core/services/errors.service';

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
    let obj={}
    console.log(this.holidayFrm.value);
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

