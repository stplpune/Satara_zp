import { Component } from '@angular/core';
import { Lightbox } from '@ngx-gallery/lightbox';
import { ApiService } from 'src/app/core/services/api.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { WebStorageService } from 'src/app/core/services/web-storage.service';
import { Gallery, ImageItem, GalleryModule } from '@ngx-gallery/core';

import { LightboxModule } from '@ngx-gallery/lightbox';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { TranslateModule } from '@ngx-translate/core';
import { TableComponent } from 'src/app/shared/components/table/table.component';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AesencryptDecryptService } from 'src/app/core/services/aesencrypt-decrypt.service';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-add-school-profile',
  templateUrl: './add-school-profile.component.html',
  styleUrls: ['./add-school-profile.component.scss'],
  standalone: true,
  imports: [
    TranslateModule,
    LightboxModule,
    GalleryModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatTableModule,
    TableComponent,
    CommonModule,
    MatDialogModule
  ]
})
export class AddSchoolProfileComponent {
  viewStatus = 'Table';
  items: any = [];
  tableresp = new Array();
  schoolresp: any;
  showImg!: boolean;
  languageFlag: any;
  docDataresp: any;
  id: any;
  encryptData: any;
  routingData: any;
  schoolevetArr: any;
  langTypeName: any;
  langChnge!: Subscription;
  constructor(public webStorage: WebStorageService,
    private apiService: ApiService,
    private errors: ErrorsService,
    private lightbox: Lightbox,
    public gallery: Gallery,
    private route: ActivatedRoute,
    private encryptdecrypt: AesencryptDecryptService
  ) { }

  ngOnInit() {
    this.langChnge = this.webStorage.langNameOnChange.subscribe(lang => {
      this.langTypeName = lang;
      this.setTableData();
    });
    this.getRouteParam();
  }

  lightBox() {
    this.items = this.schoolevetArr?.map((item: any) => {
      return new ImageItem({ src: item.docPath, thumb: item.docPath })
    });    
    this.basicLightboxExample();
  }

  basicLightboxExample() {
    this.gallery.ref().load(this.items);
  }

  getRouteParam() {
    this.route.queryParams.subscribe((queryParams: any) => {
      this.routingData = queryParams['id'];
    });
    this.encryptData = this.encryptdecrypt.decrypt(`${decodeURIComponent(this.routingData)}`);
    console.log("encryptData", this.encryptData);
    this.getTableData();

    
  }


  getTableData() {
    this.lightbox
    this.apiService.setHttp('GET', 'zp-satara/School/GetProfileById?Id='+ this.encryptData, false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.schoolresp = res.responseData;
          this.tableresp = res.responseData.teacher;
          this.docDataresp = res.responseData.schoolEvent;
          let evetArr = this.docDataresp.map((x: any) => {
            return x.eventImages
          })
          evetArr.map((x: any) => {
            this.schoolevetArr = x.map((y: any) => {
              return y;
            })
          })
          this.lightBox();

        } else {
          this.tableresp = [];
        }
        this.setTableData();
      },
      error: ((err: any) => { this.errors.handelError(err) })
    });
  }

  childCompInfo(obj: any) {
    switch (obj.label) {
      case 'Pagination':
        this.getTableData();
        break;
    }
  }

  setTableData() {
    // this.highLightFlag=true;
    let displayedColumnsReadMode =  (this.langTypeName == 'English') ? ['Sr. No.', 'Teacher Name', 'Email ID', 'Mobile No.', 'Desgination'] : ['अनुक्रमांक', 'शिक्षकाचे नाव', 'ई-मेल आयडी', 'मोबाइल क्रमांक', 'पदनाम'];
    let displayedColumns = ['srNo', 'name', 'emailId', 'mobileNo', 'designationType'];
    let tableData = {
      // pageNumber: this.pageNumber,
      img: '',
      blink: '',
      badge: '',
      isBlock: 'status',
      // pagintion:this.totalItem > 10 ? true : false,
      displayedColumns: displayedColumns,
      tableData: this.tableresp,
      // tableSize: this.totalItem,
      tableHeaders: displayedColumnsReadMode,
    };
    // this.highLightFlag ? this.tableData.highlightedrow = true : this.tableData.highlightedrow = false,
    this.apiService.tableData.next(tableData);
  }

  onViewDoc(index: number){
    window.open(this.schoolresp?.schoolDocument[index].docPath, 'blank');
  }

  // dataArr = [
  //   {
  //     srcUrl: 'https://apisatara.shikshandarpan.com//SchoolDoc/docs/file_202307271728180271.jpeg',
  //     previewUrl: 'https://preview.ibb.co/jrsA6R/img12.jpg',
  //   },
  //   {
  //     srcUrl: 'https://apisatara.shikshandarpan.com//SchoolDoc/docs/file_202307271728180402.jpeg',
  //     previewUrl: 'https://preview.ibb.co/kPE1D6/clouds.jpg',
  //   },
  //   {
  //     srcUrl: 'https://apisatara.shikshandarpan.com//SchoolDoc/docs/file_202307271728180513.jpg',
  //     previewUrl: 'https://preview.ibb.co/mwsA6R/img7.jpg',
  //   },
  //   {
  //     srcUrl: 'https://apisatara.shikshandarpan.com//SchoolDoc/docs/file_202307271728180524.jpg',
  //     previewUrl: 'https://preview.ibb.co/kZGsLm/img8.jpg',
  //   },

  //   {
  //     srcUrl: 'https://apisatara.shikshandarpan.com//SchoolDoc/docs/file_202307271728180535.jpeg',
  //     previewUrl: 'https://preview.ibb.co/mwsA6R/img7.jpg',
  //   },
  //   {
  //     srcUrl: 'https://apisatara.shikshandarpan.com//SchoolDoc/docs/file_202307271728180546.jpg',
  //     previewUrl: 'https://preview.ibb.co/kZGsLm/img8.jpg',
  //   },
  // ];

}



