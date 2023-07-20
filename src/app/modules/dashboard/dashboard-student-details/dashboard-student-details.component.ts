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
  schoolArr: any = []
  standardArr: any = [];
  subjectArr: any = [];
  groupByClassArray: any = [];
  lineChartOptions: any;
  grapbhDetailsArray = new Array();
  displayedColumns = ['profilePhoto', 'srNo', 'fullName', 'subjectName'];   //, 'actualGrade'
  marathiDisplayedColumns = ['profilePhoto', 'srNo', 'm_FullName', 'm_SubjectName']; //, 'actualGrade'
  displayedheaders = ['', 'Sr. No.', 'Name', 'Subject' ]; //,'Status'
  marathiDisplayedheaders = ['', 'अ.क्र.', 'नाव', 'विषय']; //, 'स्तर',
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
    this.getGroupIdByTalukaCenterSchool();
    this.getYearArray();
    this.getTaluka();
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
      acYearId:[],
      talukaId: [0],
      centerId: [0],
      schoolId: [0],
      groupByClass: [0],
      // standardId: [0],
    //  standardId: [],

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
  setTableData() {
    this.setViewData();
    this.getLineChartDetails();
    // this.loadClassWisetable();
    this.getSubjectData();
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
        labelHeader: this.languageFlag == 'Marathi' ? ['वडीलांचे नाव', 'आईचे नाव', 'पालक मोबाईल क्र.', 'चाचणी क्र', 'शैक्षणिक वर्ष', 'आधार क्र.', 'इयत्ता', 'शाळेचे नाव'] : ['Father Name', 'Mother Name', 'Parent Mobile No.', 'Academic Year', 'Aadhaar No.', 'Standard', 'School Name'],
        labelKey: this.languageFlag == 'Marathi' ? ['fatherFullName', 'motherName', 'mobileNo', '', 'm_AcademicYear', 'aadharNo', 'standard', 'm_SchoolName'] : ['fatherFullName','motherName', 'mobileNo', 'm_AcademicYear', 'aadharNo', 'standard', 'schoolName'],
        Obj: obj,
        chart: false
      }
      this.webService.studentDetails=this.data;
    }
  }


  getTableData(flag?: any) {
    // this.ngxSpinner.show();
    // this.pageNumber = flag == 'filter' ? 1 : this.pageNumber
    // let TalukaId = flag == 'filter' ? this.filterForm.value?.talukaId : this.dashboardObj?.TalukaId;
    // let CenterId = flag == 'filter' ? this.filterForm.value?.centerId : this.dashboardObj?.CenterId;
    // let SchoolId = flag == 'filter' ? this.filterForm.value?.schoolId : this.dashboardObj?.SchoolId;    
    // let StandardId = flag == 'filter' ? this.filterForm.value?.standardId : ((this.dashboardObj?.standardArray?.length >= 2) && (this.dashboardObj.asessmwntLavel == "0")) ? 0 : this.filterForm.value?.standardId;

    // let SubjectId = flag == 'filter' ? this.filterForm.value?.subjectId : this.dashboardObj?.SubjectId;
    // let AcademicYearId = flag == 'filter' ? this.filterForm.value?.acYearId : this.dashboardObj?.EducationYearId;
    // // let lan = this.webService.languageFlag;
    // let GroupId = this.groupID ? this.groupID : this.dashboardObj ? this.dashboardObj?.groupId : 1;
    // // let examTypeId = this.dashboardObj?.ExamTypeId ? this.dashboardObj?.ExamTypeId : 0
    // let examTypeId = flag == 'filter' ? this.filterForm.value?.examTypeId : this.dashboardObj?.ExamTypeId;
    // let questionId = this.dashboardObj?.questionId ? this.dashboardObj?.questionId : 0;

    // let studentApi = 'GetDashboardDataStudentListForCommon'    
    // let basicStr = 'zp-satara/Dashboard/' + studentApi + '?GroupId=' + GroupId + '&TalukaId=' + (TalukaId || 0) + '&CenterId=' + (CenterId || 0) + '&SchoolId=' + (SchoolId || 0) + '&SubjectId=' + (SubjectId || 0) + '&OptionGrade=' + ((this.dashboardObj && flag == undefined)  ? this.dashboardObj.OptionGrade : 0) + '&StandardId=' + (StandardId || 0) + '&AcademicYearId='+AcademicYearId + '&ExamTypeId='+examTypeId+'&lan='
    // let classStr = 'zp-satara/Dashboard/GetDashboardDataClassWise_StudentList?TalukaId=' + (TalukaId || 0) + '&CenterId=' + (CenterId || 0) + '&SchoolId=' + (SchoolId || 0) + '&StandardId='+StandardId+'&SubjectId=' + (SubjectId || 0) + '&QuestionId='+questionId+'&OptionGrade=' + ((this.dashboardObj && flag == undefined)  ? this.dashboardObj.OptionGrade : 0) + '&ExamTypeId='+examTypeId+'&AcademicYearId='+AcademicYearId+'&lan='
    
    // this.apiService.setHttp('GET', (this.assessmentLevelId == '0') ? basicStr: classStr, false, false, false, 'baseUrl');
    // this.apiService.getHttp().subscribe({
    //   next: (res: any) => {
    //     if (res.statusCode == 200 && res.responseData.responseData1.length) {
    //       this.ngxSpinner.hide();
    //       this.tableDataArray = res.responseData.responseData1;
    //       this.totalCount = res.responseData?.responseData2?.pageCount || 0;
          
    //       let obj = this.tableDataArray[0];
    //       obj.subjectId = flag == 'filter' ? this.filterForm.value.subjectId : this.dashboardObj?.SubjectId;
    //       this.selectedObj = obj;          
    //       (res.responseData.responseData1.length && this.assessmentLevelId == '1') ? this.loadClassWisetable() : '';
    //       this.getSubjectData();
    //       //this.getLineChartDetails();
    //     } else {
    //       this.ngxSpinner.hide();
    //       this.tableDataArray = [];
    //       this.totalCount = 0;
    //       this.data = ''
    //       this.selectedObj = '';
    //     }
    //     this.setTableData();
    //   },
    //   error: ((err: any) => { this.ngxSpinner.hide(); this.errors.handelError(err.statusCode) })
    // });

    this.ngxSpinner.show();
    this.pageNumber = flag == 'filter' ? 1 : this.pageNumber;
    let TalukaId = flag == 'filter' ? this.filterForm.value?.talukaId : this.dashboardObj?.TalukaId;
    let CenterId = flag == 'filter' ? this.filterForm.value?.centerId : this.dashboardObj?.CenterId;
    let SchoolId = flag == 'filter' ? this.filterForm.value?.schoolId : this.dashboardObj?.SchoolId;
    let StandardId = flag == 'filter' ? this.filterForm.value?.standardId : ((this.dashboardObj?.standardArray?.length >= 2) && (this.dashboardObj.asessmwntLavel == "0")) ? 0 : this.filterForm.value?.standardId;
    let SubjectId = flag == 'filter' ? this.filterForm.value?.subjectId : this.dashboardObj?.SubjectId;
    let AcademicYearId = flag == 'filter' ? this.filterForm.value?.acYearId : this.dashboardObj?.EducationYearId;
    let AssessmentTypeId =  this.dashboardObj?.asessmwntLavel;
    // let GroupId = this.dashboardObj?.groupId;
    let GroupId = flag == 'filter' ? this.filterForm.value?.groupByClass : this.dashboardObj?.groupId;
    // let examTypeId = this.dashboardObj?.ExamTypeId ? this.dashboardObj?.ExamTypeId : 0
    let examTypeId = flag == 'filter' ? this.filterForm.value?.examTypeId : this.dashboardObj?.ExamTypeId;
    let questionId = this.dashboardObj?.questionId ? this.dashboardObj?.questionId : 0;


    if (this.dashboardObj?.label == "table") {
      this.getAllSchoolsByCenterId();
      let studentApi = 'GetDataForTopLowSchoolStudentList'
      // let basicStr = 'zp-satara/Dashboard/' + studentApi + '?GroupId=' + GroupId + '&TalukaId=' + (TalukaId || 0) + '&CenterId=' + (CenterId || 0) + '&SchoolId=' + (SchoolId || 0) + '&SubjectId=' + (SubjectId || 0) + '&ExamTypeId=' + examTypeId + '&AcademicYearId=' + AcademicYearId;
      let basicStr = 'zp-satara/Dashboard/' + studentApi + '?GroupId='+(flag == 'filter' ? this.filterForm.value?.groupByClass : 0)+'&StandardId='+(flag == 'filter' ? this.filterForm.value?.standardId : 0)+'&AssessmentTypeId='+(AssessmentTypeId == 0? 1: 2)  + '&TalukaId=' + (TalukaId || 0) + '&CenterId=' + (CenterId || 0) + '&SchoolId=' + (SchoolId || 0) + '&SubjectId=' + (SubjectId || 0) + '&ExamTypeId=' + examTypeId + '&AcademicYearId=' + AcademicYearId +'&OptionId='+questionId;
      
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
            // (res.responseData.responseData1.length && this.assessmentLevelId == '1') ? this.loadClassWisetable() : '';
            this.getSubjectData();
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
      let studentApi = 'GetDashboardDataStudentListForCommon'
      let basicStr = 'zp-satara/Dashboard/' + studentApi + '?GroupId=' + GroupId + '&TalukaId=' + (TalukaId || 0) + '&CenterId=' + (CenterId || 0) + '&SchoolId=' + (SchoolId || 0) + '&SubjectId=' + (SubjectId || 0) + '&OptionGrade=' + ((this.dashboardObj && flag == undefined) ? this.dashboardObj.OptionGrade : 0) + '&StandardId=' + (StandardId || 0) + '&AcademicYearId=' + AcademicYearId + '&ExamTypeId=' + examTypeId + '&lan='
      let classStr = 'zp-satara/Dashboard/GetDashboardDataClassWise_StudentList?TalukaId=' + (TalukaId || 0) + '&CenterId=' + (CenterId || 0) + '&SchoolId=' + (SchoolId || 0) + '&StandardId=' + StandardId + '&SubjectId=' + (SubjectId || 0) + '&QuestionId=' + questionId + '&OptionGrade=' + ((this.dashboardObj && flag == undefined) ? this.dashboardObj.OptionGrade : 0) + '&ExamTypeId=' + examTypeId + '&AcademicYearId=' + AcademicYearId + '&lan='

      this.apiService.setHttp('GET', (this.assessmentLevelId == '0') ? basicStr : classStr, false, false, false, 'baseUrl');
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
            this.getSubjectData();
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
    let standardId = this.filterForm.value?.standardId;     
    // let AcademicYearId = flag == 'filter' ? this.filterForm.value?.acYearId : this.dashboardObj?.EducationYearId;
    // let examTypeId = flag == 'filter' ? this.filterForm.value.examTypeId : this.dashboardObj?.ExamTypeId; 
    let AcademicYearId = this.filterForm.value?.acYearId 
    let examTypeId =  this.filterForm.value.examTypeId
    // let chartApiTopLowstu = 'GetDataForTopLowSchoolStudentChart';
    let chartAPI = 'GetDashboardDataClassWise_StudentChart';    
    // let str = 'zp-satara/Dashboard/'+(this.dashboardObj?.label == "table" ? chartApiTopLowstu : chartAPI)+'?StudentId='+this.selectedObj?.studentId+'&StandardId='+standardId+'&EducationYearId='+AcademicYearId+'&AssesmentSubjectId='+0+'&ExamTypeId='+examTypeId+'&IsInspection='+this.inspectionBy.value+'&lan='
    let str = 'zp-satara/Dashboard/'+chartAPI+'?StudentId='+this.selectedObj?.studentId+'&StandardId='+standardId+'&EducationYearId='+AcademicYearId+'&AssesmentSubjectId='+0+'&ExamTypeId='+examTypeId+'&IsInspection='+this.inspectionBy.value+'&lan='
    this.apiService.setHttp('GET', str, false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any)=>{
        if (res.statusCode == 200){
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
          this.classwiseAsseTakenList = res.responseData?.responseData2
        }
      }
    });
  }

  getSubjectData() {
    // let subjectobj = this.subjectArr.filter((x: any)=> {
    //   return (x.id == this.filterForm.value.subjectId);
    // });
    // console.log("subject OBJjj",subjectobj,this.subjectArr );
    // this.subjectNameClassWise = this.languageFlag=='English' ? subjectobj[0].subjectName : subjectobj[0].m_SubjectName
  }


  getExamType(){
    this.masterService.getExamType().subscribe((res: any) => {
      this.ExamTypeArray=[{ "id": 0, "examType": "All", "m_ExamType": "सर्व" }].concat(res.responseData);
      this.ExamTypeArray.sort((a,b) => a.id - b.id );
      this.dashboardObj ? this.filterForm.controls['examTypeId'].setValue(this.dashboardObj?.ExamTypeId) : '';
    })
  }





  searchStudentDetails(flag?: any){
    this.dashboardObj.OptionGrade = 0;
    this.getTableData(flag);
  }

  getTaluka() {
    this.talukaArr = [];
    this.masterService.getAllTaluka(this.languageFlag).subscribe({
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
      error: ((err: any) => { this.errors.handelError(err.statusCode) })
    });
  }

  getAllCenter() {
    this.selectedTaluka = this.talukaArr.find((res: any) => this.filterForm.value.talukaId ? this.filterForm.value.talukaId == res.id : this.dashboardObj?.TalukaId == res.id);
    this.centerArr = [];
    let Tid = this.filterForm.value.talukaId;
    if (Tid != 0) {
      this.masterService.getAllCenter(this.languageFlag, Tid).subscribe({
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
        error: ((err: any) => { this.errors.handelError(err.statusCode) })
      });
    }
  }

  getAllSchoolsByCenterId() {    
    this.selectedCenter = this.centerArr.find((res: any) => this.filterForm.value.centerId ? this.filterForm.value.centerId == res.id : this.dashboardObj?.CenterId == res.id);
    this.schoolArr = [];
    let Tid = this.filterForm.value.talukaId;
    let Cid = this.filterForm.value.centerId;
    // if (Cid != 0) { removed - when navigate from  high low school table not patch schoolname in heading  
      this.masterService.getAllSchoolByCriteria(this.languageFlag, Tid, 0, Cid).subscribe({
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
    // }
  }

  getGroupIdByTalukaCenterSchool() {
    this.groupByClassArray = [];
    let formData = this.filterForm.value;
    this.apiService.setHttp('GET', 'zp-satara/Dashboard/GetDashboardCount_V2?TalukaId=' + (formData?.talukaId || 0) + '&CenterId=' + (formData?.centerId || 0) + '&SchoolId=' + (formData?.schoolId || 0), false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.groupByClassArray = res.responseData.responseData2;
          this.groupByClassArray.splice(0, 1);
          (this.dashboardObj && this.assessmentLevelId == '0' ) ? (this.filterForm.controls['groupByClass'].setValue(this.dashboardObj?.groupId), this.getStandard(), this.getSubject()) : this.filterForm.controls['groupByClass'].setValue(0), this.getStandard();
        } else {
          this.groupByClassArray = [];
        }
      },
      error: (err: any) => { this.errors.handelError(err.statusCode); }
    });

  }

  getStandard() {
    this.groupID = this.filterForm.value.groupByClass;
    let groupId = this.groupID ? this.groupID : this.dashboardObj.groupId;
    this.masterService.getAllStandard(0, groupId, this.languageFlag).subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.standardArr = [];
          this.standardArr.push({ "id": 0, "standard": "All", "m_Standard": "सर्व" }, ...res.responseData);
          this.filterForm.controls['standardId'].setValue(0);
          (this.dashboardObj && this.assessmentLevelId == '0') ? this.filterForm.controls['standardId'].setValue(this.dashboardObj?.standardArray[0]) : this.filterForm.controls['standardId'].setValue(this.dashboardObj?.StandardId)
        } else {
          this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
          this.standardArr = [];
        }
      },
      error: ((err: any) => { this.errors.handelError(err.statusCode) })
    });
  }


  getSubject() {
    this.subjectArr = [];
    if(this.assessmentLevelId == '0'){
      let groupId = this.groupID ? this.groupID : this.dashboardObj.groupId;
      this.masterService.GetAllSubjectsByGroupClassId(this.languageFlag, groupId).subscribe({
        next: (res: any) => {
          if (res.statusCode == 200) {
            this.subjectArr.push({ "id": 0, "subjectName": "All", "m_SubjectName": "सर्व" }, ...res.responseData);
            this.filterForm.controls['subjectId'].setValue(0);
            this.dashboardObj ? this.filterForm.controls['subjectId'].setValue(this.dashboardObj?.SubjectId) : '';
          } else {
            this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
            this.subjectArr = [];
          }
        },
        error: ((err: any) => { this.errors.handelError(err.statusCode) })
      });
    }
    else{
      this.masterService.getClassWiseSubject(this.languageFlag).subscribe({
        next: (res: any) => {
          if (res.statusCode == 200) {
            this.subjectArr.push({ "id": 0, "subjectName": "All", "m_SubjectName": "सर्व" }, ...res.responseData.responseData2);
            // this.filterForm.controls['subjectId'].setValue(0);
            this.dashboardObj ? this.filterForm.controls['subjectId'].setValue(this.dashboardObj?.SubjectId) : '';
          } else {
            this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
            this.subjectArr = [];
          }
        },
        error: ((err: any) => { this.errors.handelError(err.statusCode) })
      });
    }
    
  }

  //patch this subject while class wise data
  // getSubjectsByClass(){
  //   this.subjectArr = [];
  //   this.masterService.GetDashboardCountClassWise(this.languageFlag).subscribe({
  //     next: (res: any) => {
  //       if (res.statusCode == 200) {
  //         this.subjectArr.push({ "id": 0, "subjectName": "All", "m_SubjectName": "सर्व" }, ...res.responseData);
  //         this.filterForm.controls['subjectId'].setValue(0);
  //         this.dashboardObj ? this.filterForm.controls['subjectId'].setValue(this.dashboardObj?.SubjectId) : '';
  //       } else {
  //         this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
  //         this.subjectArr = [];
  //       }
  //     },
  //     error: ((err: any) => { this.errors.handelError(err.statusCode) })
  //   });
  // }

  clearDropdown(name?: any) {
    this.dashboardObj?.label == "table" ? '' :this.dashboardObj = '';
    if (name == 'talukaId') {
      this.filterForm.controls['centerId'].setValue('');
      this.filterForm.controls['schoolId'].setValue('');
      this.selectedShcool='';
    } else if (name == 'centerId') {
      this.filterForm.controls['schoolId'].setValue('');
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
    this.standardArr = [];
    this.subjectArr = [];
    this.selectedCenter = '';
    this.selectedTaluka = '';
    this.selectedShcool = '';
    this.getTaluka();
    // this.dashboardObj.label == "table" ? this.filterForm.controls['groupByClass'].patchValue(1) :this.filterForm.controls['groupByClass'].patchValue(0)
    this.filterForm.controls['groupByClass'].patchValue(1)
    this.filterForm.controls['examTypeId'].patchValue(0)
    this.filterForm.controls['StandardId'].patchValue(0)

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
