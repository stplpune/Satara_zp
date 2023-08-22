import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { WebStorageService } from 'src/app/core/services/web-storage.service';

@Component({
  selector: 'app-share-event-for-android',
  templateUrl: './share-event-for-android.component.html',
  styleUrls: ['./share-event-for-android.component.scss']
})
export class ShareEventForAndroidComponent {
  imgArray = new Array();
  langTypeName: any;
  eventData: any;
  data: any = new Array();

  constructor(
    private ngxSpinner: NgxSpinnerService,
    private apiService: ApiService,
    private commonMethod: CommonMethodsService,
    private errors: ErrorsService,
    public webStorageS: WebStorageService,
    private router: Router,
  ) {
    let queryparams = this.router.url.split('/')[2];
    let params: any = queryparams.split('&');
    this.data = params 
  }

  ngOnInit() {
    this.data ? this.getEventById() : '';
  }

  getEventById() {
    this.ngxSpinner.show();
    this.apiService.setHttp('GET', 'zp-satara/SchoolEvent/GetEventById?EventId=' + this.data[0], false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        this.ngxSpinner.hide();
        if (res.statusCode == "200") {
          console.log("school", res);
          this.eventData = res.responseData?.responseData1;
          this.imgArray = []
          this.imgArray = this.eventData?.[0]?.eventImages.map((x: any) => {
            return x.docPath
          });
          this.ngxSpinner.hide();
        }
        else {
          this.commonMethod.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethod.showPopup(res.statusMessage, 1);
        }
      },
      error: ((err: any) => {
        this.ngxSpinner.hide();
        this.commonMethod.checkEmptyData(err.statusMessage) == false ? this.errors.handelError(err.statusCode) : this.commonMethod.showPopup(err.statusMessage, 1);
      })
    });
  }
}


