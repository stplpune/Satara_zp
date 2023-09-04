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
  items: any = [];
  dataArray = new Array();
  objData: any;
  showImg!: boolean;
  languageFlag: any;
  imageArr = new Array();
  pdfArr = new Array();
  constructor(private webService: WebStorageService,
    public gallery: Gallery, public dialogRef: MatDialogRef<GlobalDetailComponent>, @Inject(MAT_DIALOG_DATA) public data: any, public webStorage: WebStorageService) {

  }

  ngOnInit() {
    console.log("data", this.data);
    
    this.webService.langNameOnChange.subscribe(lang => {
      this.languageFlag = lang;
    });
    if (this.data.headerImage != '') {
      this.showImg = true;
    }
    this.dataArray = this.data.Obj.inwardOutwardDocs;

    this.dataArray?.map((x: any) => {
      let imgPath = x.photo;
      let extension = imgPath.split('.');
      if (extension[3] == 'pdf' || extension[3] == 'doc' || extension[3] == 'txt') {        
       this.pdfArr.push({photo : x.photo ,docFlag:true})       
      }
      if (extension[3] == 'jpg' || extension[3] == 'jpeg' || extension[3] == 'png') {        
        this.imageArr.push({photo : x.photo})        
       }
    });

    this.items = this.imageArr?.map(item =>
      new ImageItem({ src: item.photo, thumb: item.photo})
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

  onViewDoc(index: any) {
    window.open(this.pdfArr[index].photo, 'blank');
  }
}
