import { DatePipe } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { AesencryptDecryptService } from 'src/app/core/services/aesencrypt-decrypt.service';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { FileUploadService } from 'src/app/core/services/file-upload.service';
import { MasterService } from 'src/app/core/services/master.service';
import { ValidationService } from 'src/app/core/services/validation.service';
import { WebStorageService } from 'src/app/core/services/web-storage.service';
import { AddCastComponent } from '../../add-cast/add-cast.component';

@Component({
  selector: 'app-add-update-student',
  templateUrl: './add-update-student.component.html',
  styleUrls: ['./add-update-student.component.scss']
})
export class AddUpdateStudentComponent {
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol','Action'];
 
  stuRegistrationForm!: FormGroup;
  addGardianForm!: FormGroup
  isCheck = new FormControl();
  districtArr = new Array();
  talukaArr = new Array();
  centerArr = new Array();
  villageArr = new Array();
  schoolArr = new Array();
  genderArr = new Array();
  religionArr = new Array();
  standardArr = new Array();
  casteArr = new Array();
  catogoryArr = new Array();
  editFlag: boolean = false
  physicallyDisabled = [
    { id: 1, eName: 'Yes', mName: 'होय' },
    { id: 2, eName: 'No', mName: 'नाही' }
  ];

  uploadImg: string = '';
  uploadAadhaar: string = '';
  editObj: any;
  languageFlag!: string
  imageArray = new Array();
  maxDate = new Date();
  imgFlag: boolean = false;
  aadhaarFlag: boolean = false;
  readOnlyFlag: boolean = false;
  loginData :any;
  relationArr= new Array();
  gaurdianModel!:FormArray
  data: any;
  studentId!:number;
  gardianModelArr = new Array();
  // headerFlag:boolean = false;
  checkDisable:boolean = false
  searchMobieNoObj:any;
  get f(){ return this.addGardianForm.controls };

  @ViewChild('uploadImage') imageFile!: ElementRef;
  @ViewChild('uploadAadhar') aadharFile!: ElementRef;
  // @ViewChild('formDirective') private formDirective!: NgForm;

  constructor(
    public dialog: MatDialog,
    private fb: FormBuilder, private masterService: MasterService, private errors: ErrorsService,
    private fileUpl: FileUploadService, private apiService: ApiService,
    private webService: WebStorageService, private datePipe: DatePipe,
    private commonMethods: CommonMethodsService, public validators: ValidationService, private ngxSpinner: NgxSpinnerService,
    private activatedRoute :ActivatedRoute,
    private encDec: AesencryptDecryptService,
    private router : Router
    ) { 
     this.loginData = this.webService.getLoggedInLocalstorageData();   
     let studentObj: any;    
     this.activatedRoute.queryParams.subscribe((queryParams: any) => { studentObj = queryParams['id'] });
     this.studentId = +this.encDec.decrypt(`${decodeURIComponent(studentObj)}`);
    }

    getGardianList(): FormArray {
      return this.stuRegistrationForm.get('gaurdianModel') as FormArray;
    }

    get formArrayControls() {
      return (this.stuRegistrationForm.get("gaurdianModel") as FormArray).controls;
    }

  ngOnInit() {
    this.webService.langNameOnChange.subscribe(lang => {
      this.languageFlag = lang;
    });

    this.formData();
    this.gardianFormData()
    // this.data ? (this.editObj = JSON.parse(this.data), this.patchValue()) : this.allDropdownMethods();
    this.studentId ? ( this.onEdit(this.studentId)) : this.allDropdownMethods();
  }
  
  allDropdownMethods() {
    this.getDistrict(),
    this.getGender()
    this.getReligion();
    this.getRelation();
  }

  formData() {
    this.stuRegistrationForm = this.fb.group({
      districtId: [''],
      talukaId: ['', Validators.required],
      centerId: ['', Validators.required],
      villageId: ['', Validators.required],
      schoolId: ['', Validators.required],
      fName: ['', [Validators.required, Validators.pattern(this.validators.name)]],
      mName: ['', [Validators.required, Validators.pattern(this.validators.name)]],
      lName: ['', [Validators.required, Validators.pattern(this.validators.name)]],
      f_MName: ['', [Validators.required, Validators.pattern('^[\u0900-\u0965 ]+$')]],
      m_MName: ['', [Validators.required, Validators.pattern('^[\u0900-\u0965 ]+$')]],
      l_MName: ['', [Validators.required, Validators.pattern('^[\u0900-\u0965 ]+$')]],
      standard: ['', Validators.required],
      dob: ['', Validators.required],
      gender: ['', Validators.required],
      religionId: ['', Validators.required],
      casteId: ['', Validators.required],
      casteCategoryId:['', Validators.required],
      saralId: ['', [Validators.maxLength(19), Validators.minLength(19)]],
      mobileNo: ['',  [Validators.maxLength(10), Validators.minLength(10), Validators.pattern(this.validators.mobile_No)]],
      fatherFullName: [''],
      // m_FatherFullName: ['', Validators.required],
      motherName: [''],
      // m_MotherName: ['', Validators.required],
      aadharNo: ['', [Validators.pattern(this.validators.aadhar_card)]],
      gaurdianModel:[]  
 
    
      // physicallyDisabled: ['', Validators.required]
    })
  }

  get fc() { return this.stuRegistrationForm.controls }

  gardianFormData(){
    this.addGardianForm = this.fb.group({
      createdBy: 0,
      modifiedBy: 0,
      createdDate: new Date(),
      modifiedDate: new Date(),
      isDeleted: false,
      id: 0,      
      name: ['',[Validators.pattern(this.validators.name)]],
      m_Name: ['',[Validators.pattern('^[.,\n()\u0900-\u096F ]+$')]],     
      mobileNo: ['',[ Validators.pattern(this.validators.mobile_No)]],
      relationId: ['',[]],
      relation: [''],
      isHead: false ,
      headerId: 0,
      timestamp: new Date(),
      localId: 0   
    })
  }
  get gf(){
    return this.addGardianForm.controls;
  }

  //#region ---------------------------- Dropdown start here -----------------------------------------------

  addGardian(){
    debugger;
    this.relationArr.map((x:any)=>{
      if(x.id == this.addGardianForm.value.relationId){
        this.f['relation'].setValue(x.relation);
      }
    });

    let formvalue = this.addGardianForm.value;   
    // if(this.updategardianFlag == true){
    //   this.gardianModelArr[this.updategardianIndex] = formvalue;
    //   this.updategardianFlag = false;
    // }
    
    if(this.f['name'].value == '' && this.f['m_Name'].value == '' && this.f['mobileNo'].value == '' && this.f['relation'].value == '' && this.gardianModelArr.length == 0){
      this.commonMethods.showPopup(this.webService.languageFlag == 'EN' ? 'Required at least one Gardian Details' : 'किमान एक गार्डियन तपशील आवश्यक आहे', 1);
      return;
    }
    else if(this.gardianModelArr.length == 0){
      this.gardianModelArr.push(formvalue);
    
      // this.gardianFormData()
      
    }else{
      if(this.f['name'].value == '' && this.f['m_Name'].value == '' && this.f['mobileNo'].value == '' && this.f['relation'].value == ''){
        return
      }
      else{
        this.gardianModelArr.forEach((res:any)=>{
          if(res.name == formvalue.name){
            this.commonMethods.showPopup(this.webService.languageFlag == 'EN' ? 'Gardian Name Already Exist' : 'पालकाचे नाव आधीपासून अस्तित्वात आहे', 1);
            return;
          }else if(res.m_Name == formvalue.m_Name){
            this.commonMethods.showPopup(this.webService.languageFlag == 'EN' ? 'Gardian Name (Marathi) Already Exist' : 'पालकाचे नाव (मराठी) आधीपासून अस्तित्वात आहे', 1);
            return;
          }
          else if(res.mobileNo == formvalue.mobileNo){
            this.commonMethods.showPopup(this.webService.languageFlag == 'EN' ? 'Gardian Mobile No. Already Exist' : 'पालकांचा मोबाईल क्रमांक आधीपासून अस्तित्वात आहे', 1);
            return;
          }
        })
      }
    
    } 

   
    this.f['name'].setValue('');    
    this.f['mobileNo'].setValue('');
    this.f['relationId'].setValue('');
    this.f['isHead'].setValue(false);
 
    // this.gardianModelArr.forEach((res:any)=>{
    //   if(res.isHead == true){ 
    //     this.checkDisable = true;
    //   }
    // })
 
    // console.log("gardianModelArr",this.gardianModelArr);
  }


  // newGardianDetails() { 
  //  return this.fb.group({   
  //       createdBy: 0,
  //       modifiedBy: 0,
  //       createdDate: new Date(),
  //       modifiedDate: new Date(),
  //       isDeleted: 0,
  //       id: 0,      
  //       name: ['',[Validators.required, Validators.pattern(this.validators.name)]],
  //       m_Name: [''],     
  //       mobileNo: ['',[Validators.required, Validators.pattern(this.validators.mobile_No)]],
  //       relationId: ['',[Validators.required]],
  //       isHead:false,
  //       headerId: 0,
  //       timestamp: new Date(),
  //       localId: 0        
  //     });  
 
  // }

  
  // addGardian() { 
  //   let gardianArr = this.getGardianList().value 
  //   let gardianObj = this.formArrayControls[0]?.get('name')?.value

  //   // this.formArrayControls[0].get('name')
  //   console.log('name formcontrol', gardianObj);
  //   console.log("gardianArr",gardianArr.length);
  //   if(gardianArr.length > 1){
  //     gardianArr.forEach((res:any)=>{
  //       if(res.name == this.formArrayControls[0]?.get('name')?.value){
  //         console.log("enter if name block");
  //         this.commonMethods.showPopup(this.webService.languageFlag == 'EN' ? 'Gardian Name Already Exist' : 'पालकाचे नाव आधीपासून अस्तित्वात आहे', 1);
  //         return;
  //       }else if(res.mobileNo == gardianObj.mobileNo){
  //         console.log("enter else if mobile block");
  //         this.commonMethods.showPopup(this.webService.languageFlag == 'EN' ? 'Gardian Mobile No. Already Exist' : 'पालकांचा मोबाईल क्रमांक आधीपासून अस्तित्वात आहे', 1);
  //         return;
  //       }
        
  //     })
  //   }
   
    
  //   if (this.getGardianList().invalid) {
  //     this.commonMethods.showPopup(this.webService.languageFlag == 'EN' ? 'Please Fill Guardian Details First' : 'कृपया प्रथम पालकांचे तपशील भरा', 1);
  //     return;
  //   } else {
  //     this.getGardianList().push(this.newGardianDetails());
  //   }
     
  // }
  addValidations(status: any){
    if(status){
      this.gf['name'].setValidators([Validators.required,Validators.pattern(this.validators.name)])
      this.gf['mobileNo'].setValidators([Validators.required,Validators.pattern(this.validators.mobile_No)])
      this.gf['relationId'].setValidators([Validators.required])
    }else{
      this.gf['name'].clearValidators()
      this.gf['mobileNo'].clearValidators()
      this.gf['relationId'].clearValidators()
    }
    this.gf['name'].updateValueAndValidity()
    this.gf['mobileNo'].updateValueAndValidity()
    this.gf['relationId'].updateValueAndValidity()

  }

  addGardianList(){
    this.addValidations(true);
    this.relationArr.map((x:any)=>{
      if(x.id == this.addGardianForm.value.relationId){
        this.f['relation'].setValue(x.relation);
      }
    });

    let formvalue = this.addGardianForm.value;   
    // this.f['name'].value == '' && this.f['mobileNo'].value == '' && this.f['relation'].value == '' && this.gardianModelArr.length == 0
    if(this.addGardianForm.invalid){
      // this.commonMethods.showPopup(this.webService.languageFlag == 'EN' ? 'Required at least one Gardian Details' : 'किमान एक गार्डियन तपशील आवश्यक आहे', 1);
      return;
    }
    else{
      if(this.f['name'].value == '' && this.f['m_Name'].value == '' && this.f['mobileNo'].value == '' && this.f['relation'].value == ''){
        return
      }
      else {
//         if(!this.gardianModelArr.find((res) => res.name === formvalue.name)) {
//           this.gardianModelArr.push(formvalue);
//         }else{
//           this.commonMethods.showPopup(this.webService.languageFlag == 'EN' ? 'Gardian Name Already Exist' : 'पालकाचे नाव आधीपासून अस्तित्वात आहे', 1);
//           return;
// }
        if (this.gardianModelArr.find((res) => res.name === formvalue.name)) {
          this.commonMethods.showPopup(this.webService.languageFlag == 'EN' ? 'Gardian Name Already Exist' : 'पालकाचे नाव आधीपासून अस्तित्वात आहे', 1);
          return;
        }
        else if(this.gardianModelArr.find((res) => res.m_Name === formvalue.m_Name)){
          this.commonMethods.showPopup(this.webService.languageFlag == 'EN' ? 'Gardian Name (Marathi) Already Exist' : 'पालकाचे नाव (मराठी) आधीपासून अस्तित्वात आहे', 1);
          return;
        } else {
          if (this.gardianModelArr.find((res) => res.mobileNo === formvalue.mobileNo)) {
            this.commonMethods.showPopup(this.webService.languageFlag == 'EN' ? 'Gardian mobileNo Already Exist' : 'पालकाचे मोबाईल क्र आधीपासून अस्तित्वात आहे', 1);
            return;
          }
          else {
            this.gardianModelArr.push(formvalue);
            
    this.addValidations(false);
          }
      }
    } 
    
    } 
    this.f['name'].setValue('');
    this.f['m_Name'].setValue('');
    this.f['mobileNo'].setValue('');
    this.f['relationId'].setValue('');
    this.f['isHead'].setValue(false);
  }


  deleteGardian(i: any) {
  
    if(this.editFlag == true){
      this.gardianModelArr[i].isDeleted = true;
      this.gardianModelArr[i].isHead = false;
      this.gardianModelArr[i].id == 0 ? this.gardianModelArr.splice(i, 1) : ''
    }
    else{    
      this.gardianModelArr.splice(i, 1);
    }
    
  }

  changeCheckBox(event: any, i: any){  
      if(event.checked == true){
        this.gardianModelArr.map((res: any)=>{
          res.isHead = false
        });
        this.gardianModelArr[i].isHead = true;
      
      }    
      
      
  }

  getDistrict() {
    this.districtArr = [];
    this.masterService.getAllDistrict('').subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.districtArr = res.responseData;
          this.stuRegistrationForm.controls['districtId'].setValue(1);
          this.getTaluka();
        } else {
          this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
          this.districtArr = [];
        }
      },
      // error: ((err: any) => { this.errors.handelError(err.statusCode) })
    });
  }

  getTaluka() {
    this.talukaArr = [];
    this.masterService.getAllTaluka('').subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.talukaArr = res.responseData;
          this.editFlag ? (this.stuRegistrationForm.controls['talukaId'].setValue(this.editObj.talukaId), this.getAllCenter()) :this.loginData.userTypeId == 4 ? (this.stuRegistrationForm.controls['talukaId'].setValue(this.loginData.talukaId),this.getAllCenter()) : '';
        } else {
          this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
          this.talukaArr = [];
        }
      },
      // error: ((err: any) => { this.errors.handelError(err.statusCode) })
    });
  }

  getAllCenter() {
    this.centerArr = [];
    let id = this.stuRegistrationForm.value.talukaId;
    this.masterService.getAllCenter('', id).subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.centerArr = res.responseData;
          this.editFlag ? (this.stuRegistrationForm.controls['centerId'].setValue(this.editObj.centerId),this.getVillage()) : this.loginData.userTypeId == 4 ?  (this.stuRegistrationForm.controls['centerId'].setValue(this.loginData.centerId),this.getVillage()): '';
        } else {
          this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
          this.centerArr = [];
        }
      },
      // error: ((err: any) => { this.errors.handelError(err.statusCode) })
    });
  }

  getVillage() {
    let cId = this.stuRegistrationForm.value.centerId;
    // let Cid = 0;
    this.masterService.getAllVillage('', cId).subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.villageArr = res.responseData;
          this.editFlag ? (this.stuRegistrationForm.controls['villageId'].setValue(this.editObj.villageId),this.getAllSchoolsByCenterId()) : this.loginData.userTypeId == 4 ? ( this.stuRegistrationForm.controls['villageId'].setValue(this.loginData.villageId),this.getAllSchoolsByCenterId()):'';
        } else {
          this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
          this.villageArr = [];
        }
      },
      // error: ((err: any) => { this.errors.handelError(err.statusCode) })
    });
  }

  getAllSchoolsByCenterId() {
    this.schoolArr = [];
    let Tid = this.stuRegistrationForm.value.talukaId
    let Cid = this.stuRegistrationForm.value.centerId || 0;
    let Vid = 0;
    this.masterService.getAllSchoolByCriteria('', Tid, Vid, Cid).subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.schoolArr = res.responseData;
          this.editFlag ? (this.stuRegistrationForm.controls['schoolId'].setValue(this.editObj.schoolId),this.getStandard()) : this.loginData.userTypeId == 4 ? (this.stuRegistrationForm.controls['schoolId'].setValue(this.loginData.schoolId), this.getStandard()):'';
        } else {
          this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
          this.schoolArr = [];
        }
      },
      // error: ((err: any) => { this.errors.handelError(err.statusCode) })
    });
  }

  getStandard() {
    this.standardArr = [];
    let schoolId = this.stuRegistrationForm.value.schoolId
    this.masterService.GetStandardBySchool(schoolId,'').subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.standardArr = res.responseData;
          this.editFlag ? this.stuRegistrationForm.controls['standard'].setValue(this.editObj.standardId) : '';
        } else {
          this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
          this.standardArr = [];
        }
      },
      // error: ((err: any) => {this.errors.handelError(err.statusCode) })
    });
  }

  getGender() {
    this.genderArr = [];
    this.masterService.getAllStudentGender('').subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.genderArr = res.responseData;
          this.editFlag ? this.stuRegistrationForm.controls['gender'].setValue(this.editObj.genderId) : '';
        } else {
          this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
          this.genderArr = [];
        }
      },
      // error: ((err: any) => { this.errors.handelError(err.statusCode) })
    });
  }

  getReligion() {
    this.religionArr = [];
    this.masterService.getAllReligion('').subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.religionArr = res.responseData;
          this.editFlag ? (this.stuRegistrationForm.controls['religionId'].setValue(this.editObj?.religionId), this.getCatogory()) : '';
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
    let id = this.stuRegistrationForm.value.religionId;
    this.masterService.GetAllCasteCategory(id,'').subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.catogoryArr = res.responseData;
          this.editFlag ? (this.stuRegistrationForm.controls['casteCategoryId'].setValue(this.editObj?.casteCategoryId),this.getCaste()) : '';
        } else {
          this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
          this.catogoryArr = [];
        }
      },
      // error: ((err: any) => {this.errors.handelError(err.statusCode || err.status) })
    });
  }

  getCaste() {
    this.casteArr = [];
    let id = this.stuRegistrationForm.value.casteCategoryId;
    this.masterService.getAllCaste(id,'').subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.casteArr = res.responseData;
          this.editFlag ? this.stuRegistrationForm.controls['casteId'].setValue(this.editObj?.casteId) : '';
        } else {
          this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
          this.casteArr = [];
        }
      },
      // error: ((err: any) => {this.errors.handelError(err.statusCode || err.status) })
    });
  }


  getRelation() {   
    this.relationArr = [];
    this.apiService.setHttp('get', 'zp-satara/master/GetAllRelation?flag_lang=', false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => {
          if (res.statusCode == 200) {
            this.relationArr = res.responseData;
            this.readOnlyFlag ? (this.addGardianForm.controls['relationId'].setValue( this.searchMobieNoObj?.[0]?.relationId)):'';
          } else {
            this.relationArr=[] 
          }
        },
        error: ((err: any) => { this.ngxSpinner.hide(); this.errors.handelError(err.statusCode) })
      });
    
  }

  //#endregion  ---------------------------------- Dropdown End here -----------------------------------------------

  onEdit(studentId:any){
    this.apiService.setHttp( 'get', 'zp-satara/Student/GetById?Id='+studentId+'&lan=', false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {         
          this.editObj = res.responseData;
          this. patchValue();
        } else {
          this.ngxSpinner.hide();
          this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
        }
      },
      error: ((err: any) => { this.ngxSpinner.hide(); this.errors.handelError(err.statusCode) })
    });
  }

  patchValue() { 
    this.readOnlyFlag = true;
    this.editFlag = true;
    this.stuRegistrationForm.patchValue({
      fName: this.editObj?.fName,
      mName: this.editObj?.mName,
      lName: this.editObj?.lName,
      f_MName: this.editObj?.f_MName,
      m_MName: this.editObj?.m_MName,
      l_MName: this.editObj?.l_MName,
      saralId: this.editObj?.saralId,
      casteId: this.editObj?.casteId,
      mobileNo: this.editObj?.gaurdianResponse[0]?.mobileNo,
      fatherFullName: this.editObj?.gaurdianResponse[0]?.fatherFullName,
      // m_FatherFullName: this.editObj?.gaurdianResponse[0]?.m_FatherFullName,
      motherName: this.editObj?.gaurdianResponse[0]?.motherName,
      // m_MotherName: this.editObj?.gaurdianResponse[0]?.m_MotherName,
      aadharNo: this.editObj?.aadharNo,
      dob: new Date(this.editObj?.dob.split(' ')[0]),
      physicallyDisabled: this.editObj?.isHandicaped ? 1 : 2
    });
    this.imageArray = this.editObj?.documentResponse;
    let aadharObj = this.editObj?.documentResponse?.find((res: any) => res.documentId == 2);
    let imageObj = this.editObj?.documentResponse?.find((res: any) => res.documentId == 1);
    this.uploadAadhaar = aadharObj?.docPath;
    this.uploadImg = imageObj?.docPath;

    this.gardianModelArr = this.editObj.gaurdianResponse
    // this.gardianModelArr.forEach((res:any)=>{
    //   // if(res.isHead == true){ 
    //   //   this.checkDisable = true;
    //   // }
    // })
    this.allDropdownMethods();
  }

  
 
  
  //#region  ----------------------------------------------- Submit logic Start here ------------------------------------------------

  onSubmit() {
    // this.ngxSpinner.show();
   
    
    let obj = this.stuRegistrationForm.value;
    let dateWithTime = this.datePipe.transform(obj.dob, 'yyyy-MM-dd' + 'T' + 'HH:mm:ss.ms');
   let gardianObj = this.gardianModelArr.filter((res:any)=>{return res.isHead == true}) 
    let postObj = {
      ... this.webService.createdByProps(),
      "id": this.editObj ? this.editObj.id : 0,
      "gaurdianId": this.editObj ? this.editObj.gaurdianId : 0,
      "fName": obj.fName?.trim(),
      "f_MName": obj.f_MName?.trim(),
      "mName": obj.mName?.trim(),
      "m_MName": obj.m_MName?.trim(),
      "lName": obj.lName?.trim(),
      "l_MName": obj.l_MName?.trim(),
      "stateId": obj.stateId || 1,
      "districtId": obj.districtId,
      "talukaId": obj.talukaId,
      "centerId": obj.centerId,
      "villageId": obj.villageId,
      "schoolId": obj.schoolId,
      "standard": obj.standard,
      "saralId": obj.saralId,
      "gender": obj.gender,
      "dob": dateWithTime,
      "religionId": obj.religionId,
      "casteCategoryId":obj.casteCategoryId,
      "casteId": obj.casteId,
      "aadharNo": obj.aadharNo,
      "isCastCertificate": true,
      "isParentsAlive": true,
      "isOnlyFatherAlive": true,
      "isOnlyMotherAlive": true,
      "isHandicaped": false,   //obj.physicallyDisabled == 1 ? true : false,
      "isHandicapedCertificate": true,
      "timestamp": new Date(),
      "localId": 0,
      "fatherFullName": obj.fatherFullName?.trim(),
      "motherName": obj.motherName?.trim(),
      "mobileNo": gardianObj[0]?.mobileNo || '',
      "gaurdianModel":this.gardianModelArr,
      "documentModel": this.imageArray,
      "lan": '',
      "eductionYearId": this.webService.getLoggedInLocalstorageData().educationYearId
    }
    
    // let isAtlstoneHead = this.gardianModelArr.some((item: any) => (item.isHead == true)); //p



    // let isAtlstDeletFlag = this.gardianModelArr.some((item: any) => (item.isDeleted === false));

    if (this.stuRegistrationForm.invalid) {
      this.ngxSpinner.hide();
      // if (!this.uploadImg) { this.imgFlag = true };
      if (!this.uploadAadhaar) { this.aadhaarFlag = true };
      this.commonMethods.showPopup(this.webService.languageFlag == 'EN' ? 'Please Enter Mandatory Fields' : 'कृपया अनिवार्य फील्ड प्रविष्ट करा', 1);
      return

    }
    // else if(this.gardianModelArr.length > 0 && !isAtlstoneHead){
    //   this.commonMethods.showPopup(this.webService.languageFlag == 'EN' ? 'Please checkmark Atleast One Head In Gardian Details.' : 'कृपया पालक तपशीलांमध्ये किमान एक हेड चिन्हांकित करा', 1);
    //   return
    // }
     else {
      
      // if (!this.uploadAadhaar) { //!this.uploadImg || 
      //   this.ngxSpinner.hide();
      //   // if (!this.uploadImg) { this.imgFlag = true, this.commonMethods.showPopup(this.webService.languageFlag == 'EN' ? 'Please Enter Mandatory Fields' : 'कृपया अनिवार्य फील्ड प्रविष्ट करा', 1); };
      //   if (!this.uploadAadhaar) { this.aadhaarFlag = true, this.commonMethods.showPopup(this.webService.languageFlag == 'EN' ? 'Please Enter Mandatory Fields' : 'कृपया अनिवार्य फील्ड प्रविष्ट करा', 1); };
      //   return
      // }
      
    
      let url = this.editObj ? 'UpdateStudent' : 'AddStudent'
      this.apiService.setHttp(this.editObj ? 'put' : 'post', 'zp-satara/Student/' + url, false, postObj, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => {
          if (res.statusCode == 200) {
            this.ngxSpinner.hide();
            this.apiService.staticData.next('getRefreshStaticdata');
            this.commonMethods.showPopup(res.statusMessage, 0);
            // this.dialogRef.close('yes')
            this.router.navigate(['/student-registration'])
          } else {
            this.ngxSpinner.hide();
            this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
          }
        },
        error: ((err: any) => { this.ngxSpinner.hide(); this.errors.handelError(err.statusCode) })
      });
    }
  }

  //#endregion   ----------------------------------------------- Submit logic End here ------------------------------------------------

  //#region ------------------------------------------- Image Logic Start Here -----------------------------------------------------------------
  fileUpload(event: any, photoName: string) {
    let type = photoName == 'img' ? 'jpg, jpeg, png' : 'jpg, jpeg, png, pdf';
    this.fileUpl.uploadDocuments(event, 'Upload', type).subscribe({
      next: (res: any) => {   
        if (res.statusCode == 200) {
          if (this.imageFile.nativeElement.value == this.aadharFile.nativeElement.value) {
            let msg = this.languageFlag == 'English' ? photoName == 'img' ? 'Upload different profile photo' : 'Upload different Aadhaar card' : photoName == 'img' ? 'भिन्न प्रोफाइल फोटो अपलोड करा' : 'वेगवेगळे आधार कार्ड अपलोड करा';
            this.commonMethods.showPopup(msg, 1);
            return
          }
          if (photoName == 'img') {
            this.uploadImg = res.responseData;
          } else {
            this.uploadAadhaar = res.responseData;
          }
          this.commonMethods.showPopup(res.statusMessage, 0);
          let obj = {
            "id": 0,
            "studentId": this.editObj ? this.editObj.id : 0,
            "documentId": photoName == 'img' ? 1 : 2,
            "docPath": photoName == 'img' ? this.uploadImg : this.uploadAadhaar
          }
          this.imageArray.push(obj);
        } else {
          photoName == 'img' ? (this.uploadImg = '', this.imageFile.nativeElement.value = '') : (this.uploadAadhaar = '', this.aadharFile.nativeElement.value = '');
        }
      },
      error: ((err: any) => { err.statusCode ? this.errors.handelError(err.statusCode) : this.commonMethods.showPopup(err, 1) })
    });
  }

  viewImages(photoName: string) {
    if (photoName == 'aadharPhoto') {
      window.open(this.uploadAadhaar, 'blank');
    } else if (photoName == 'photo') {
      window.open(this.uploadImg, 'blank')
    }
  }

  deleteImage(photoName: string) {
    if (photoName == 'aadharPhoto') {
      this.uploadAadhaar = '';
      this.aadharFile.nativeElement.value = '';
      let index = this.imageArray.findIndex(res => res.documentId == 2);
      this.imageArray.splice(index, 1);
    } else if (photoName == 'photo') {
      this.uploadImg = '';
      this.imageFile.nativeElement.value = '';
      let index = this.imageArray.findIndex(res => res.documentId == 1);
      this.imageArray.splice(index, 1);
    }
  }
  //#region ------------------------------------------- Image Logic End Here -----------------------------------------------------------------
 
  clearDropdown(name: any) {
    this.editFlag = false;
    if (name == 'talukaId') {
      this.stuRegistrationForm.controls['centerId'].setValue('');
      this.stuRegistrationForm.controls['schoolId'].setValue('');
      this.stuRegistrationForm.controls['standard'].setValue('');
      this.stuRegistrationForm.controls['villageId'].setValue('');
      this.schoolArr=[];
      this.standardArr=[];
      this.villageArr =[]
    } else if (name == 'centerId') {
      this.stuRegistrationForm.controls['schoolId'].setValue('');
      this.stuRegistrationForm.controls['standard'].setValue('');
      this.standardArr=[];
    } else if (name == 'schoolId') {
      this.stuRegistrationForm.controls['standard'].setValue('');
    }
     else if (name == 'religionId') {
      this.stuRegistrationForm.controls['casteCategoryId'].setValue('');
      this.stuRegistrationForm.controls['casteId'].setValue('');     
      this.casteArr = [];
    }else if(name =='casteCategoryId'){
      this.stuRegistrationForm.controls['casteId'].setValue('');
    }
  }

  searchMobileNo() {
    // let mobileNo = this.stuRegistrationForm.value.mobileNo;
    let mobileNo = this.addGardianForm.value.mobileNo;
    if (this.stuRegistrationForm.controls['mobileNo'].valid) {
      this.apiService.setHttp('get', 'zp-satara/Student/GetGaurdianByMobileNo?MobileNo=' + mobileNo + '&lan=', false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => {
          if (res.statusCode == 200) {
            this.searchMobieNoObj =res.responseData
            this.readOnlyFlag = true;
            this.addGardianForm.controls['name'].setValue( this.searchMobieNoObj[0]?.name);
            this.getRelation();
          } else {
            this.readOnlyFlag = false;
            this.fc['fatherFullName'].setValue('');
            this.fc['motherName'].setValue('');
          }
        },
        error: ((err: any) => {this.errors.handelError(err.statusCode) })
      });
    }
  }

  openDialog() {
    let formValue =this.stuRegistrationForm.value;
    let obj ={religionId: formValue.religionId,
    casteCategoryId: formValue.casteCategoryId}
    const dialogRef = this.dialog.open(AddCastComponent, {
      width: '400px',  
      data : obj,
      disableClose: true,
      autoFocus: false
    });
    dialogRef.afterClosed().subscribe((result: any) => {
     result == 'yes' ? this.getCaste() :'';
    });
  
}
}
