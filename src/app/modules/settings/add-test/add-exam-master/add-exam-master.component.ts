import { Component, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
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
import { GlobalDialogComponent } from 'src/app/shared/components/global-dialog/global-dialog.component';

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
  assetCriteriaFrom!: FormGroup
  stateArr = new Array();
  districtArr = new Array();
  educationYearArr = new Array();
  languageFlag: any;
  dateFrom = new FormControl(moment());
  dateTo = new FormControl(moment());
  minVal: any;
  standardArr = new Array();
  subjectArr = new Array();
  criteriaArr = new Array();
  tableArray: any = [];
  criteriaObjArr = new Array();
  editAssessment: any;
  tableobj: any;
  submitArr = new Array();
  get f() { return this.examForm.controls }
  get cf() { return this.assetCriteriaFrom.controls}

  constructor(private masterService: MasterService,
    private commonMethods: CommonMethodsService,
    private errors: ErrorsService,
    private fb: FormBuilder,
    private webService: WebStorageService,
    private ngxSpinner: NgxSpinnerService,
    private apiService: ApiService,
    public validationService: ValidationService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
    private dialogRef: MatDialogRef<AddExamMasterComponent>
    ){}

    ngOnInit(){
      this.languageFlag = this.webService.languageFlag;
      this.webService.langNameOnChange.subscribe(lang => {
        this.languageFlag = lang;
      });
      this.getState();
      this.getStandard();
      this.getSubject();
      // this.getCriteria();
      this.getEducatioYear();
      this.formField();
      this.examCriteriaFeild();

      this.data ? this.onEdit(this.data) : '';
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
        examTypeWises: []
      });
      this.data ?  (this.dateFrom.setValue(moment(this.data.fromMonth)),this.dateTo.setValue(moment(this.data.toMonth))) :'';
    }

    examCriteriaFeild(){
      this.assetCriteriaFrom = this.fb.group({
        standardId: [''],
        subjectId: [''], 
        assetCriteriaId: ['']
      });
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

    getStandard(id?: any){
      this.standardArr = [];
      this.masterService.GetAllStandardClassWise(this.webService.languageFlag).subscribe({
        next: (res: any) => {
          if (res.statusCode == "200") {
            this.standardArr=res.responseData;
            if(id){
              this.assetCriteriaFrom.controls['standardId'].setValue(id);
            }
          }
          else {
            this.standardArr = [];
          }
        }
      });
    }

    getSubject(id?: any){
      this.subjectArr = [];
      this.masterService.getAllSubject(this.webService.languageFlag).subscribe({
        next: (res: any) => {
          if (res.statusCode == "200") {
            this.subjectArr = res.responseData;
            if(id){
              this.assetCriteriaFrom.controls['subjectId'].setValue(id);
            }
          }
          else {
            this.subjectArr = [];
          }
        },
      });
    }

    getCriteria(id?: any){
      console.log("id: ", id);
      
      this.criteriaArr = [];
      let standardId = this.assetCriteriaFrom.value.standardId;
      let subjectId = this.assetCriteriaFrom.value.subjectId;
      console.log("standardId: ", standardId , " subjectId : ", subjectId);
      
      this.masterService.GetAllExamTypeCriteria(standardId, subjectId, this.webService.languageFlag).subscribe({
        next: (res: any) => {
          if (res.statusCode == "200"){
            this.criteriaArr = res.responseData;
            if(id){
              this.assetCriteriaFrom.controls['assetCriteriaId'].setValue([169, 154]);
            }
          }
          else {
            this.subjectArr = [];
          }
        },
      });
    }

    addAssCriteria(){
      this.addValidation(true);
      let criteriaFormValue = this.assetCriteriaFrom.value;
      this.criteriaObjArr = []
          for(let i = 0; i < criteriaFormValue.assetCriteriaId.length; i++){
            let obj = {
              id: 0,
              examTypeId: 0,
              standardId: criteriaFormValue.standardId,
              subjectId: criteriaFormValue.subjectId,
              questionId: criteriaFormValue.assetCriteriaId[i],
              createdBy: this.webService.getUserId(),
              modifiedBy: this.webService.getUserId()
            }
            this.criteriaObjArr.push(obj);
            this.submitArr.push(obj)
            // this.criteriaObjArr = [...this.criteriaObjArr];
          }
          console.log("this.criteriaObjArr",this.criteriaObjArr);
          // object create for Display
          this.tableobj = {}
          this.tableobj = {
            ...this.criteriaObjArr[0],
            "criteriaDetails": []
          }
          for (let i = 1; i < this.criteriaObjArr.length; i++) {
            this.tableobj.criteriaDetails.push(this.criteriaObjArr[i]);
          }
          this.tableArray.push(this.tableobj)
          console.log("obj", this.tableobj);        
          console.log("this.tableArray", this.tableArray);
        // this.tableArray = [...this.tableArray];
        

        this.tableArray.map((x: any) => {                
          this.standardArr.map((res: any) => {
            if(res.id == x.standardId){
              x.standard = res.standard;
            }
          });

          this.subjectArr.map((res: any) => {
            if(x.subjectId == res.id){
              x.subjectName = res.subject;
            }
          });

          this.criteriaArr.map((res: any) => {
            if(x.questionId == res.id){
              x.question = res.question;
            }

            x.criteriaDetails.map((data: any) => {
              if(res.id == data.questionId){
                data.question = res.question;
              }
            })
          })

        })

      this.assetCriteriaFrom.controls['standardId'].setValue(0);
      this.assetCriteriaFrom.controls['subjectId'].setValue(0);
      this.assetCriteriaFrom.controls['assetCriteriaId'].setValue(0);
      this.addValidation();

      console.log("this.criteriaObjArr", this.criteriaObjArr);
      console.log("this.tableArray: ", this.tableArray);
    }

    onSubmit(){
      let formValue = this.examForm.value;
      
      formValue.examTypeWises = this.submitArr;
      console.log("formValue:", formValue);
      let url = this.data ? 'UpdateExamType' : 'AddExamType';
      if(!this.examForm.valid){
        this.commonMethods.showPopup(this.languageFlag == 'English' ? 'Please Enter Mandatory Fields' : 'कृपया अनिवार्य फील्ड प्रविष्ट करा', 1);
        return
      }else{
        this.ngxSpinner.show();
        this.apiService.setHttp(this.data ? 'put' : 'post', 'zp-satara/ExamType/'+ url, false, formValue, false, 'baseUrl');
        this.apiService.getHttp().subscribe({
          next: (res: any) =>{
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

    addValidation(status?: any){
      if(status){
        this.cf['standardId'].setValidators([Validators.required]);
        this.cf['subjectId'].setValidators([Validators.required]);
        this.cf['assetCriteriaId'].setValidators([Validators.required]);
      }
      else{
        this.cf['standardId'].clearValidators();
        this.cf['subjectId'].clearValidators();
        this.cf['assetCriteriaId'].clearValidators();
      }
      this.cf['standardId'].updateValueAndValidity();
      this.cf['subjectId'].updateValueAndValidity();
      this.cf['assetCriteriaId'].updateValueAndValidity();

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

    onEdit(data?: any){
      console.log("onedit: ", data);
      let criteriaArr = data?.questionResponses;
      this.submitArr = criteriaArr;
      console.log("criteriaArr: ", criteriaArr);
    //   let groupingViaCommonProperty = Object.values(
    //     criteriaArr.reduce((acc, current) => {
    //         acc[current.subjectId] = acc[current.subjectId] ?? [];
    //         acc[current.subjectId].push(current);
    //         return acc;
    //     }, {})
    // );
    // cretaing array which having same stanadrd and subject 
    const grouped = {};
    criteriaArr.forEach(obj => {
      const key = obj.subjectId + '-' + obj.standardId;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(obj);
    });
    let newArr = Object.values(grouped);    
    console.log("newArr", newArr);
    this.tableobj = {};
    newArr.map((x:any)=>{
      this.tableobj = {
        ...x[0],
        "criteriaDetails": []
      }
      for(let i = 1; i < x.length; i++) {
        this.tableobj.criteriaDetails.push(x[i]);
      }
      this.tableArray.push(this.tableobj);
    })

    console.log("this.tableArray",this.tableArray);
    

    }

    onEditCriteria(obj: any, index: number){
      console.log("onEditCriteria : ", obj);
      console.log("index : ", index);

      obj.map((x: any) => {
        this.getSubject(x.subjectId);
        this.getStandard(x.standardId);
        if(this.assetCriteriaFrom.value.standardId && this.assetCriteriaFrom.value.subjectId){
          this.getCriteria(x.questionId);
        }
      });
    }

    globalDialogOpen(index: number) {
      let dialoObj = {
        header: 'Delete',
        title: this.webService.languageFlag == 'EN' ? 'Do you want to delete record?' : 'तुम्हाला रेकॉर्ड हटवायचा आहे का?',
        cancelButton: this.webService.languageFlag == 'EN' ? 'Cancel' : 'रद्द करा',
        okButton: this.webService.languageFlag == 'EN' ? 'Ok' : 'ओके'
      }
      const deleteDialogRef = this.dialog.open(GlobalDialogComponent, {
        width: '320px',
        data: dialoObj,
        disableClose: true,
        autoFocus: false
      })
      deleteDialogRef.afterClosed().subscribe((result: any) => {
        if (result == 'yes') {
          this.onDeleteCriteria(index);
        }
      })
    }

    onDeleteCriteria(index: number){
      let standardId = this.criteriaObjArr[index].standardId;

      for(let i = 0; i < this.criteriaObjArr.length; i++){
        if(standardId == this.criteriaObjArr[i].standardId){
          this.criteriaObjArr.splice(i);
        }
      }
      this.tableArray?.splice(index, 1);

      this.assetCriteriaFrom.controls['standardId'].setValue(0);
      this.assetCriteriaFrom.controls['subjectId'].setValue(0);
      this.assetCriteriaFrom.controls['assetCriteriaId'].setValue(0);
      this.addValidation(true);
    }

    createTableStructure(tableArray: any){
      this.tableArray = [];
      
      const uniquestandardName = [...new Set(tableArray.map((x: any) => x.standardId))];

      uniquestandardName.map((x: any) => {
        const unquieArray = tableArray.filter((y: any) => y.standardId == x);

        if(unquieArray.length > 1){
          const fObj = unquieArray[0];
          unquieArray.shift();

          const uniuqeConsumerObj = Object.assign(fObj, { detailsArr: unquieArray });
          this.tableArray.push(uniuqeConsumerObj);
        }else {
          const uniuqeConsumerObj = Object.assign(unquieArray[0], { detailsArr: [] });
          this.tableArray.push(uniuqeConsumerObj);
        }
      })

      console.log("tableArray after return", this.tableArray);
      
      return this.tableArray

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
