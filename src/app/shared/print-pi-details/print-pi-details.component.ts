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
  questionArr: any;
  languageFlag!: string;
  @ViewChild('myDiv') myDiv!: ElementRef;

  constructor(private webStorage: WebStorageService) { }

  ngOnInit() {
    this.languageFlag = this.webStorage.getLangauge();
    this.dashboardObj = JSON.parse(localStorage.getItem('selectedBarchartObjData') || '');
    this.studentDetailsData = this.webStorage.studentDetails;
    this.barChartDetails = this.webStorage.piDetails;
    this.questionArr = this.webStorage.questionArray;
    this.barChartDetails.map((x: any) => {
      x.grid = { show: true }
    });
  }

  onPrint() {
    let details = this.myDiv.nativeElement.innerHTML;
    var printHtml: any = window.open('', 'PRINT');

    printHtml.document.write('<html><head>');
    printHtml.document.write(details);
    printHtml.document.write('</body></html>');

    printHtml.print();
    printHtml.close();
  }
}
