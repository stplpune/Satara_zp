import { Component, ElementRef, ViewChild } from '@angular/core';
import { WebStorageService } from 'src/app/core/services/web-storage.service';

@Component({
  selector: 'app-print-pi-details',
  templateUrl: './print-pi-details.component.html',
  styleUrls: ['./print-pi-details.component.scss']
})
export class PrintPiDetailsComponent {
  dashboardObj: any;
  studentDetailsData: any;
  barChartDetails: any;
  languageFlag!:string;
  
  @ViewChild('myDiv') myDiv!: ElementRef;

  constructor(private webStorage: WebStorageService){}

  ngOnInit(){

    this.dashboardObj = JSON.parse(localStorage.getItem('selectedBarchartObjData') || '');
    console.log("dashboardObj pi details", this.dashboardObj);
    this.languageFlag=this.webStorage.getLangauge();

    this.studentDetailsData = this.webStorage.studentDetails;
    console.log("studentDetailsData", this.studentDetailsData);

    this.barChartDetails = this.webStorage.piDetails;
    console.log("barChartDetails", this.barChartDetails);

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
