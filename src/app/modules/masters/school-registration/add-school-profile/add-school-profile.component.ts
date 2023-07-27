import { Component } from '@angular/core';
import { Lightbox } from '@ngx-gallery/lightbox';
import { ApiService } from 'src/app/core/services/api.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { WebStorageService } from 'src/app/core/services/web-storage.service';
import { Gallery, ImageItem,GalleryModule } from '@ngx-gallery/core';

import { LightboxModule } from '@ngx-gallery/lightbox';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { TranslateModule } from '@ngx-translate/core';
import { TableComponent } from 'src/app/shared/components/table/table.component';
import { CommonModule } from '@angular/common';
// import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
// import { GlobalDetailComponent } from 'src/app/shared/components/global-detail/global-detail.component';
// import {MatDialogModule} from '@angular/material/dialog';

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
    MatFormFieldModule,
    MatTableModule,
    TableComponent,
    CommonModule
    // MatDialogModule
  ]
})
export class AddSchoolProfileComponent {
  viewStatus = 'Table';
  // displayedColumns: string[] = ['position', 'name', 'TeacherName', 'EmailID', 'MobileNo', 'Desgination'];
  // dataSource = ELEMENT_DATA;
  items: any = [];
  tableresp = new Array();
  schoolresp: any;
  showImg!: boolean;
  languageFlag: any;
  docDataresp:any;

  constructor(public webStorage: WebStorageService,
    private apiService: ApiService,
    private errors: ErrorsService,
    private lightbox: Lightbox,
    public gallery: Gallery,
    // public dialogRef: MatDialogRef<GlobalDetailComponent>,
    // @Inject(MAT_DIALOG_DATA) public data: any
   ) {
 

    

  }

  ngOnInit() {
    this.getTableData();
    this.items = this.dataArr.map((item:any) =>{
     return  new ImageItem({ src: item.srcUrl, thumb: item.previewUrl })
  });
    
    
    this.basicLightboxExample();
  }

  basicLightboxExample() {
    this.gallery.ref().load(this.items);
  }



  getTableData() {
    this.lightbox
    // status == 'filter' ? (this.filterFlag = true, (this.pageNumber = 1)) : '';
    // let formData = this.textSearch.value || ''
    this.apiService.setHttp('GET', 'zp-satara/School/GetProfileById?Id=1', false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        console.log(res);
        if (res.statusCode == "200") {
          this.schoolresp=res.responseData;
          this.tableresp = res.responseData.teacher;
          this.docDataresp=res.responseData.schoolEvent;
        
          // this.totalItem = res.responseData.responseData2.pageCount;
        } else {
          this.tableresp = [];
          // this.totalItem=0
        }
        this.setTableData();
      },
      error: ((err: any) => { this.errors.handelError(err) })
    });
  }

  childCompInfo(obj: any) {
    switch (obj.label) {
      case 'Pagination':
        // this.filterFlag ? '' : (this.textSearch.setValue(''), this.filterFlag = false);
        // this.pageNumber = obj.pageNumber;
        this.getTableData();
        break;
      case 'Edit':
        // this.openDialog(obj);
        break;
      case 'Block':
        // this.openBlockDialog(obj);
        break;
      case 'Delete':
        // this.globalDialogOpen(obj);
        break;
    }
  }

  setTableData() {
    // this.highLightFlag=true;
    let displayedColumnsReadMode = ['srNo', 'Teacher Name', 'Email ID', 'Mobile No.', 'Desgination'];
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

  dataArr = [
    {
      srcUrl: 'https://preview.ibb.co/jrsA6R/img12.jpg',
      previewUrl: 'https://preview.ibb.co/jrsA6R/img12.jpg',
    },
    {
      srcUrl: 'https://preview.ibb.co/kPE1D6/clouds.jpg',
      previewUrl: 'https://preview.ibb.co/kPE1D6/clouds.jpg',
    },
    {
      srcUrl: 'https://preview.ibb.co/mwsA6R/img7.jpg',
      previewUrl: 'https://preview.ibb.co/mwsA6R/img7.jpg',
    },
    {
      srcUrl: 'https://preview.ibb.co/kZGsLm/img8.jpg',
      previewUrl: 'https://preview.ibb.co/kZGsLm/img8.jpg',
    },
  ];

}

// export interface PeriodicElement {
//   name: string;
//   position: number;
//   TeacherName:any;
//   EmailID:any;
//   MobileNo:any;
//   Desgination:any;
// }

// const ELEMENT_DATA: PeriodicElement[] = [
//   {position: 1, name: '', TeacherName:'yuvraj sir',EmailID:'abvbsd@gmail.com',MobileNo:'258222588',Desgination:'Principle',},
//   {position: 2, name: '', TeacherName:'Patil sir',EmailID:'',MobileNo:'44455400075',Desgination:'Teacher',},
//   {position: 3, name: '', TeacherName:'dr.pradip',EmailID:'',MobileNo:'2252005',Desgination:'Student',},
//   {position: 4, name: '', TeacherName:'amol sir',EmailID:'',MobileNo:'225225252005',Desgination:'',},
//   {position: 5, name: '', TeacherName:'sachin sir',EmailID:'',MobileNo:'25255533350',Desgination:'',},
// ];
