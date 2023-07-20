import { Component, ElementRef, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { WebStorageService } from 'src/app/core/services/web-storage.service';
@Component({
  selector: 'printStudentDetails',
  templateUrl: './printStudentDetails.component.html',
  styleUrls: ['./printStudentDetails.component.scss']
})
export class PrintStudentDetailsComponent {
  studentDetailsArray=new Array();
  barChartOptions:any;
  lineChartOptions:any;
  subjectArray=new Array();
  languageFlag!:string;
  linechartArray=new Array();
  barchartArray=new Array();
  chartArray = new Array();
  barArray = new Array();
  studentDetailsData:any;
  classAsseResp: any;
  langSubList = new Array(); // show classwise laguage table 
  mathSubList = new Array(); // show classwise math table
  classwiseAsseTakenList = new Array(); // show classwise assessment taken table
  displayedheadersClass = new Array();
  dashboardObj: any;
  tableDataAssimentClassWise:any;
  tableDataAssimentBaseWise:any;
  assimentTable:any;
  totalMarksInSub : any;
  displayedheadersClassAsseTakenBy:any=[{'label':"Sr. No.","m_label":"अनुक्रमांक"}, {'label':"Name","m_label":"नाव"},{'label':"Designation","m_label":"पद"},{'label':"Assessment Date","m_label":"मूल्यांकन तारीख"} ]

  @ViewChild('myDiv') myDiv!: ElementRef;
  constructor( public webStorage:WebStorageService,public translate: TranslateService,) { }

  ngOnInit() {    
    this.dashboardObj = JSON.parse(localStorage.getItem('selectedBarchartObjData') || '');
    this.languageFlag=this.webStorage.getLangauge();
    this.studentDetailsData=this.webStorage.studentDetails;    
    this.studentDetailsArray=this.webStorage.studentDetailsforChart;
    this.getSubjectData();
    this.classAsseResp = this.webStorage.classWiseDataStudentAssList;

    this.displayedheadersClass=[{'label':"Sr. No.","m_label":"अ.क्र."}, {'label':"Subject","m_label":"विषय"},{'label':"Grade","m_label":"स्तर"},{'label':"Marks","m_label":"गुण"},{'label':"ExamType","m_label":"परीक्षेचा प्रकार"},{'label':"Expected level","m_label":"अपेक्षित स्तर"}, {'label':"Obtained Grade","m_label":"प्राप्त स्तर"}]
    // this.displayedheadersClass=[{'label':"Sr. No.","m_label":"अनुक्रमांक"}, {'label':"Subject","m_label":"विषय"},{'label':"Marks","m_label":"गुण"},{'label':"Grade","m_label":"स्तर"}, {'label':"ExamType","m_label":"परीक्षेचा प्रकार"}, {'label':"Expected level","m_label":"अपेक्षित स्तर"} ]
    this.dashboardObj?.asessmwntLavel == '1'  ? this.getClasswiseTable(): '';
    this.tableDataAssimentClassWise = this.classAsseResp?.responseData?.responseData2   
    this.tableDataAssimentBaseWise = this.webStorage.baseWiseDataStudentAssList;  
    this.webStorage.inspectionByValue;
    this.webStorage.baseInfectctId;
  }
  getSubjectData() {
    this.subjectArray = [];
    const subArray = [...new Set(this.studentDetailsArray.map((sub: any) => { const obj={sub : (this.languageFlag=='English'? sub.subjectName:sub.m_SubjectName),isOption:sub.isOption}; return obj}))];
    function unique(arr:any, keyProps:any) {
      const kvArray = arr.map((entry:any) => {
       const key = keyProps.map((k:any) => entry[k]).join('|');
       return [key, entry];
      });
      const map = new Map(kvArray);
      return Array.from(map.values());
     }
     this.subjectArray=unique(subArray, ['sub', 'isOption']);
    for(let i=0;i< this.subjectArray.length; i++){
      this.constuctLineChart(this.subjectArray[i].sub);
    }
  }
  constuctLineChart(sub:any){
      const ExamType = [...new Set(this.studentDetailsArray.map((sub: any) => this.languageFlag=='English'? sub.examType:sub.m_ExamType))];
      const arrayBySubject=this.studentDetailsArray.filter((x:any)=> (this.languageFlag=='English'? x.subjectName: x.m_SubjectName)==sub);
      const lineChartArrayData=(arrayBySubject.filter((a:any)=>a.isOption==true)).sort((a:any,b:any)=>a.questionId - b.questionId);
      const barChartArrayData=arrayBySubject.filter((a:any)=>a.isOption==false).sort((a:any,b:any)=>a.questionId - b.questionId) ;

      this.linechartArray.push(this.dataSetForLineChart(lineChartArrayData,ExamType));
      const data=this.linechartArray.filter((x:any)=> x.SubSubjectArrayLine.length>1 );
      const lineArray = [...new Map(data.map(item => [item['subjectId'], item])).values()];
      lineArray.length > 0 ? this.getLineChart(lineArray) : '';
      this.barchartArray.push(this.dataSetForBarChart(barChartArrayData,ExamType));
      const data1=this.barchartArray.filter((x:any)=> x.SubSubjectArrayBar.length >0 );
      const barArray = [...new Map(data1.map(item => [item['subId'], item])).values()];
      barArray.length > 0 ? this.getBarChart(barArray) : '';
  }
  dataSetForLineChart(lineChartArrayData:any, ExamType:any){
      const SubSubjectArrayLine = ['', ...new Set(lineChartArrayData.map((sub: any) => (this.languageFlag == 'English' ? sub.optionName : sub.m_OptionName)))];
      let ArryOfSeries: any = [];
      let DataArray: any = [];
      let sub =lineChartArrayData[0]?.subjectId
      ExamType.map((x: any) => {
          const actualGrade= (lineChartArrayData.filter((y: any) => ((this.languageFlag == 'English' ? y.examType : y.m_ExamType) == x) &&  y.actualGrade > 0)).map((z: any) => z.actualGrade)
          DataArray.push((actualGrade.length!=0?Number(actualGrade.toString()):0))
      })
      const obj = {
        data: [0].concat(DataArray)
      }
      ArryOfSeries.push(obj)
    const objdata={
      subjectId:sub,
      subject:(this.languageFlag == 'English' ? lineChartArrayData[0]?.subjectName : lineChartArrayData[0]?.m_SubjectName),
      ArryOfSeries:ArryOfSeries,
      SubSubjectArrayLine:SubSubjectArrayLine, 
      ExamType:ExamType
    }
    return objdata
  }
  dataSetForBarChart(barChartArrayData:any, ExamType:any){
    const higherGradeBar = barChartArrayData[0]?.maxGrade;
      const SubSubjectArrayBar = [ ...new Set(barChartArrayData.map((sub: any) => (this.languageFlag == 'English' ? sub.optionName : sub.m_OptionName)))];
      let ArryOfSeries: any = [];
      ExamType.map((x: any) => {
        const barObj = {
          subjectid:barChartArrayData[0]?.subjectId,
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
      subId:ArryOfSeries[0]?.subjectid,
      subject:(this.languageFlag == 'English' ? barChartArrayData[0]?.subjectName : barChartArrayData[0]?.m_SubjectName),
      ArryOfSeries:ArryOfSeries,
      SubSubjectArrayBar:SubSubjectArrayBar, 
      higherGradeBar:higherGradeBar,
    }
    return obj
  }
  getLineChart(objData: any) {    
    this.chartArray = [];
    for(var i = 0; i < objData.length; i++){
      this.lineChartOptions = {
          series: objData[i]?.ArryOfSeries,
          title: {
            text: this.webStorage.languageFlag == 'EN'? ('Expected level in subject ' +objData[i]?.subject + ' : '+objData[i]?.SubSubjectArrayLine[(objData[i]?.SubSubjectArrayLine.length-1)] ):( objData[i]?.subject +' विषयात अपेक्षित असलेला स्तर : '+ objData[i]?.SubSubjectArrayLine[(objData[i]?.SubSubjectArrayLine.length-1)]),
            align: 'left',
          },
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
            categories: [''].concat(objData[i]?.ExamType),
            parameters: this.languageFlag == 'English' ?['Subject','Level']:['विषय','स्तर'],
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
            max: (objData[i]?.SubSubjectArrayLine.length - 1),
            tickAmount: (objData[i]?.SubSubjectArrayLine.length - 1),
            parameters:objData[i]?.SubSubjectArrayLine,
            labels: {
              minWidth: 100,
              formatter: (_value: any, j: any, w:any) => {
                let val = w?.config?.yaxis[0]?.parameters[j];
                return val
              },
            },
          },
        };
        this.chartArray.push(this.lineChartOptions);
    };
  
  }
  getBarChart(objData:any){
    this.barArray = [];
    for(var i = 0; i < objData.length; i++){
      this.barChartOptions = {
        series: objData[i]?.ArryOfSeries,
        title: {
          text: this.webStorage.languageFlag == 'EN'? ('Expected level in subject ' +objData[i]?.subject + ' : '+ objData[i].higherGradeBar):( objData[i]?.subject +' विषयात अपेक्षित असलेला स्तर : '+ objData[i].higherGradeBar),
          align: 'left',
        },
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
          colors:['#E98754', '#EFB45B', '#65C889']
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
          categories: objData[i]?.SubSubjectArrayBar,
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
          max: 2,
          labels: {
            formatter: function (val: any) {
              return val < 0 ? '' : val.toFixed(0);
            }
          },
          axisTicks: {
            show: true,
          },
        },
        fill: {
          opacity: 1,
          colors:['#E98754', '#EFB45B', '#65C889']
        },
        colors:['#E98754', '#EFB45B', '#65C889']
      };
      this.barArray.push(this.barChartOptions)
    };
    
  }


  getClasswiseTable(){
    this.langSubList = this.classAsseResp.responseData?.responseData1.filter((x:any)=>{
      return x.subjectId == 1
     });
     // this.getClassTableDtaByUser();
     this.mathSubList = this.classAsseResp.responseData?.responseData1.filter((x:any)=>{
      return x.subjectId == 3
     });
    this.totalMarksInSub = this.classAsseResp.responseData?.responseData3[0];
     this.classwiseAsseTakenList = this.classAsseResp.responseData?.responseData2
  }
  onPrint(){
    let details=this.myDiv.nativeElement.innerHTML;
    var printHtml:any = window.open('', 'PRINT' );
    
    printHtml.document.write('<html><head>');
    printHtml.document.write(details);
    printHtml.document.write('</body></html>');

    printHtml.print();
    printHtml.close();
  }
}
