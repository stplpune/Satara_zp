import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { MasterService } from 'src/app/core/services/master.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { WebStorageService } from 'src/app/core/services/web-storage.service';
import { ValidationService } from 'src/app/core/services/validation.service';
import { NgxSpinnerService } from 'ngx-spinner';


@Component({
  selector: 'app-add-update-designation-master',
  templateUrl: './add-update-designation-master.component.html',
  styleUrls: ['./add-update-designation-master.component.scss']
})
export class AddUpdateDesignationMasterComponent {
  designationForm!: FormGroup;
  DesiganationLevelData: any;
  desiganationTypeData = new Array();
  editFlag: boolean = false;
  editData: any;
  formDisabled:boolean=true;
  obj = { id: 0, designationType: 'Other' ,m_DesignationType :'इतर'};
   
  constructor(private masterService: MasterService, private fb: FormBuilder, private service: ApiService,
    private commonMethod: CommonMethodsService, private errorHandler: ErrorsService,public webStorage : WebStorageService,
    public validation :ValidationService, private ngxSpinner : NgxSpinnerService,
    public dialogRef: MatDialogRef<AddUpdateDesignationMasterComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.formData();
    !this.data ? this.getDesiganationLevel() : this.onClickEdit(this.data);
  }

  get f() { return this.designationForm.controls }
  //#region -------------------------------------- Desiganation-Master Formdata --------------------------//
  formData() {
    this.designationForm = this.fb.group({
      "lan": [''],
      "id": [0],
      "designationType": ['',[Validators.required, Validators.pattern(this.validation.alphaNumericOnly)]],
      "m_DesignationType": ['',[Validators.required, Validators.pattern('^[-\u0900-\u096F ]+$')]],
      "designationLevelId": ['', Validators.required]
    })
  }
  //#endregion  ---------------------------- End Desiganation-Master Formdata ------------------------------- //


  //#region ----------------------------------Desiganation-Master Dropdown ------------------------------- //
  getDesiganationLevel() {
    let lan = '';
    this.masterService.GetAllDesignationLevel(lan).subscribe({
      next: ((res: any) => {
        if (res.statusCode == '200' && res.responseData.length) {
          this.DesiganationLevelData = res.responseData; 
          this.editFlag ? ((this.designationForm.controls['designationLevelId'].setValue(this.editData.designationLevelId)), this.designationForm.controls['designationLevelId'].disable()) : '';
        }
      }), error: (error: any) => {
        this.commonMethod.checkEmptyData(error.statusText) == false ? this.errorHandler.handelError(error.statusCode) : this.commonMethod.showPopup(error.statusText, 1);
      }
    })
  }

  // getDesiganationType() {
  //   this.desiganationTypeData=[];
  //   let getFormVal = this.designationForm.value;
  //   let getDesignationLevelId: any = this.commonMethod.getkeyValueByArrayOfObj(this.DesiganationLevelData, 'designationLevel', getFormVal?.designationLevelId);
  //   let desigLevelId = getDesignationLevelId?.id
   
  
    

  //   this.masterService.GetDesignationByLevelId(getFormVal.lan, desigLevelId).subscribe({
  //     next: ((res: any) => {
  //       if (res.statusCode == '200' && res.responseData.length) {
  //         this.desiganationTypeData = res.responseData;
  //         this.desiganationTypeData.push(this.obj);      
  //         this.editFlag ? (this.designationForm.controls['designationName'].setValue(this.editData.designationName)) : '';
  //       }
  //     }), error: (error: any) => {
  //       this.commonMethod.checkEmptyData(error.statusText) == false ? this.errorHandler.handelError(error.statusCode) : this.commonMethod.snackBar(error.statusText, 1);
  //     }
  //   })

  // }
  //#endregion  -------------------------------- End Desiganation-Master Dropdown ------------------------------- //

  //#region ------------------------------------- Desiganation-Master Submit ---------------------------------// 
  OnSubmit() {
    if(this.designationForm.valid){
      this.formDisabled = !this.formDisabled;
      this.formDisabled ? 'disable' : 'enable';
    if(this.editFlag) {
        const disableValue = this.formDisabled ? 'disable' : 'enable';
        Object.keys(this.designationForm.controls).forEach((designationLevelId) => {         
            this.designationForm.controls[designationLevelId][disableValue]();
        });
      }
      // let getFormVal = this.designationForm.value;
      // let getDesignationLevelId: any = this.commonMethod.getkeyValueByArrayOfObj(this.DesiganationLevelData, 'designationLevel', getFormVal?.designationLevelId);
      // this.designationForm.value.designationLevelId = getDesignationLevelId?.id;
     
      let formValue = this.designationForm.value;    
      let  data = this.webStorage.createdByProps();    
      
      let postObj = {
        "createdBy":  data.createdBy ,
        "modifiedBy": data.modifiedBy,
        "createdDate": data.createdDate,
        "modifiedDate": data.modifiedDate,
        "isDeleted": data.isDeleted,
        "lan": this.webStorage.languageFlag,
        "id": formValue.id,
        "designationType":  formValue.designationType ,
        "m_DesignationType": formValue.m_DesignationType,
        "designationLevelId": formValue.designationLevelId,
        "timestamp": new Date(),
        "localId": 0,
      }
      this.ngxSpinner.show();
      let url;
      this.editFlag ? url = 'zp-satara/register-designation/UpdateRecord' : url = 'zp-satara/register-designation/AddDesignation'
      this.service.setHttp(this.editFlag ? 'put' : 'post', url, false, postObj, false, 'baseUrl');
      this.service.getHttp().subscribe({     
        next: (res: any) => {
          this.ngxSpinner.hide();
          this.service.staticData.next('getRefreshStaticdata');
          res.statusCode == 200 ? ( this.commonMethod.showPopup(res.statusMessage, 0)) : this.commonMethod.checkEmptyData(res.statusMessage) == false ? this.errorHandler.handelError(res.statusCode) : this.commonMethod.showPopup(res.statusMessage, 1);
          res.statusCode == 200 ?  this.dialogRef.close('yes') :  this.ngxSpinner.hide();
        },
        error: ((error: any) => {
          this.errorHandler.handelError(error.status);
          this.commonMethod.checkEmptyData(error.status) == false ? this.errorHandler.handelError(error.status) : this.commonMethod.showPopup(error.status, 1);
        })
      })
    }else{
      this.commonMethod.showPopup(this.webStorage.languageFlag == 'EN' ? 'Please Enter Mandatory Fields' : 'कृपया अनिवार्य फील्ड प्रविष्ट करा', 1);
      return;
    }
   
  }
  //#endregion -------------------------------------End Desiganation-Master Submit ---------------------------------//

  //#region  ------------------------------------- Desiganation-Master Edit ---------------------------------//
  onClickEdit(obj: any) {
    this.editFlag = true;
    this.editData = obj;    
    this.designationForm.patchValue({
      id: obj.id,
      designationType:obj.designationName,
      m_DesignationType:obj.m_DesignationType,
      designationLevelId : obj.designationLevelId
    });
    this.getDesiganationLevel();
  }
  //#endregion -------------------------------------End Desiganation-Master Edit ---------------------------------//
  //#region  ------------------------------------- Desiganation-Master Clear ---------------------------------//
  clearForm(formControlName: any) {
    if (formControlName == 'designationLevelId') {
      this.designationForm.controls['designationType'].setValue('');
      this.desiganationTypeData = [];
    }
  }
  // #endregion -------------------------------------End Desiganation-Master Clear ---------------------------------//
}
