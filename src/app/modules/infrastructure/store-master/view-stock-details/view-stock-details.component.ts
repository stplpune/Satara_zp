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

  constructor(private activatedRoute :ActivatedRoute,
   private encDec: AesencryptDecryptService,
    private apiService: ApiService,
    public webService: WebStorageService,
    private commonMethodS: CommonMethodsService,
    private errors: ErrorsService,
    // private masterService: MasterService,
    // private commonMethods: CommonMethodsService,
    // private downloadFileService: DownloadPdfExcelService,
    public datepipe: DatePipe,
    private ngxSpinner: NgxSpinnerService,
   ){
    let Obj: any;
    let decryptData:any
    this.activatedRoute.queryParams.subscribe((queryParams: any) => { Obj = queryParams['id'] });
    decryptData = this.encDec.decrypt(`${decodeURIComponent(Obj)}`);
    this.storeObj = decryptData.split('.');
    // console.log("storeObj",this.storeObj); 
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
         console.log("cardHeaderData",this.cardHeaderData);
         console.log("cardInwardData",this.cardInwardData);
         console.log("cardOutwardData",this.cardOutwardData);
         
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


}
