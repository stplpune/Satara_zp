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
  editFlag:boolean=false;
  editId:any;
  holidayFrm!: FormGroup;
  constructor(private fb: FormBuilder,
    private apiService:ApiService,
    private commonMethod:CommonMethodsService,
    private errors:ErrorsService,
    public webStorage:WebStorageService,
    public validation:ValidationService,
    private dialogRef: MatDialogRef<AddHoildayMasterComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.defaultForm();
    this.data?this.editData():'';
  }

  defaultForm() {
    this.holidayFrm = this.fb.group({
      date: ['',[Validators.required]],
      holidayName: ['',[Validators.required]],
      yearId:['',[Validators.required]],
      holidayNameMarathi:['',[Validators.required,Validators.pattern('^[-\u0900-\u096F ]+$')]]
    })
  }

  year=[
    {id:2023,name:'2023',Mname:'२०२३'},
    {id:2024,name:'2024',Mname:'२०२४'}
  ]

  onSubmit() {
    let formData=this.holidayFrm.getRawValue();
    if (this.holidayFrm.invalid || formData.yearId ==0) {
      this.commonMethod.showPopup(this.webStorage.languageFlag == 'EN' ? 'Please Enter Mandatory Fields' : 'कृपया अनिवार्य फील्ड प्रविष्ट करा', 1);
      return
    }
    let data = this.webStorage.createdByProps();
    
    let obj={
      "id":this.editFlag?this.editId:0,
      "holidayName": formData.holidayName,
      "m_HolidayName": formData.holidayNameMarathi,
      "holidayDate": formData.date,
      "year": formData.yearId,
      "isDeleted": false,
      "createdBy":data.createdBy,
      "lan": this.webStorage.languageFlag,
    }
    
    let method=this.editFlag?'put':'post';
    let url=this.editFlag?'UpdateHoliday':'AddHoliday'
    this.apiService.setHttp(method, 'zp-satara/HolidayMaster/'+url, false, obj, false, 'baseUrl');
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

    editData(){
      this.editFlag=true;
      this.editId=this.data.id;
      this.holidayFrm.patchValue({
        date:this.data.holidayDate,
        holidayName:this.data.holidayName,
        yearId:this.data.year,
        holidayNameMarathi:this.data.m_HolidayName
      })
    }
  }

