import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { MasterService } from 'src/app/core/services/master.service';
import { WebStorageService } from 'src/app/core/services/web-storage.service';

@Component({
  selector: 'app-cctv',
  templateUrl: './cctv.component.html',
  styleUrls: ['./cctv.component.scss']
})
export class CctvComponent {
  viewStatus = 'Table';
  pageNumber: number = 1;
  displayedheadersEnglish = ['Sr. No.', 'cctvLocation', 'Action'];
  displayedheadersMarathi = ['अनुक्रमांक', 'cctv स्थान', 'कृती'];
  filterForm!: FormGroup;
  // displayedColumns: string[] = ['position', 'name', 'weight', 'symbol', 'Attendence', 'Remark', 'Action'];
  tableDataArray = new Array();
  tableDatasize!: Number;
  totalCount: number = 0;
  tableData: any;
  highLightFlag: boolean = true;
  displayedColumns = new Array();
  langTypeName: any;
  talukaArr = new Array();
  centerArr = new Array();
  villageArr = new Array();
  schoolArr = new Array();
  get f() {
    return this.filterForm.controls
  }
  constructor(private ngxSpinner : NgxSpinnerService,
    private apiService: ApiService,
    private commonMethodS: CommonMethodsService,
    private errors: ErrorsService,
    public webStorageS: WebStorageService,
    private fb : FormBuilder,
    private masterService: MasterService,
    ){
  }

  ngOnInit(){
    this.filterFormData();
    this.getTalukaDropByDis();
    this.getTableData();
  }

  filterFormData(){
    this.filterForm = this.fb.group({
      talukaId: [''],
      centerId: [''],
      villageId: [''],
      schoolId: [''],
      cCTVLocationId: [''],
      textSearch: [' ef'],
    })
  }

  getTalukaDropByDis(){
    this.talukaArr = [];
    this.masterService.getAllTaluka('').subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.talukaArr.push({ "id": 0, "taluka": "All", "m_Taluka": "सर्व" }, ...res.responseData);
          this.filterForm?.value.talukaId ? this.getCenterDropByTaluka() : '';
        } else {
          this.commonMethodS.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethodS.showPopup(res.statusMessage, 1);
          this.talukaArr = [];
        }
      }
    });
  }

  getCenterDropByTaluka(){
    this.centerArr = [];
    let id = this.f['talukaId'].value;
    if (id != 0) {
      this.masterService.getAllCenter('', id).subscribe({
        next: (res: any) => {
          if (res.statusCode == "200") {
            this.centerArr.push({ "id": 0, "center": "All", "m_Center": "सर्व" }, ...res.responseData);
            this.filterForm?.value.centerId ? this.getVillageDropByCenter() : '';
          } else {
            this.commonMethodS.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethodS.showPopup(res.statusMessage, 1);
            this.centerArr = [];
          }
        }
      });
    }

  }
  getVillageDropByCenter(){
    this.villageArr = [];
    let Cid = this.f['centerId'].value;
    if (Cid != 0) {
      this.masterService.getAllVillage('', Cid).subscribe({
        next: (res: any) => {
          if (res.statusCode == 200) {
            this.villageArr.push({ "id": 0, "village": "All", "m_Village": "सर्व" }, ...res.responseData);
            this.filterForm?.value.villageId ? this.getSchoolDropByFilter() : '';
          } else {
            this.commonMethodS.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethodS.showPopup(res.statusMessage, 1);
            this.villageArr = [];
          }
        }
      });
    }

  }

  getSchoolDropByFilter(){
    this.schoolArr = [];
    let Tid = this.f['talukaId'].value;
    let Cid = this.f['centerId'].value || 0;
    let Vid = this.f['villageId'].value || 0;
    this.masterService.getAllSchoolByCriteria('', Tid, Vid, Cid).subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.schoolArr.push({ "id": 0, "schoolName": "All", "m_SchoolName": "सर्व" }, ...res.responseData);
        } else {
          this.commonMethodS.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethodS.showPopup(res.statusMessage, 1);
          this.schoolArr = [];
        }
      }
    });
  }

  getTableData(flag?: any) {
    this.ngxSpinner.show();
    this.pageNumber = flag == 'filter' ? 1 : this.pageNumber;
    let formValue = this.filterForm.value;
    let str = `TalukaId=${(formValue?.talukaId || 0)}&CenterId=${(formValue?.centerId || 0)}&VillageId=${(formValue?.villageId || 0)}&SchoolId=${(formValue?.schoolId || 0)}&CCTVLocationId=${formValue?.cCTVLocationId || 0}&pageno=${this.pageNumber}&pagesize=10&TextSearch=${(formValue?.textSearch || '')}&lan=${this.webStorageS.languageFlag}`;
    let reportStr = `TalukaId=${(formValue?.talukaId || 0)}&CenterId=${(formValue?.centerId || 0)}&VillageId=${(formValue?.villageId || 0)}&SchoolId=${(formValue?.schoolId || 0)}&CCTVLocationId=${formValue?.cCTVLocationId || 0}&pageno=${this.pageNumber}&pagesize=${this.totalCount * 10}&TextSearch=${(formValue?.textSearch || '')}&lan=${this.webStorageS.languageFlag}`;

    this.apiService.setHttp('GET', 'zp-satara/CCTV/GetAllCCTVList?' + ((flag == 'excel' || flag == 'pdfFlag') ? reportStr : str), false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.ngxSpinner.hide();
          flag != 'excel' && flag != 'pdfFlag' ? this.tableDataArray = res.responseData.responseData1 : this.tableDataArray = this.tableDataArray;
          this.totalCount = res.responseData.responseData2.pageCount;
          this.tableDatasize = res.responseData.responseData2.pageCount;
          // let data: [] = (flag == 'pdfFlag' || flag == 'excel') ? res.responseData.responseData1 : [];
          // flag == 'pdfFlag' ? this.pdfDownload(data, 'pdfFlag') : flag == 'excel' ? this.pdfDownload(data, 'excel') : '';
        }
        else {
          this.ngxSpinner.hide();
          this.tableDataArray = [];
          this.tableDatasize = 0;
        }
        // this.languageChange();
      },
      error: ((err: any) => { this.commonMethodS.checkEmptyData(err.statusText) == false ? this.errors.handelError(err.statusCode) : this.commonMethodS.showPopup(err.statusText, 1); })
    });
  }
  

  // clear dropdown 
  onChangeDropD(flag?: string){
    console.log(flag);
    switch (flag) {
      case 'taluka':
        this.f['centerId'].setValue(0);
        this.f['villageId'].setValue(0);
        this.villageArr = [];
        this.schoolArr = [];
        break;
      case 'center':
        this.f['villageId'].setValue(0);
        this.schoolArr = [];
        break;
      case 'village':
        this.f['schoolId'].setValue(0);
        break;
     
    }

  }
  
}
