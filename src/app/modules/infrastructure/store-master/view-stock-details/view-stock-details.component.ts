import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { AesencryptDecryptService } from 'src/app/core/services/aesencrypt-decrypt.service';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { WebStorageService } from 'src/app/core/services/web-storage.service';

@Component({
  selector: 'app-view-stock-details',
  templateUrl: './view-stock-details.component.html',
  styleUrls: ['./view-stock-details.component.scss']
})
export class ViewStockDetailsComponent {
  storeObj:any;
  pageNumber: number = 1;
  cardHeaderData = new Array();
  cardInwardData = new Array();
  cardOutwardData = new Array();
  languageFlag!: string
  showPdf = new Array();
  showImage = new Array();
  outwardShowPdf = new Array();
  outwardShowImage = new Array();

  constructor(private activatedRoute :ActivatedRoute,
   private encDec: AesencryptDecryptService,
    private apiService: ApiService,
    public webService: WebStorageService,
    private commonMethodS: CommonMethodsService,
    private errors: ErrorsService,
    public datepipe: DatePipe,
    private ngxSpinner: NgxSpinnerService,
   ){
    let Obj: any;
    let decryptData:any
    this.activatedRoute.queryParams.subscribe((queryParams: any) => { Obj = queryParams['id'] });
    decryptData = this.encDec.decrypt(`${decodeURIComponent(Obj)}`);
    this.storeObj = decryptData.split('.');
    }

  ngOnInit(){
    this.webService.langNameOnChange.subscribe(lang => {
      this.languageFlag = lang;
    });
   this.getViewData();
  }


  getViewData() {
    this.ngxSpinner.show();
    let str =`SchoolId=${this.storeObj[0]}&CategoryId=${this.storeObj[1]}&SubCategoryId=${this.storeObj[2]}&ItemId=${this.storeObj[3]}`
    this.apiService.setHttp('GET', 'zp-satara/InwardOutwardReport/GetInwardOutwardReportDetail?' +  str, false, false, false, 'baseUrl');     
    this.apiService.getHttp().subscribe({
      next: (res: any) => {   
        if (res.statusCode == 200) {
          this.ngxSpinner.hide();
         this.cardHeaderData = res.responseData.responseData1; 
         this.cardInwardData = res.responseData.responseData2; 
         this.cardOutwardData = res.responseData.responseData3;
          // inward data
          let inwardPdfArr = new Array();
          let inwardImageArr = new Array();
          this.cardInwardData?.map((x: any) => {
            x.inwardOutwardDoc1?.map((y: any) => {
              let imaPath = y.photo;
              let extension = imaPath.split('.')
              if (extension[3] == 'pdf' || extension[3] == 'doc' || extension[3] == 'txt') {
                inwardPdfArr.push({ photo: y.photo, docFlag: true })
              }
              if (extension[3] == 'jpg' || extension[3] == 'jpeg' || extension[3] == 'png') {
                inwardImageArr.push({ photo: y.photo })
              }
            })
            this.showPdf.push({ pdfData: inwardPdfArr })
            this.showImage.push({ imgData: inwardImageArr })
            inwardPdfArr = [];
            inwardImageArr = [];
          });

          // outward data
          let outWardpdfArr = new Array();
          let outWardImageArr = new Array();

          this.cardOutwardData?.map((x: any) => {
            x.inwardOutwardDoc2?.map((y: any) => {
              let imaPath = y.photo;
              let extension = imaPath.split('.')
              if (extension[3] == 'pdf' || extension[3] == 'doc' || extension[3] == 'txt') {
                outWardpdfArr.push({ photo: y.photo, docFlag: true })
              }
              if (extension[3] == 'jpg' || extension[3] == 'jpeg' || extension[3] == 'png') {
                outWardImageArr.push({ photo: y.photo })
              }
            })
            this.outwardShowPdf.push({ pdfData: outWardpdfArr })
            this.outwardShowImage.push({ imgData: outWardImageArr })
            outWardpdfArr = [];
            outWardImageArr = [];
          });
        }else{
          this.ngxSpinner.hide();
          this.cardHeaderData =[];
          this.cardInwardData = [];
          this.cardOutwardData =[];
        }
      },
      error: ((err: any) => { (this.ngxSpinner.hide(),this.commonMethodS.checkEmptyData(err.statusText) == false) ? this.errors.handelError(err.statusCode) : this.commonMethodS.showPopup(err.statusText, 1); })
   
    });
  }

  viewImages(i:any,j:any,flag:string){
    if(flag == 'inward'){
      window.open(this.showImage[i].imgData[j].photo, 'blank');
    }else if(flag == 'outward'){
      window.open(this.outwardShowImage[i].imgData[j].photo, 'blank');
    }
    
  }
  viewDocument(i:any,j:any,flag:string){
    if(flag == 'inward'){
      window.open(this.showPdf[i].pdfData[j].photo, 'blank');
    }else if(flag == 'outward'){
      window.open(this.outwardShowPdf[i].pdfData[j].photo, 'blank');
    }   
  }

}
