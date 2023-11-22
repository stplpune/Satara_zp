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
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
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
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  dataSource = ELEMENT_DATA;

  examForm!: FormGroup;
  stateArr = new Array();
  districtArr = new Array();
  educationYearArr = new Array();
  languageFlag: any;
  dateFrom = new FormControl(moment());
  dateTo = new FormControl(moment());
  minVal: any;
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
      this.getEducatioYear();
      this.formField();
    }
    
    formField(){
    
      this.examForm = this.fb.group({
        id: [this.data ? this.data.id : 0],
        stateId: ['', Validators.required],
        districtId: ['', Validators.required],
        educationYearId: ['', Validators.required],
        shortForm: [],
        "createdBy": [this.webService.getUserId() || 0],
        "modifiedBy": [this.webService.getUserId() || 0],      
        examType: [this.data ? this.data.examType : '', [Validators.required, Validators.pattern(this.validationService.alphaNumericOnly)]],
        m_ExamType: [this.data ? this.data.m_ExamType : '', [Validators.required, Validators.pattern(this.validationService.alphanumericMarathi)]],
        fromMonth:  [this.data ? moment(this.data.fromMonth) : moment()],
        toMonth:  [this.data ? moment(this.data.toMonth) : moment()],
        lan: this.languageFlag,
      })
    
      this.data ?  (this.dateFrom.setValue(moment(this.data.fromMonth)),this.dateTo.setValue(moment(this.data.toMonth))) :''
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
      let stateId = this.examForm.value.stateId;
      this.masterService.getAllDistrict('', stateId).subscribe({
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

    getEducatioYear() {
      this.educationYearArr = [];
      this.masterService.getAcademicYears(this.webService.languageFlag).subscribe({
        next: (res: any) => {
          if (res.statusCode == "200") {
            this.educationYearArr=res.responseData;
            this.data ? (this.f['educationYearId'].setValue(this.data?.educationYearId))  : '';

          }
          else {
            this.educationYearArr = [];
          }
        },
      });
    }


    onSubmit(){
      let formValue = this.examForm.value;
      // formValue.toMonth = this.dateFrom;
      // formValue.fromMonth = this.dateTo;
      let url = this.data ? 'UpdateExamType' : 'AddExamType';
      if(!this.examForm.valid){
        this.commonMethods.showPopup(this.languageFlag == 'English' ? 'Please Enter Mandatory Fields' : 'कृपया अनिवार्य फील्ड प्रविष्ट करा', 1);
        return
      }else{

        this.ngxSpinner.show();
        this.apiService.setHttp(this.data ? 'put' : 'post', 'zp-satara/ExamType/'+ url, false, formValue, false, 'baseUrl');
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
      this.examForm.controls['districtId'].setValue('');
    }

    setMonthAndYear(normalizedMonthAndYear: _moment.Moment, datepicker: MatDatepicker<Moment>, flag? : string) {      
      if(this.examForm.value.fromMonth && flag == 'fromDate'){        
        // if(this.dateFrom && flag == 'fromDate'){        
        const ctrlValue = this.dateFrom.value!;
        ctrlValue.month(normalizedMonthAndYear.month());
        ctrlValue.year(normalizedMonthAndYear.year());
        this.dateFrom.setValue(ctrlValue);
        this.examForm.value.fromMonth=ctrlValue;
        this.minVal = ctrlValue
        datepicker.close();
      }
      else if(this.examForm.value.toMonth && flag == 'todate'){
        // else if(this.dateTo && flag == 'todate'){
        const ctrlValue = this.dateTo.value!;
        ctrlValue.month(normalizedMonthAndYear.month());
        ctrlValue.year(normalizedMonthAndYear.year());
        this.dateTo.setValue(ctrlValue);
        this.examForm.value.toMonth=ctrlValue;
        datepicker.close();
      }
    }
}

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
  {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
  {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
  {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
  {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
  {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
  {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
  {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
  {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
  {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'},
];
