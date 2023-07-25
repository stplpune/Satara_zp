import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { WebStorageService } from 'src/app/core/services/web-storage.service';
import { LightboxModule } from '@ngx-gallery/lightbox';
import { Gallery, ImageItem, GalleryModule, } from '@ngx-gallery/core';
import { progressChartLineComponent } from '../../progressChartLine/progressChartLine.component';
import { MatTableModule } from '@angular/material/table';
@Component({
  selector: 'app-global-detail',
  templateUrl: './global-detail.component.html',
  styleUrls: ['./global-detail.component.scss'],
  standalone: true,
  imports: [
    TranslateModule,
    MatCardModule,
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    LightboxModule,
    GalleryModule,
    progressChartLineComponent,
    MatTableModule

  ]
})
export class GlobalDetailComponent {
  displayedColumns: string[] = ['position', 'name', 'TeacherName', 'EmailID','MobileNo','Desgination'];
  dataSource = ELEMENT_DATA;
  items: any = [];
  dataArray = new Array();
  objData: any;
  showImg!: boolean;
  languageFlag: any;
  constructor(private webService: WebStorageService,
    public gallery: Gallery, public dialogRef: MatDialogRef<GlobalDetailComponent>, @Inject(MAT_DIALOG_DATA) public data: any, public webStorage: WebStorageService) {

  }

  ngOnInit() {
    this.webService.langNameOnChange.subscribe(lang => {
      this.languageFlag = lang;
    });
    if (this.data.headerImage != '') {
      this.showImg = true;
    }
    this.dataArray = this.data.Obj.schoolDocument;

    this.items = this.dataArray?.map(item =>
      new ImageItem({ src: item.docPath, thumb: item.docPath })
    );

    this.basicLightboxExample();
    this.getLineChartDetails(this.data);    
  }

  basicLightboxExample() {
    this.gallery.ref().load(this.items);
  }

  closeDialog() {
    this.dialogRef.close();
  }

  getLineChartDetails(obj: any) {
    obj.Obj.studentId = obj.Obj.id;
    this.objData = {
      objData: obj.Obj,
      groupId: obj.Obj.standardId <= 2 ? 1 : obj.Obj.standardId <= 5 ? 2 : 3,
      selectedSubject: this.languageFlag == 'English' ? 'Language' : 'भाषा',
      educationYearId: this.webService.getLoggedInLocalstorageData()?.educationYearId,
      lang: this.languageFlag,
    }
    this.objData.objData ? this.webService.selectedLineChartObj.next(this.objData) : '';
  }
}


export interface PeriodicElement {
  name: string;
  position: number;
  TeacherName:any;
  EmailID:any;
  MobileNo:any;
  Desgination:any;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: '', TeacherName:'yuvraj sir',EmailID:'abvbsd@gmail.com',MobileNo:'258222588',Desgination:'Principle',},
  {position: 2, name: '', TeacherName:'Patil sir',EmailID:'',MobileNo:'44455400075',Desgination:'Teacher',},
  {position: 3, name: '', TeacherName:'dr.pradip',EmailID:'',MobileNo:'2252005',Desgination:'Student',},
  {position: 4, name: '', TeacherName:'amol sir',EmailID:'',MobileNo:'225225252005',Desgination:'',},
  {position: 5, name: '', TeacherName:'sachin sir',EmailID:'',MobileNo:'25255533350',Desgination:'',},
];