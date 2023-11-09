import { Component, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { MasterService } from 'src/app/core/services/master.service';
import { ValidationService } from 'src/app/core/services/validation.service';
import { WebStorageService } from 'src/app/core/services/web-storage.service';
import * as _moment from 'moment';
import { default as _rollupMoment, Moment } from 'moment';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { MatDatepicker } from '@angular/material/datepicker';

const moment = _rollupMoment || _moment;

export const MY_FORMATS = {
  parse: {
    dateInput: 'YYYY-MM',
  },
  display: {
    dateInput: 'YYYY-MM',
    monthYearLabel: 'YYYY-MM',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'YYYY-MM',
  },
};

@Component({
  selector: 'app-add-exam-master',
  templateUrl: './add-exam-master.component.html',
  styleUrls: ['./add-exam-master.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class AddExamMasterComponent {
  examForm!: FormGroup;
  stateArr = new Array();
  districtArr = new Array();
  languageFlag: any;
  dateFrom = new FormControl(moment());
  dateTo = new FormControl(moment());
  get f() { return this.examForm.controls }

  constructor(private masterService: MasterService,
    private commonMethods: CommonMethodsService,
    private errors: ErrorsService,
    private fb: FormBuilder,
    private webService: WebStorageService,
    private ngxSpinner: NgxSpinnerService,
    private apiService: ApiService,
    public validationService: ValidationService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<AddExamMasterComponent>
    ){}

    ngOnInit(){
      this.languageFlag = this.webService.languageFlag;
      this.webService.langNameOnChange.subscribe(lang => {
        this.languageFlag = lang;
      });
      this.getState();
      this.formField();
    }
    
    formField(){
      this.examForm = this.fb.group({
        id: [this.data ? this.data.id : 0],
        stateId: ['', Validators.required],
        districtId: ['', Validators.required],
        examType: [this.data ? this.data.examType : '', [Validators.required, Validators.pattern(this.validationService.alphaNumericOnly)]],
        m_ExamType: [this.data ? this.data.m_ExamType : '', [Validators.required, Validators.pattern(this.validationService.alphanumericMarathi)]],
        toMonth:  new FormControl(moment()),
        fromMonth:  new FormControl(moment()),
        lan: this.languageFlag
      })
    }
  
    getState(){
      this.stateArr = [];
      this.masterService.getAllState('').subscribe({
        next: (res: any) => {
          if(res.statusCode == "200"){
            this.stateArr = res.responseData;
            this.data ? (this.f['stateId'].setValue(this.data?.stateId), this.getDistrict())  : '';
          }
          else{
            this.stateArr = [];
          }
        }
      });
    }
  
    getDistrict() {
      this.districtArr = [];
      // let stateId = this.subjectForm.value.stateId;
      this.masterService.getAllDistrict('').subscribe({
        next: (res: any) => {
          if (res.statusCode == "200") {
            this.districtArr = res.responseData;
            this.data ? (this.f['districtId'].setValue(this.data?.stateId))  : '';
          }
          else {
            this.districtArr = [];
          }
        }
      });
    }

    onSubmit(){
      let formValue = this.examForm.value;
      let url = this.data ? 'UpdateExamType' : 'AddExamType';
      if(!this.examForm.valid && formValue.districtId == 0){
        this.commonMethods.showPopup(this.languageFlag == 'English' ? 'Please Enter Mandatory Fields' : 'कृपया अनिवार्य फील्ड प्रविष्ट करा', 1);
        return
      }else{
        this.ngxSpinner.show();
        this.apiService.setHttp(this.data ? 'put' : 'post', 'zp-satara/ExamType/' + url, false, formValue, false, 'baseUrl');
        this.apiService.getHttp().subscribe({
          next: (res: any) => {
            res.statusCode == "200" ? (this.commonMethods.showPopup(res.statusMessage, 0), this.dialogRef.close('yes')) : this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
            this.ngxSpinner.hide();
          },
          error: ((err: any) => {
            this.ngxSpinner.hide();
            this.commonMethods.checkEmptyData(err.statusMessage) == false ? this.errors.handelError(err.statusCode) : this.commonMethods.showPopup(err.statusMessage, 1);
          })
        });
      }
    }

    clearDropdown(){
      this.examForm.controls['districtId'].setValue(0);
    }

    setMonthAndYear(normalizedMonthAndYear: _moment.Moment, datepicker: MatDatepicker<Moment>) {
      if(this.examForm.value.fromMonth){
        const ctrlValue = this.dateFrom.value!;
        ctrlValue.month(normalizedMonthAndYear.month());
        ctrlValue.year(normalizedMonthAndYear.year());
        this.dateFrom.setValue(ctrlValue);
        datepicker.close();
      }
      else if(this.examForm.value.toMonth){
        const ctrlValue = this.dateTo.value!;
        ctrlValue.month(normalizedMonthAndYear.month());
        ctrlValue.year(normalizedMonthAndYear.year());
        this.dateTo.setValue(ctrlValue);
        datepicker.close();
      }
    }
}

