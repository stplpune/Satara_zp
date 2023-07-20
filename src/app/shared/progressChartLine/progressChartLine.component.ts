import { OnInit, Component, Output, EventEmitter,} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from 'src/app/core/services/api.service';
import { WebStorageService } from 'src/app/core/services/web-storage.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ErrorsService } from 'src/app/core/services/errors.service';
import {MatRadioModule} from '@angular/material/radio';
import { TranslateModule} from '@ngx-translate/core';
@Component({
  selector: 'progressChartLine',
  templateUrl: './progressChartLine.component.html',
  styleUrls: ['./progressChartLine.component.scss'],
  standalone: true,
  imports: [CommonModule, 
    NgApexchartsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCardModule,
    ReactiveFormsModule,
    FormsModule,
    MatRadioModule,
    TranslateModule,
    ],

})
export class progressChartLineComponent implements OnInit {
  @Output() recObjToChild = new EventEmitter<any>();
  lineChartOptions:any;
  barChartOptions:any;
  subjectControl=new FormControl(' ');
  inspectionBy=new FormControl(' ');
  subjectArray=new Array();
  grapbhDetailsArray=new Array();
  dashboardObj:any;
  selectedStudentObj:any;
  languageFlag!:string;
  groupId!:number;
  displayedheaders:any=[{'label':"Sr. No.","m_label":"अ.क्र."}, {'label':"Name","m_label":"नाव"},{'label':"Designation","m_label":"पद"},{'label':"Exam Type","m_label":"परीक्षेचा प्रकार"},{'label':"Assessment Date","m_label":"मूल्यांकन तारीख"} ]
  tableArray=new Array(); 
  tableArrayBySubject=new Array();
  lineChartshow:boolean=false;
  barChartshow:boolean=false;
  EducationYearId!:number;
  prevLang!:string;
  assessmentDetailsArray=new Array();
  selectedIndex:any;
  expectedLevelBase: any;
  labelAfterthirdStd: any; // label if  after 3 stad
  higherGradeBar!: number;
  constructor(private apiService:ApiService, public webStorage:WebStorageService,
    private ngxSpinner:NgxSpinnerService, private errors:ErrorsService) { }

  ngOnInit() {
     this.dashboardObj=JSON.parse(localStorage.getItem('selectedBarchartObjData')||'');     
    this.webStorage.selectedLineChartObj.subscribe((res:any)=>{
      this.selectedStudentObj=res;
      this.languageFlag = this.selectedStudentObj.lang;
      this.labelAfterthirdStd = (this.dashboardObj.groupId == 2 || this.dashboardObj.groupId == 3) ? this.languageFlag == 'English' ?'As per the test Questionaries':'चाचणी प्रश्नावलीनुसार' : ''
      this.groupId=this.selectedStudentObj.groupId==0? this.dashboardObj.groupId:this.selectedStudentObj.groupId;
      this.EducationYearId=this.selectedStudentObj.educationYearId ? this.selectedStudentObj.educationYearId :this.dashboardObj.EducationYearId;
      this.inspectionBy.patchValue('0');
      this.groupId? this.getLineChartDetails():'';
    });
  }
  getLineChartDetails(){
      this.prevLang=this.languageFlag;
      // let str= 'GetDataForStudentChart';
      // this.apiService.setHttp('GET', 'zp-osmanabad/Dashboard/' + str+ '?GroupId='+ this.groupId+'&StudentId='+this.selectedStudentObj?.objData?.studentId+'&IsInspection='+(Number(this.inspectionBy.value)||0)+'&EducationYearId='+this.EducationYearId, false, false, false, 'baseUrl');
      let str = 'GetDataForStudentChart?GroupId='+ this.groupId+'&StudentId='+this.selectedStudentObj?.objData?.studentId+'&IsInspection='+(Number(this.inspectionBy.value)||0)+'&EducationYearId='+this.EducationYearId;
      let highLow = 'GetDataForTopLowSchoolStudentChart?GroupId='+this.groupId+'&StudentId='+this.selectedStudentObj?.objData?.studentId+'&EducationYearId='+this.EducationYearId+'&AssesmentSubjectId='+0+'&ExamTypeId='+this.dashboardObj?.ExamTypeId+'&IsInspection='+(Number(this.inspectionBy.value)||0)+'&lan='
      let apiStr = (this.dashboardObj?.label == "table") ? highLow : str;
      this.apiService.setHttp('GET', 'zp-osmanabad/Dashboard/'+apiStr,  false, false, false, 'baseUrl');
      // this.selectedStudentObj?.objData?.assesmentSubjectId
      this.apiService.getHttp().subscribe({
        next: (res: any) => {          
          if (res.statusCode == "200" && res.responseData.responseData1.length) {
           this.grapbhDetailsArray=res.responseData.responseData1 ;                      
           this.grapbhDetailsArray=this.grapbhDetailsArray.sort((a,b) => (a.examTypeId - b.examTypeId));
           res.responseData.responseData2.map((x:any)=> x.isExpand=false);
           this.tableArray=res.responseData.responseData2 ;
           this.webStorage.studentDetailsforChart=this.grapbhDetailsArray;
          //  localStorage.setItem('studentDetailsforChart', JSON.stringify(this.grapbhDetailsArray))          
          this.webStorage.baseInfectctId = this.inspectionBy.value;          
           this.getSubjectData();
          } else {
            this.grapbhDetailsArray=[];
            this.subjectArray=[];
            this.tableArray=[];
          }
        },
        error: ((err: any) => { this.ngxSpinner.hide(); this.errors.handelError(err.statusCode) })
      });
   // }
  }
  getSubjectData() {
    this.subjectArray = [];
    this.subjectArray = [...new Set(this.grapbhDetailsArray.map((sub: any) => this.languageFlag=='English'? sub.subjectName:sub.m_SubjectName))];    
    this.subjectControl.patchValue((this.selectedStudentObj?.selectedSubject !=(this.languageFlag=='English'?'All':"सर्व"  ))?this.selectedStudentObj?.selectedSubject:this.subjectArray[0]);
    this.constuctLineChart();
  }
  constuctLineChart(){
    this.tableArrayBySubject=this.tableArray.filter((x:any)=>(this.languageFlag=='English'? x.subjectName: x.m_SubjectName)== this.subjectControl.value);
    this.tableArrayBySubject.map((x:any)=> x.isExpand=false);
      const ExamType = [...new Set(this.grapbhDetailsArray.map((sub: any) => this.languageFlag=='English'? sub.examType:sub.m_ExamType))];
      const arrayBySubject=this.grapbhDetailsArray.filter((x:any)=> (this.languageFlag=='English'? x.subjectName: x.m_SubjectName)==this.subjectControl?.value);
      const lineChartArrayData=(arrayBySubject.filter((a:any)=>a.isOption==true)).sort((a:any,b:any)=>a.questionId - b.questionId);
      const barChartArrayData=arrayBySubject.filter((a:any)=>a.isOption==false).sort((a:any,b:any)=>a.questionId - b.questionId) ;      
      this.webStorage.baseWiseDataStudentAssList = this.tableArrayBySubject;
    if (lineChartArrayData.length && !barChartArrayData.length) {
      const objData1=this.dataSetForLineChart(lineChartArrayData,ExamType);
      this.lineChartshow=true;
      this.barChartshow=false;
      objData1?.ArryOfSeries.length ? this.getLineChart(objData1) : '';
    } else if(!lineChartArrayData.length && barChartArrayData.length) {
      const objData2=this.dataSetForBarChart(barChartArrayData,ExamType);
      this.lineChartshow=false;
      this.barChartshow=true;
      objData2?.ArryOfSeries.length ? this.getBarChart(objData2) : '';
    }
    else if(lineChartArrayData.length && barChartArrayData.length){
      this.lineChartshow=true;
      this.barChartshow=true;
      const objData1=this.dataSetForLineChart(lineChartArrayData,ExamType);
      objData1?.ArryOfSeries.length ? this.getLineChart(objData1) : '';
      const objData2=this.dataSetForBarChart(barChartArrayData,ExamType); 
      objData2?.ArryOfSeries.length ? this.getBarChart(objData2) : '';

    
    }
  }
  dataSetForLineChart(lineChartArrayData:any, ExamType:any){
      const SubSubjectArrayLine = ['', ...new Set(lineChartArrayData.map((sub: any) => (this.languageFlag == 'English' ? sub.optionName : sub.m_OptionName)))];
      let ArryOfSeries: any = [];
      let DataArray: any = [];
      ExamType.map((x: any) => {
          const actualGrade= (lineChartArrayData.filter((y: any) => ((this.languageFlag == 'English' ? y.examType : y.m_ExamType) == x) &&  y.actualGrade > 0)).map((z: any) => z.actualGrade)
          DataArray.push((actualGrade.length!=0?Number(actualGrade.toString()):0))
      })
      const obj = {
        name: this.subjectControl.value,
        data: [0].concat(DataArray)
      }
      ArryOfSeries.push(obj)
    const objdata={
      ArryOfSeries:ArryOfSeries,
      SubSubjectArrayLine:SubSubjectArrayLine, 
      ExamType:ExamType
    }
    return objdata
  }
  dataSetForBarChart(barChartArrayData:any, ExamType:any){    
    this.higherGradeBar = barChartArrayData[0]?.maxGrade;
      const SubSubjectArrayBar = [ ...new Set(barChartArrayData.map((sub: any) => (this.languageFlag == 'English' ? sub.optionName : sub.m_OptionName)))];
      let ArryOfSeries: any = [];
      ExamType.map((x: any) => {
        const barObj = {
          name: x,
          data:(barChartArrayData.filter((y: any) => (this.languageFlag == 'English' ? y.examType : y.m_ExamType) == x)).map((z: any) =>
          {
            const obj={
              x:'',
              y:[-1,z.actualGrade]
            }
            return obj
          }
          )
        }
        ArryOfSeries.push(barObj);        
       })
    const obj={
      ArryOfSeries:ArryOfSeries,
      SubSubjectArrayBar:SubSubjectArrayBar, 
      higherGradeBar:this.higherGradeBar,
    }    
    return obj
  }
  getLineChart(objData: any) {        
    this.lineChartOptions = {
      series: objData?.ArryOfSeries,
      chart: {
        height: 350,
        type: 'area',
        toolbar: {
          show: false
        },
        zoom: {
          enabled: false,
        }
      },
      legend: {
        position: 'bottom',
        fontSize: '12px',
        show: true,
      },
      dataLabels: {
        enabled: false,
        colors:['#E98754', '#EFB45B', '#65C889']
      },
      colors:['#E98754', '#EFB45B', '#65C889'],
      stroke: {
        curve: 'smooth'
      },
      xaxis: {
        categories: [''].concat(objData?.ExamType),
        parameters: this.languageFlag == 'English' ?['Subject','Level']:['विषय','स्तर'],
        // offsetX: -15,
        labels: {
          rotate: -45,
          hideOverlappingLabels: false,
          formatter: function (value: any) {
            return value;
          }
        },
        tooltip: {
          enabled: false
        },
        style: {
          fontSize: '12px',
          fontFamily: 'Noto Sans Devanagari, sans-serif',
          cssClass: 'apexcharts-xaxis-label',
        },
      },
      yaxis: {
        opposite: false,
        max: (objData?.SubSubjectArrayLine.length - 1),
        tickAmount: (objData?.SubSubjectArrayLine.length - 1),
        parameters:objData?.SubSubjectArrayLine,
        labels: {
          minWidth: 100,
          formatter: (_value: any, i: any) => {
            let val = objData?.SubSubjectArrayLine[i];
            return val
          },
        },
      },
      tooltip:{
        show:false,
        style: {
          fontSize: '12px',
          fontFamily: 'Noto Sans Devanagari, sans-serif',
          color:'#000'
        },
        // custom: function({ series, seriesIndex, dataPointIndex, w }: any) { 
          custom: function({seriesIndex, dataPointIndex, w }: any) { 
          var data = w.globals.initialSeries[seriesIndex].data[dataPointIndex];
          return (
            '<div class="arrow_box" style="padding:10px;">' +
              "<div>" + w.config.xaxis.parameters[0] + " :  <b> " + w.globals.seriesNames[seriesIndex] + '</b>'+ "</div>" +
              "<div>" + w.config.xaxis.parameters[1]+ " : <b> " + ((w.config.yaxis[seriesIndex]['parameters'][data])||'-')+ '</b>' + "</div>" +
            "</div>"
          );
        },
      }
      
    };
    this.expectedLevelBase = (objData?.SubSubjectArrayLine.length) ? objData?.SubSubjectArrayLine[objData?.SubSubjectArrayLine.length - 1] : '';
  }

  getBarChart(objData:any){
    this.barChartOptions = {
      series: objData?.ArryOfSeries,
      chart: {
        type: "rangeBar",
        height: 350,
        toolbar: {
          show: false
        }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "55%",
          endingShape: "rounded"
        }
      },
      dataLabels: {
        enabled: false,
        colors:['#dc9da6','#E98754', '#EFB45B', '#65C889']
      },
      legend: {
        position: 'bottom',
        fontSize: '12px',
        show: true,
      },
      stroke: {
        show: true, 
        width: 2,
        colors: ["transparent"]
      },
      xaxis: {
        categories: objData?.SubSubjectArrayBar,
        axisTicks: {
          show: false
        },
        style: {
          fontSize: '12px',
          fontFamily: 'Noto Sans Devanagari, sans-serif',
          cssClass: 'apexcharts-xaxis-label',
        },
      },
        grid: {
          show:true,
          xaxis: {
              lines: {
                  show: false
              }
          },   
          yaxis: {
            lines: {
                show: false
            }
        }
      },
      yaxis: {
        min: -1,
        max: objData?.higherGradeBar,
        labels: {
          formatter: function (val: any) {
            return val < 0 ? '' : val.toFixed(0); // y axis  values 0 1 2
          }
        },
        axisTicks: {
          show: true,
        },
        // title: {
        //   text: '0 - प्रयत्न केला नाही | 1 - मदतीची गरज आहे | 2 - बरोबर उत्तर',
        //   rotate: -90,
        //   offsetX: 0,
        //   offsetY: 0,
        //   style: {
        //       color: '',
        //       fontSize: 'initial',
        //       fontFamily: 'Noto Sans Devanagari, sans-serif',
        //       fontWeight: 300,
        //       // cssClass: 'apexcharts-yaxis-title',
        //   },
        // }

      },
      fill: {
        opacity: 1,
        colors:['#dc9da6','#E98754', '#EFB45B', '#65C889']
      },
      colors:['#dc9da6','#E98754', '#EFB45B', '#65C889'],
      tooltip: {
        style: {
          fontSize: '12px',
          fontFamily: 'Noto Sans Devanagari, sans-serif',
          color:'#000'
        },
        custom: function({ series, seriesIndex, dataPointIndex, w }: any) { 
          return (
            '<div class="arrow_box" style="padding:10px;">' +
              "<div>" + w.globals.seriesNames[seriesIndex] + " : " + "</div>" +
              "<div>" + w.globals.labels[dataPointIndex]+ " : <b> " + series[seriesIndex][dataPointIndex] + '</b>' + "</div>" +
              // "<div>" + w.config.xaxis.parameters[2] + " : <b> " + series[seriesIndex][dataPointIndex] + '%</b>' + "</div>" +
            "</div>"
          );
        },
      }

    };
   
  }
  getAssessmentDetails(obj:any, index:number){
    this.tableArrayBySubject.map((x:any)=> x.isExpand=false)
    if (this.selectedIndex != index) {
      this.selectedIndex = index;
      this.tableArrayBySubject[index].isExpand=true;
      let str = 'zp-osmanabad/Dashboard/GetAssessmentDataByAssessmentId?AssessmentId=' + obj.assessmentId + '&Teacher_OfficerId=' + obj.teacherId + '&IsTeacher=' + (Number(this.inspectionBy.value) || 0) + '&StudentId=' + obj.studentId;
      this.apiService.setHttp('GET', str, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => {
          if (res.statusCode == 200 && res.responseData.responseData1.length) {
            this.assessmentDetailsArray = res.responseData.responseData1.filter((x:any)=> (this.languageFlag=='English'? x.subjectName: x.m_SubjectName)== this.subjectControl.value);
            this.assessmentDetailsArray.sort((a,b) => a?.questionId - b?.questionId );   
          } else {
            this.assessmentDetailsArray = [];
          }
        },
        error: ((err: any) => { this.ngxSpinner.hide(); this.errors.handelError(err.statusCode) })
      });
    }else{
      this.selectedIndex=undefined;
    }
  }

}
