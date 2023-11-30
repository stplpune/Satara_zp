import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { MasterService } from 'src/app/core/services/master.service';
import { WebStorageService } from 'src/app/core/services/web-storage.service';
import { LiveStreamingComponent } from './live-streaming/live-streaming.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-cctv',
  templateUrl: './cctv.component.html',
  styleUrls: ['./cctv.component.scss']
})
export class CctvComponent {
  viewStatus = 'Table';
  pageNumber: number = 1;
  displayedheadersEnglish = ['Sr. No.', 'CCTV Location', 'CCTV Name', 'CCTV Model', 'Register Date', 'Action'];
  displayedheadersMarathi = ['अनुक्रमांक', 'cctv स्थान', 'cctv नाव', 'cctv मॉडेल', 'नोंदणी तारीख', 'कृती'];
  filterForm!: FormGroup;
  // displayedColumns: string[] = ['position', 'name', 'weight', 'symbol', 'Attendence', 'Remark', 'Action'];
  tableDataArray = new Array();
  tableDatasize!: Number;
  totalCount: number = 0;
  tableData: any;
  highLightFlag: boolean = true;
  displayedColumns = new Array();
  langTypeName: any;
  stateArr = new Array();
  districtArr = new Array();
  talukaArr = new Array();
  centerArr = new Array();
  villageArr = new Array();
  schoolArr = new Array();
  selectedCCTV: any;
  cctvFlag: boolean = false;
  playStopFlag: boolean = true;
  timer: any;
  ccTvId!: number;
  loginData = this.webStorageS.getLoggedInLocalstorageData();
  get f() {
    return this.filterForm.controls
  }

  CCTVLocationArr = new Array();

  constructor(private ngxSpinner: NgxSpinnerService,
    private apiService: ApiService,
    private commonMethodS: CommonMethodsService,
    private errors: ErrorsService,
    public webStorageS: WebStorageService,
    private fb: FormBuilder,
    private masterService: MasterService,
    public dialog: MatDialog
  ) {

  }


  ngOnInit() {
    this.webStorageS.langNameOnChange.subscribe(lang => {
      this.langTypeName = lang;
      this.languageChange();
    });
    this.filterFormData();
    this.getState();
    this.getAllCCTVLocation();
    this.getTableData();
  }

  filterFormData() {
    this.filterForm = this.fb.group({
      stateId: [''],
      districtId: [''],
      talukaId: [''],
      centerId: [''],
      villageId: [''],
      schoolId: [''],
      cCTVLocationId: [''],
      textSearch: [''],
    })
  }

  getState() {
    this.stateArr = [];
    this.masterService.getAllState('').subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.stateArr.push({ "id": 0, "state": "All", "m_State": "सर्व" }, ...res.responseData);
          this.loginData ? (this.f['stateId'].setValue(this.loginData.stateId), this.getDistrict()) : this.f['stateId'].setValue(0);
        }
        else {
          this.stateArr = [];
        }
      }
    })
  }

  getDistrict() {
    this.districtArr = [];
    let stateId = this.filterForm.value.stateId;
    if (stateId != 0) {
      this.masterService.getAllDistrict('', stateId).subscribe({
        next: (res: any) => {
          if (res.statusCode == "200") {
            this.districtArr.push({ "id": 0, "district": "All", "m_District": "सर्व" }, ...res.responseData);
            this.loginData ? (this.f['districtId'].setValue(this.loginData.districtId), this.getTalukaDropByDis()) : this.f['districtId'].setValue(0);
          }
          else {
            this.districtArr = [];
          }
        },
      });
    }
  }

  // Get Taluka Dropdown By district
  getTalukaDropByDis() {
    this.talukaArr = [];
    let districtId = this.f['districtId'].value
    if (districtId != 0) {
      this.masterService.getAllTaluka('', districtId).subscribe({
        next: (res: any) => {
          if (res.statusCode == "200") {
            this.talukaArr.push({ "id": 0, "taluka": "All", "m_Taluka": "सर्व" }, ...res.responseData);
            this.loginData ? (this.f['talukaId'].setValue(this.loginData?.talukaId), this.getCenterDropByTaluka()) : this.f['talukaId'].setValue(0);
          } else {
            this.commonMethodS.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethodS.showPopup(res.statusMessage, 1);
            this.talukaArr = [];
          }
        }
      });
    }
  }

  // Get Center Dropdown
  getCenterDropByTaluka() {
    this.centerArr = [];
    let id = this.f['talukaId'].value;
    if (id != 0) {
      this.masterService.getAllCenter('', id).subscribe({
        next: (res: any) => {
          if (res.statusCode == "200") {
            this.centerArr.push({ "id": 0, "center": "All", "m_Center": "सर्व" }, ...res.responseData);
            this.filterForm?.value.centerId ? this.getVillageDropByCenter() : '';
            this.loginData ? (this.f['centerId'].setValue(this.loginData?.centerId), this.getVillageDropByCenter()) : this.f['centerId'].setValue(0);
          } else {
            this.commonMethodS.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethodS.showPopup(res.statusMessage, 1);
            this.centerArr = [];
          }
        }
      });
    }
  }

  // Get Village Dropdown
  getVillageDropByCenter() {
    this.villageArr = [];
    let Cid = this.f['centerId'].value;
    if (Cid != 0) {
      this.masterService.getAllVillage('', Cid).subscribe({
        next: (res: any) => {
          if (res.statusCode == 200) {
            this.villageArr.push({ "id": 0, "village": "All", "m_Village": "सर्व" }, ...res.responseData);
            this.f['villageId'].setValue(0);
            this.loginData ? (this.f['villageId'].setValue(this.loginData?.villageId), this.getSchoolDropByFilter()) : this.f['villageId'].setValue(0);
          } else {
            this.commonMethodS.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethodS.showPopup(res.statusMessage, 1);
            this.villageArr = [];
          }
        }
      });
    }
  }

  // getSchool Drop 
  getSchoolDropByFilter() {
    this.schoolArr = [];
    let Tid = this.f['talukaId'].value;
    let Cid = this.f['centerId'].value || 0;
    let Vid = this.f['villageId'].value || 0;
    this.masterService.getAllSchoolByCriteria('', Tid, Vid, Cid).subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.schoolArr.push({ "id": 0, "schoolName": "All", "m_SchoolName": "सर्व" }, ...res.responseData);
          this.loginData ? (this.f['schoolId'].setValue(this.loginData?.schoolId)) : this.f['schoolId'].setValue(0);
        } else {
          this.commonMethodS.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethodS.showPopup(res.statusMessage, 1);
          this.schoolArr = [];
        }
      }
    });
  }

  // load cctv Location Dropdown
  getAllCCTVLocation() {
    this.CCTVLocationArr = [];
    this.masterService.getCCTVLocation('').subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.CCTVLocationArr = res.responseData
        } else {
          this.commonMethodS.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethodS.showPopup(res.statusMessage, 1);
          this.CCTVLocationArr = [];
        }
      },
    });
  }

  getTableData(flag?: any) {
    this.ngxSpinner.show();
    this.pageNumber = flag == 'filter' ? 1 : this.pageNumber;
    let formValue = this.filterForm.value;
    let str = `TalukaId=${(formValue?.talukaId || 0)}&CenterId=${(formValue?.centerId || 0)}&VillageId=${(formValue?.villageId || 0)}&SchoolId=${(formValue?.schoolId || 0)}&CCTVLocationId=${formValue?.cCTVLocationId || 0}&pageno=${this.pageNumber}&pagesize=10&TextSearch=${(formValue?.textSearch.trim() || '')}&lan=${this.webStorageS.languageFlag}`;
    let reportStr = `TalukaId=${(formValue?.talukaId || 0)}&CenterId=${(formValue?.centerId || 0)}&VillageId=${(formValue?.villageId || 0)}&SchoolId=${(formValue?.schoolId || 0)}&CCTVLocationId=${formValue?.cCTVLocationId || 0}&pageno=${this.pageNumber}&pagesize=${this.totalCount * 10}&TextSearch=${(formValue?.textSearch.trim() || '')}&lan=${this.webStorageS.languageFlag}`;

    this.apiService.setHttp('GET', 'zp-satara/CCTV/GetAllCCTVList?' + ((flag == 'excel' || flag == 'pdfFlag') ? reportStr : str), false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.ngxSpinner.hide();
          flag != 'excel' && flag != 'pdfFlag' ? this.tableDataArray = res.responseData.responseData1 : this.tableDataArray = this.tableDataArray;
          this.totalCount = res.responseData.responseData2.pageCount;
          this.tableDatasize = res.responseData.responseData2.pageCount;
          // this.selectedCCTV = this.tableDataArray[0]; // bydefault patch first CCTV camera


        }
        else {
          this.ngxSpinner.hide();
          this.tableDataArray = [];
          this.tableDatasize = 0;
        }
        this.languageChange();
      },
      error: ((err: any) => { this.commonMethodS.checkEmptyData(err.statusText) == false ? this.errors.handelError(err.statusCode) : this.commonMethodS.showPopup(err.statusText, 1); })
    });
  }

  languageChange() {
    this.highLightFlag = true;
    this.displayedColumns = ['srNo', this.langTypeName == 'English' ? 'cctvLocation' : 'm_CCTVLocation', this.langTypeName == 'English' ? 'cctvName' : 'cctvName', this.langTypeName == 'English' ? 'cctvModel' : 'cctvModel', 'registerDate'];
    this.tableData = {
      pageNumber: this.pageNumber,
      img: '', blink: '', badge: '', isBlock: '', pagintion: true, defaultImg: "",
      date: 'registerDate',
      displayedColumns: this.displayedColumns,
      tableData: this.tableDataArray,
      tableSize: this.tableDatasize,
      tableHeaders: this.langTypeName == 'English' ? this.displayedheadersEnglish : this.displayedheadersMarathi,
      edit: true, delete: true,
    };
    this.highLightFlag ? this.tableData.highlightedrow = true : this.tableData.highlightedrow = false,
      this.apiService.tableData.next(this.tableData);

  }

  childCompInfo(obj?: any) {
    this.ngxSpinner.show();
    setTimeout(() => {
      this.dialog.open(LiveStreamingComponent, {
        width: '800px',
        height:'520px',
        data:obj,
      });
      // this.ngxSpinner.hide();
    }, 15000);
  }

  // clear dropdown 
  onChangeDropD(flag?: string) {
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

  clearDependency(flag: any) {
    if (flag == 'state') {
      this.filterForm.controls['districtId']?.setValue('');
      this.filterForm.controls['talukaId']?.setValue('');
      this.filterForm.controls['centerId']?.setValue('');
      this.filterForm.controls['villageId']?.setValue('');
      this.filterForm.controls['schoolId']?.setValue('');
      this.districtArr = [];
      this.talukaArr = [];
      this.centerArr = [];
      this.villageArr = [];
      this.schoolArr = [];
    }
    else if (flag == 'district') {
      this.filterForm.controls['talukaId']?.setValue('');
      this.filterForm.controls['centerId']?.setValue('');
      this.filterForm.controls['villageId']?.setValue('');
      this.filterForm.controls['schoolId']?.setValue('');
      this.talukaArr = [];
      this.centerArr = [];
      this.villageArr = [];
      this.schoolArr = [];
    }
    else if (flag == 'taluka') {
      this.filterForm.controls['centerId']?.setValue(0);
      this.filterForm.controls['villageId']?.setValue('');
      this.filterForm.controls['schoolId']?.setValue('');
      this.centerArr = [];
      this.villageArr = [];
      this.schoolArr = [];
    } else if (flag == 'center') {
      this.filterForm.controls['villageId']?.setValue(0);
      this.filterForm.controls['schoolId']?.setValue('');
      this.villageArr = [];
      this.schoolArr = [];
    } else if (flag == 'village') {
      this.filterForm.controls['schoolId']?.setValue(0);
      this.schoolArr = [];
    }
  }


  // clear button func
  clearForm() {
    this.filterForm.reset();
    this.districtArr = [];
    this.talukaArr = [];
    this.villageArr = [];
    this.centerArr = [];
    this.schoolArr = [];
    this.CCTVLocationArr = [];
    this.getState();
    this.getTableData();
  }

}
