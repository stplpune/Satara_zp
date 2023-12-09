import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { MasterService } from 'src/app/core/services/master.service';
import { ValidationService } from 'src/app/core/services/validation.service';
import { WebStorageService } from 'src/app/core/services/web-storage.service';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';
@Component({
  selector: 'app-dashboard-student-details',
  templateUrl: './dashboard-student-details.component.html',
  styleUrls: ['./dashboard-student-details.component.scss']
})
export class DashboardStudentDetailsComponent implements OnInit, OnDestroy {
  pageNumber: number = 1;
  tableDataArray = new Array();
  totalCount!: number;
  tableDatasize!: Number;
  languageFlag!: string;
  data: any;
  dashboardObj: any
  talukaArr: any = []
  centerArr: any = []
  villageArr: any = [];
  schoolArr: any = []
  standardArr: any = [];
  subjectArr: any = [];
  groupByClassArray: any = [];
  lineChartOptions: any;
  grapbhDetailsArray = new Array();
  displayedColumns = ['srNo', 'profilePhoto','fullName', 'subjectName'];   //, 'actualGrade'
  marathiDisplayedColumns = ['srNo', 'profilePhoto', 'm_FullName', 'm_SubjectName']; //, 'actualGrade'
  displayedheaders = ['Sr. No.', '', 'Name', 'Subject' ]; //,'Status'
  marathiDisplayedheaders = ['अ.क्र.', '', 'नाव', 'विषय']; //, 'स्तर',
  displayedheadersClass:any=[{'label':"Sr. No.","m_label":"अ.क्र."}, {'label':"Subject","m_label":"विषय"},{'label':"Grade","m_label":"स्तर"},{'label':"Marks","m_label":"गुण"},{'label':"ExamType","m_label":"परीक्षेचा प्रकार"},{'label':"Expected level","m_label":"अपेक्षित स्तर"}, {'label':"Obtained Grade","m_label":"प्राप्त स्तर"}]
  displayedheadersClassAsseTakenBy:any=[{'label':"Sr. No.","m_label":"अ.क्र."}, {'label':"Name","m_label":"नाव"},{'label':"Designation","m_label":"पद"},{'label':"Assessment Date","m_label":"मूल्यांकन तारीख"} ]

  filterForm!: FormGroup
  subjectArray = new Array();
  subjectNameClassWise: any;
  inspectionBy = new FormControl('');
  lang!: string;
  showLineChart: boolean = false;
  groupID: any;
  objData: any
  langChangeSub!: Subscription;
  selectedTaluka: any;
  selectedVillage: any;
  selectedCenter: any;
  selectedShcool: any;
  selectedObj:any;
  acYear=new Array();
  langSubList= new Array();
  mathSubList= new Array();
  classwiseAsseTakenList = new Array();
  educationYear!:number;
  assessmentLevelId : any;
  ExamTypeArray= new Array();
  totalMarksInSub : any;
  uniqueStudentCount!: number;
  stateData = new Array();
  districtData = new Array();

  @ViewChild('myDiv') myDiv!: ElementRef;
  constructor(
    private fb: FormBuilder,
    private ngxSpinner: NgxSpinnerService,
    private apiService: ApiService,
    public webService: WebStorageService,
    private errors: ErrorsService,
    public validators: ValidationService,
    public translate: TranslateService,
    private commonMethods: CommonMethodsService,
    private masterService: MasterService,
  ) {

  }
  ngOnInit() {
    this.dashboardObj = JSON.parse(localStorage.getItem('selectedBarchartObjData') || '');
    this.educationYear=this.dashboardObj?this.dashboardObj?.EducationYearId:this.webService.getLoggedInLocalstorageData()?.educationYearId;
    this.assessmentLevelId = this.dashboardObj?.asessmwntLavel;
    this.formData();
    this.getYearArray();
    this.getState();
    // this.getTaluka();
    // this.getTableData();
    this.getExamType();
    this.getTableData();
    this.inspectionBy.patchValue('0')
    this.langChangeSub = this.webService.langNameOnChange.subscribe(lang => {
      this.languageFlag = lang;
      this.getSubject();
      setTimeout(()=>{
        this.selectedObj?this.setTableData():'';
      },300)
    });

  }

  formData() {
    this.filterForm = this.fb.group({
      acYearId:[''],
      stateId:[''],
      districtId:[''],
      talukaId: [0],
      villageId:[0],
      centerId: [0],
      schoolId: [0],
      standardId: [(this.dashboardObj && this.assessmentLevelId == '0') ? this.dashboardObj?.standardArray[0] : this.dashboardObj?.StandardId],
      subjectId: [0],
      examTypeId: [0]
    });
  }

  getYearArray(){
    this.acYear=[];
    this.masterService.getAcademicYears().subscribe((res: any) => {
      this.acYear.push( ...res.responseData);
      this.filterForm.controls['acYearId'].patchValue(this.educationYear)
    })
  }

  getState(){
    this.stateData = [];
    this.masterService.getAllState(this.languageFlag).subscribe((res:any)=>{
     this.stateData = res.responseData;
     this.getDistrict()
    })
  }

  getDistrict() {
    this.districtData = [];
    this.masterService.getAllDistrict(this.languageFlag, this.filterForm.controls['stateId'].value).subscribe((res: any) => {
      this.districtData = res.responseData;
    });
  }



  setTableData() {
    this.setViewData();
    this.getLineChartDetails();
    // this.loadClassWisetable();
    let tableData = {
      pageNumber: this.pageNumber,
      pageName:'Profile',
      highlightedrow:true,
      img: 'profilePhoto', blink: true, badge: '', isBlock: '', pagintion: false, status: 'actualGrade',
      displayedColumns: this.languageFlag == 'English' ? this.displayedColumns : this.marathiDisplayedColumns,
      tableData: this.tableDataArray,
      tableSize: this.totalCount,
      tableHeaders: this.languageFlag == 'English' ? this.displayedheaders : this.marathiDisplayedheaders
    };
    this.apiService.tableData.next(tableData);
  }

  setViewData() {
    let obj = this.selectedObj ? this.selectedObj : this.tableDataArray[0];
    if (obj) {
      this.data = {
        headerImage: obj?.profilePhoto,
        header: this.languageFlag == 'Marathi' ? obj.m_FullName : obj.fullName,
        subheader: this.languageFlag == 'Marathi' ? obj.m_Gender : obj.gender,
        labelHeader: this.languageFlag == 'Marathi' ? ['पालकाचे नाव', 'पालक मोबाईल क्र.', 'चाचणी क्र', 'शैक्षणिक वर्ष', 'आधार क्र.', 'इयत्ता', 'शाळेचे नाव'] : ['Guardian Name', 'Parent Mobile No.', 'Academic Year', 'Aadhaar No.', 'Standard', 'School Name'],
        labelKey: this.languageFlag == 'Marathi' ? ['m_GaurdianName', 'mobileNo', '', 'm_AcademicYear', 'aadharNo', 'standard', 'm_SchoolName'] : ['gaurdianName', 'mobileNo', 'm_AcademicYear', 'aadharNo', 'standard', 'schoolName'],
        Obj: obj,
        chart: false
      }
      this.webService.studentDetails=this.data;
    }
  }


  getTableData(flag?: any) {
    this.ngxSpinner.show();
    this.pageNumber = flag == 'filter' ? 1 : this.pageNumber;
    let StateId = flag == 'filter' ? this.filterForm.value?.talukaId : this.dashboardObj?.State;
    let DistrictId = flag == 'filter' ? this.filterForm.value?.talukaId : this.dashboardObj?.District;
    let TalukaId = flag == 'filter' ? this.filterForm.value?.talukaId : this.dashboardObj?.TalukaId;
    let CenterId = flag == 'filter' ? this.filterForm.value?.centerId : this.dashboardObj?.CenterId;
    let villageId = flag == 'filter' ? this.filterForm.value?.villageId : this.dashboardObj?.VillageId;
    let SchoolId = flag == 'filter' ? this.filterForm.value?.schoolId : this.dashboardObj?.SchoolId;
    let StandardId = flag == 'filter' ? this.filterForm.value?.standardId : ((this.dashboardObj?.standardArray?.length >= 2) && (this.dashboardObj.asessmwntLavel == "0")) ? 0 : this.filterForm.value?.standardId;
    let SubjectId = flag == 'filter' ? this.filterForm.value?.subjectId : this.dashboardObj?.SubjectId;
    let AcademicYearId = flag == 'filter' ? this.filterForm.value?.acYearId : this.dashboardObj?.EducationYearId;
    // let AssessmentTypeId =  this.dashboardObj?.asessmwntLavel;
    // let GroupId = flag == 'filter' ? this.filterForm.value?.groupByClass : this.dashboardObj?.groupId;
    // let examTypeId = this.dashboardObj?.ExamTypeId ? this.dashboardObj?.ExamTypeId : 0
    let examTypeId = flag == 'filter' ? this.filterForm.value?.examTypeId : this.dashboardObj?.ExamTypeId;
    let questionId = this.dashboardObj?.questionId ? this.dashboardObj?.questionId : 0;
    let optionId = this.dashboardObj?.optionId || 0;


    if (this.dashboardObj?.label == "table") {
      this.getAllSchoolsByCenterId();
      let studentApi = 'GetDataForTopLowSchoolStudentList'
      // let basicStr = 'zp-satara/Dashboard/' + studentApi + '?GroupId='+(flag == 'filter' ? this.filterForm.value?.groupByClass : 0)+'&StandardId='+(flag == 'filter' ? this.filterForm.value?.standardId : 0)+'&AssessmentTypeId='+(AssessmentTypeId == 0? 1: 2)  + '&TalukaId=' + (TalukaId || 0) + '&CenterId=' + (CenterId || 0) + '&SchoolId=' + (SchoolId || 0) + '&SubjectId=' + (SubjectId || 0) + '&ExamTypeId=' + examTypeId + '&AcademicYearId=' + AcademicYearId +'&OptionId='+questionId;
      let basicStr = 'zp-satara/Dashboard/' + studentApi +  '?GroupId=0' + '&TalukaId=' + TalukaId+'&CenterId=' + CenterId + '&VillageId=' + villageId + '&SchoolId=' + SchoolId + '&SubjectId=' + SubjectId + '&OptionId=' + optionId + '&ExamTypeId=' + examTypeId + '&AcademicYearId=' + AcademicYearId + '&lan=' + this.languageFlag;
      
      this.apiService.setHttp('GET', basicStr, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => {
          if (res.statusCode == 200 && res.responseData.responseData1.length) {
            this.ngxSpinner.hide();
            this.tableDataArray = res.responseData.responseData1;         
            const uniqueStudentList = [...new Set(this.tableDataArray.map(item => item.studentId))]; // [ 'A', 'B']    
            this.uniqueStudentCount =(uniqueStudentList?.length);    //  for Unique count of Schooldata       
            this.totalCount = res.responseData?.responseData2?.pageCount || 0;
            let obj = this.tableDataArray[0];
            obj.subjectId = flag == 'filter' ? this.filterForm.value.subjectId : this.dashboardObj?.SubjectId;
            this.selectedObj = obj;
            this.dashboardObj.groupId = this.selectedObj.groupId;
            localStorage.setItem("selectedBarchartObjData",JSON.stringify(this.dashboardObj));
            // *********************************************************
            (res.responseData.responseData1.length && this.assessmentLevelId == '1') ? this.loadClassWisetable() : '';
            // *********************************************************
            
            //this.getLineChartDetails();
          } else {
            this.ngxSpinner.hide();
            this.tableDataArray = [];
            this.totalCount = 0;
            this.data = ''
            this.selectedObj = '';
          }
          this.setTableData();
        },
        error: ((err: any) => { this.ngxSpinner.hide(); this.errors.handelError(err.statusCode) })
      });
    }
    else {
      // let studentApi = 'GetDashboardDataStudentListForCommon'
      // let basicStr = 'zp-satara/Dashboard/' + studentApi + '?GroupId=' + GroupId + '&TalukaId=' + (TalukaId || 0) + '&CenterId=' + (CenterId || 0) + '&VillageId= '+ (villageId || 0) +'&SchoolId=' + (SchoolId || 0) + '&SubjectId=' + (SubjectId || 0) + '&OptionGrade=' + ((this.dashboardObj && flag == undefined) ? this.dashboardObj.OptionGrade : 0) + '&StandardId=' + (StandardId || 0) + '&AcademicYearId=' + AcademicYearId + '&ExamTypeId=' + examTypeId + '&lan='
      let classStr = 'zp-satara/Dashboard/GetDashboardDataClassWise_StudentList?StateId='+StateId+'&DistrictId='+DistrictId+'&TalukaId=' + (TalukaId || 0) + '&CenterId=' + (CenterId || 0) + '&VillageId= '+ (villageId || 0) + '&SchoolId=' + (SchoolId || 0) + '&StandardId=' + StandardId + '&SubjectId=' + (SubjectId || 0) + '&QuestionId=' + questionId + '&OptionGrade=' + ((this.dashboardObj && flag == undefined) ? this.dashboardObj.OptionGrade : 0) + '&ExamTypeId=' + (examTypeId || 0) + '&AcademicYearId=' + AcademicYearId+ '&EvaluatorId='+1+'&lan='

      this.apiService.setHttp('GET',classStr, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => {
          if (res.statusCode == 200 && res.responseData.responseData1.length) {
            this.ngxSpinner.hide();
            this.tableDataArray = res.responseData.responseData1;
            this.totalCount = res.responseData?.responseData2?.pageCount || 0;

            let obj = this.tableDataArray[0];
            obj.subjectId = flag == 'filter' ? this.filterForm.value.subjectId : this.dashboardObj?.SubjectId;
            this.selectedObj = obj;
            (res.responseData.responseData1.length && this.assessmentLevelId == '1') ? this.loadClassWisetable() : '';
            //this.getLineChartDetails();
          } else {
            this.ngxSpinner.hide();
            this.tableDataArray = [];
            this.totalCount = 0;
            this.data = ''
            this.selectedObj = '';
          }
          this.setTableData();
        },
        error: ((err: any) => { this.ngxSpinner.hide(); this.errors.handelError(err.statusCode) })
      });
    }

  }

  loadClassWisetable(){
    let filterFormValue = this.filterForm.value;
    let studentObj = this.selectedObj;

    // let standardId = this.filterForm.value?.standardId;     
    // let AcademicYearId = flag == 'filter' ? this.filterForm.value?.acYearId : this.dashboardObj?.EducationYearId;
    // let examTypeId = flag == 'filter' ? this.filterForm.value.examTypeId : this.dashboardObj?.ExamTypeId; 
    // let AcademicYearId = this.filterForm.value?.acYearId 
    // let examTypeId =  this.filterForm.value.examTypeId
    // let chartApiTopLowstu = 'GetDataForTopLowSchoolStudentChart';
    // let chartAPI = 'GetDashboardDataClassWise_StudentChart';    
    // let tableAPI = 'GetDashboardDataClassWise_StudentList';
 
    let chartAPI = 'GetDashboardDataClassWise_StudentChart?StudentId='+this.selectedObj?.studentId+'&StandardId='+filterFormValue?.standardId+'&AssesmentSubjectId='+0+'&IsInspection='+this.inspectionBy.value+'&ExamTypeId='+(filterFormValue?.examTypeId || 0) +'&EducationYearId='+filterFormValue?.acYearId+'&lan=' + this.languageFlag;

    let tableAPI = 'GetDataForTopLowSchoolStudentChart?GroupId=' + studentObj?.groupId + '&StudentId=' + studentObj?.studentId + '&AssesmentSubjectId=' + studentObj?.assesmentSubjectId + '&IsInspection='+this.inspectionBy.value+'&ExamTypeId=' + (filterFormValue?.examTypeId || 0) + '&EducationYearId=' + studentObj?.academicYearId + '&lan=' + this.languageFlag;
    
    // let str = 'zp-satara/Dashboard/'+(this.dashboardObj?.label == "table" ? chartApiTopLowstu : chartAPI)+'?StudentId='+this.selectedObj?.studentId+'&StandardId='+standardId+'&EducationYearId='+AcademicYearId+'&AssesmentSubjectId='+0+'&ExamTypeId='+examTypeId+'&IsInspection='+this.inspectionBy.value+'&lan='
    let str = this.dashboardObj?.label == "table" ? tableAPI : chartAPI;
    
    this.apiService.setHttp('GET', 'zp-satara/Dashboard/'+ str, false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any)=>{
        if (res.statusCode == "200"){
          this.webService.classWiseDataStudentAssList = res;
          this.webService.inspectionByValue = this.inspectionBy.value;
          this.langSubList = res.responseData?.responseData1.filter((x:any)=>{
           return x.subjectId == 1
          });
          // this.getClassTableDtaByUser();
          this.mathSubList = res.responseData?.responseData1.filter((x:any)=>{
           return x.subjectId == 3
          });
          this.totalMarksInSub = res.responseData?.responseData3[0];
          this.classwiseAsseTakenList = res.responseData?.responseData2;
        }
        else{
          this.totalMarksInSub = null;
        }
      }
    });
  }

  getExamType(){
    this.masterService.getExamType().subscribe((res: any) => {
      this.ExamTypeArray=[{ "id": 0, "examType": "All", "m_ExamType": "सर्व" }].concat(res.responseData);
      // this.ExamTypeArray.sort((a,b) => a.id - b.id );
      this.dashboardObj ? this.filterForm.controls['examTypeId'].setValue(this.dashboardObj?.ExamTypeId) : '';
    })
  }





  searchStudentDetails(flag?: any){
    this.dashboardObj.OptionGrade = 0;
    this.getTableData(flag);
  }

  getTaluka() {
    this.talukaArr = [];
    let districtId = this.filterForm.controls['districtId'].value
    if(districtId != 0){
      this.masterService.getAllTaluka('', districtId).subscribe({
        next: (res: any) => {
          if (res.statusCode == 200) {
            this.talukaArr.push({ "id": 0, "taluka": "All", "m_Taluka": "सर्व" }, ...res.responseData);
            this.filterForm.controls['talukaId'].setValue(0);
            this.dashboardObj ? (this.filterForm.controls['talukaId'].setValue(this.dashboardObj?.TalukaId), this.getAllCenter()) : this.getAllCenter();
            // this.talukaArr = res.responseData;
          } else {
            this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
            this.talukaArr = [];
          }
        },
        // error: ((err: any) => { this.errors.handelError(err.statusCode) })
      });
    }
   
  }

  getAllCenter() {
    this.selectedTaluka = this.talukaArr.find((res: any) => this.filterForm.value.talukaId ? this.filterForm.value.talukaId == res.id : this.dashboardObj?.TalukaId == res.id);
    this.centerArr = [];
    let Tid = this.filterForm.value.talukaId;
    if (Tid != 0) {
      this.masterService.getAllCenter('', Tid).subscribe({
        next: (res: any) => {
          if (res.statusCode == 200) {
            this.centerArr.push({ "id": 0, "center": "All", "m_Center": "सर्व" }, ...res.responseData);
            this.filterForm.controls['centerId'].setValue(0);
            this.dashboardObj ? (this.filterForm.controls['centerId'].setValue(this.dashboardObj?.CenterId), this.getAllSchoolsByCenterId()) : this.getAllSchoolsByCenterId();
          } else {
            this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
            this.centerArr = [];
          }
        },
        // error: ((err: any) => { this.errors.handelError(err.statusCode) })
      });
    }
  }

  getVillage() {
    this.selectedCenter = this.centerArr.find((res: any) => this.filterForm.value.centerId ? this.filterForm.value.centerId == res.id : this.dashboardObj?.CenterId == res.id);
    this.villageArr = [];
    let centerId = this.filterForm.value.centerId;
    if(centerId != 0){
      this.masterService.getAllVillage('', centerId).subscribe({
        next : (res : any)=>{
          if(res.statusCode == "200"){
            this.villageArr.push({ "id": 0, "village": "All", "m_Village": "सर्व" }, ...res.responseData);
            this.filterForm.controls['villageId'].patchValue(0);
          } else{
            this.villageArr = [];
          }
        },
        // error: ((err: any) => { this.errors.handelError(err.statusCode) })
      });
    }
  }

  getAllSchoolsByCenterId() {    
    this.selectedVillage = this.villageArr.find((res: any) => this.filterForm.value.villageId ? this.filterForm.value.villageId == res.id : this.dashboardObj?.VillageId == res.id);
    this.schoolArr = [];
    let Tid = this.filterForm.value.talukaId;
    let Cid = this.filterForm.value.centerId;
    let Vid = this.filterForm.value.villageId;
    if (Vid != 0) {  //removed - when navigate from  high low school table not patch schoolname in heading  
      this.masterService.getAllSchoolByCriteria('',Tid, Vid,Cid).subscribe({
        next: (res: any) => {
          if (res.statusCode == 200) {
            this.schoolArr.push({ "id": 0, "schoolName": "All", "m_SchoolName": "सर्व" }, ...res.responseData);
            this.filterForm.controls['schoolId'].setValue(0);
            this.selectedShcool = this.schoolArr.find((res: any) => this.filterForm.value.schoolId ? this.filterForm.value.schoolId == res.id : this.dashboardObj?.SchoolId == res.id);            
            this.dashboardObj ? this.filterForm.controls['schoolId'].setValue(this.dashboardObj?.SchoolId) : '';
          } else {
            // this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
            this.schoolArr = [];
          }
        },
        // error: ((err: any) => { this.errors.handelError(err.statusCode) })
      });
    }
  }

 

  getStandard() {
    this.standardArr =[];
    let schoolId = this.filterForm.value.schoolId;
    if(schoolId != 0){
      this.masterService.GetStandardBySchool(schoolId, '').subscribe({
        next: (res: any) => {
          if (res.statusCode == 200) {
            this.standardArr = [];
            this.standardArr.push({ "id": 0, "standard": "All", "m_Standard": "सर्व" }, ...res.responseData);
            (this.dashboardObj && this.assessmentLevelId == '0') ? this.filterForm.controls['standardId'].setValue(this.dashboardObj?.standardArray[0]) : this.filterForm.controls['standardId'].setValue(this.dashboardObj?.StandardId)
          } else {
            this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
            this.standardArr = [];
          }
        },
        // error: ((err: any) => { this.errors.handelError(err.statusCode) })
      });
    }
  }


  getSubject() {
    this.subjectArr = [];
      this.masterService.getAllSubject('').subscribe({
        next: (res: any) => {
          if (res.statusCode == 200) {
            this.subjectArr.push({ "id": 0, "subject": "All", "m_Subject": "सर्व" }, ...res.responseData);
            this.dashboardObj ? this.filterForm.controls['subjectId'].setValue(this.dashboardObj?.SubjectId) : '';
          } else {
            this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
            this.subjectArr = [];
          }
        },
        error: ((err: any) => { this.errors.handelError(err.statusCode) })
      });
  }

  clearDropdown(name?: any) {
    this.dashboardObj?.label == "table" ? '' :this.dashboardObj = '';
    if(name == 'state'){
      this.filterForm.controls['districtId'].setValue('');
      this.filterForm.controls['talukaId'].setValue('');
      this.filterForm.controls['centerId'].setValue('');
      this.filterForm.controls['villageId'].setValue('');
      this.filterForm.controls['schoolId'].setValue('');
      this.districtData = [];
      this.talukaArr = [];
      this.centerArr = [];
      this.villageArr = [];
      this.schoolArr = [];
      this.standardArr = [];
    }
    else if(name == 'districtId'){
      this.filterForm.controls['talukaId'].setValue('');
      this.filterForm.controls['centerId'].setValue('');
      this.filterForm.controls['villageId'].setValue('');
      this.filterForm.controls['schoolId'].setValue('');
      this.talukaArr = [];
      this.centerArr = [];
      this.villageArr = [];
      this.schoolArr = [];
      this.standardArr = [];

    }
    else if (name == 'talukaId') {
      this.filterForm.controls['centerId'].setValue('');
      this.filterForm.controls['villageId'].setValue('');
      this.filterForm.controls['schoolId'].setValue('');
      this.centerArr = [];
      this.villageArr = [];
      this.schoolArr = [];
      this.standardArr = [];
      this.selectedShcool='';
    } else if (name == 'centerId') {
      this.filterForm.controls['villageId'].setValue('');
      this.filterForm.controls['schoolId'].setValue('');
      this.villageArr = [];
      this.schoolArr = [];
      this.standardArr = [];
    }
    else if (name == 'villageId'){
      this.filterForm.controls['schoolId'].setValue('');
      this.schoolArr = [];
      this.standardArr = [];
    }
    else if(name == 'schoolId'){
      this.filterForm.controls['standardId'].setValue('');
      this.standardArr = [];
    }
  }

  childTableCompInfo(obj: any) {
    switch (obj.label) {
      case 'View': 
        this.selectedObj=obj;
        this.dashboardObj?.label == "table" ? (this.dashboardObj.groupId = this.selectedObj.groupId,localStorage.setItem("selectedBarchartObjData",JSON.stringify(this.dashboardObj))) :''
        this.dashboardObj.groupId = this.selectedObj.groupId;
        
        localStorage.setItem("selectedBarchartObjData", JSON.stringify(this.dashboardObj));                
        // this.setViewData();
        obj.subjectId = this.filterForm.value.subjectId ? this.filterForm.value.subjectId : this.dashboardObj?.SubjectId;
        // this.getLineChartDetails();
        this.setTableData();
        this.inspectionBy.setValue('0');
       (this.assessmentLevelId == '1') ? this.loadClassWisetable() : '';
// this.loadClassWisetable();
        break;
    }
  }

  clearForm() {
    this.filterForm.reset();
    this.filterForm.controls['acYearId'].patchValue(this.educationYear)
    this.dashboardObj = '';
    this.schoolArr = [];
    this.villageArr = [];
    this.standardArr = [];
    this.subjectArr = [];
    this.selectedCenter = '';
    this.selectedVillage = '';
    this.selectedTaluka = '';
    this.selectedShcool = '';
    this.getTaluka();
    // this.dashboardObj.label == "table" ? this.filterForm.controls['groupByClass'].patchValue(1) :this.filterForm.controls['groupByClass'].patchValue(0)
    this.filterForm.controls['groupByClass'].patchValue(1)
    this.filterForm.controls['examTypeId'].patchValue(0)
    this.filterForm.controls['StandardId'].patchValue(0)
    this.filterForm.controls['villageId'].patchValue(0)

    // this.getTableData();
  }

  getLineChartDetails() {    
    setTimeout(()=>{
      //let subject = this.subjectArr.find((res: any) => res.id == this.selectedObj.assesmentSubjectId);
      this.objData = {
        objData: this.selectedObj,
        groupId: this.dashboardObj?.label == "table" ?  this.dashboardObj?.groupId : this.groupID | 0,
        // selectedSubject:  this.languageFlag == 'English' ? subject?.subjectName : subject?.m_SubjectName,
        selectedSubject:  this.languageFlag == 'English' ? this.selectedObj?.subjectName : this.selectedObj?.m_SubjectName,
        educationYearId:this.filterForm.controls['acYearId'].value,
        lang:this.languageFlag,
      }
      this.objData.objData ? (this.webService.selectedLineChartObj.next(this.objData)) : '';
    },200)
  }

  getSchoolName(){
    this.selectedShcool = this.schoolArr.find((res: any) => this.filterForm.value.schoolId ? this.filterForm.value.schoolId == res.id : this.dashboardObj?.SchoolId == res.id);
  }

  downloadStudentDetails(){
    const DATA = this.myDiv.nativeElement;
    html2canvas(DATA).then(canvas => {        
      let fileWidth = 200;
      let fileHeight = canvas.height * fileWidth / canvas.width;
      const FILEURI = canvas.toDataURL('image/png')
      let PDF = new jsPDF('p', 'mm', 'a4');
      PDF.addImage(FILEURI, 'PNG', 5, 5, fileWidth, fileHeight)      
      PDF.save('angular-demo.pdf');
    }); 
  }

  ngOnDestroy() {
    this.langChangeSub.unsubscribe();
  }
}
