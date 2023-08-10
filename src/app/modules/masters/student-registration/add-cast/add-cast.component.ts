
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { MasterService } from 'src/app/core/services/master.service';
import { ValidationService } from 'src/app/core/services/validation.service';
import { WebStorageService } from 'src/app/core/services/web-storage.service';

@Component({
  selector: 'app-add-cast',
  templateUrl: './add-cast.component.html',
  styleUrls: ['./add-cast.component.scss'],  

})

export class AddCastComponent {
  addCastForm!:FormGroup
  editFlag : boolean = false;
  editObj:any;
  districtArr = new Array();
  languageFlag:any;
  catogoryArr = new Array();
  religionArr = new Array();

  constructor(private webService: WebStorageService,
    private fb:FormBuilder, private apiService: ApiService,
    private commonMethods: CommonMethodsService,
    private errors: ErrorsService,
    public dialogRef: MatDialogRef<AddCastComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private masterService: MasterService,
    public validators: ValidationService){
      console.log("data",data);
      
  }
  ngOnInit() {
    this.languageFlag = this.webService.languageFlag;
    this.formdata();
    this.getReligion();
  
  }

  formdata(){
    this.addCastForm = this.fb.group({
      ... this.webService.createdByProps(),
        id: 0,
        religionId: [this.data.religionId],
        casteCategoryId: [this.data.casteCategoryId],
        caste: ['',[Validators.required, Validators.pattern(this.validators.name)]],
        m_Caste: ['',[Validators.required, Validators.pattern('^[.,\n()\u0900-\u096F ]+$')]],
        lan: ['']
      
    })
  }

  getReligion() {
    this.religionArr = [];
    this.masterService.getAllReligion(this.languageFlag).subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.religionArr = res.responseData;
         
        } else {
          this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
          this.religionArr = [];
        }
      },
      // error: ((err: any) => { this.errors.handelError(err.statusCode) })
    });
  }

  getCatogory() {
    this.catogoryArr = [];
    let id = this.addCastForm.value.religionId;
    this.masterService.GetAllCasteCategory(id,this.languageFlag).subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.catogoryArr = res.responseData;         
        } else {
          this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
          this.catogoryArr = [];
        }
      },
      // error: ((err: any) => {this.errors.handelError(err.statusCode || err.status) })
    });
  }

  onSubmit(){   
    let postObj = this.addCastForm.value
    if(this.addCastForm.invalid){
      return;
    }else{
      this.apiService.setHttp('post','zp-satara/Student/AddCaste', false, postObj, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => {
          if (res.statusCode == 200) {
            this.commonMethods.showPopup(res.statusMessage, 0);
            this.dialogRef.close('yes')            
          } else {          
            this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
          }
        },
        error: ((err: any) => {  this.errors.handelError(err.statusCode) })
      });
    }
   
  }
  }
 
  

