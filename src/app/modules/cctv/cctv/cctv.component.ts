import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { MasterService } from 'src/app/core/services/master.service';
import { WebStorageService } from 'src/app/core/services/web-storage.service';
declare var Player: any;
// import * as Player from '../../../../assets/js/cctv_js/play.js';


@Component({
  selector: 'app-cctv',
  templateUrl: './cctv.component.html',
  styleUrls: ['./cctv.component.scss']
})
export class CctvComponent {
  viewStatus = 'Table';
  pageNumber: number = 1;
  displayedheadersEnglish = ['Sr. No.', 'cctvLocation', 'cctvName', 'cctvModel', 'Register Date', 'Action'];
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
  talukaArr = new Array();
  centerArr = new Array();
  villageArr = new Array();
  schoolArr = new Array();
  selectedCCTV: any;
  cctvFlag: boolean = false;
  canvas= new Array();
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
    
  ) {


  }


  ngOnInit() {
    this.webStorageS.langNameOnChange.subscribe(lang => {
      this.langTypeName = lang;
      this.languageChange();
    });
    this.filterFormData();
    this.getTalukaDropByDis();
    this.getAllCCTVLocation();
    this.getTableData();

    //For cctv 


  }



  //loader.style.display = 'none';

  showLoader() {
    let loadershow: any = document.getElementById("myname");
    console.log("clicked");
    loadershow.style.display = 'block';

  }

  hideLoader() {
    var loadershow: any = document.getElementById("myname");
    console.log("clicked");
    loadershow.style.display = 'none';
  }

  ngAfterViewInit() {
    // for cctv
    // let node = document.createElement('script');
    // node.src = "assets/js/cctv_js/jadecoder.js";//Change to your js file
    // document.getElementsByTagName('head')[0].appendChild(node);

    // let node1 = document.createElement('script');
    // node1.src = "assets/js/cctv_js/hevcdec.js";//Change to your js file
    // document.getElementsByTagName('head')[0].appendChild(node1);

    // let node2 = document.createElement('script');
    // node2.src = "assets/js/cctv_js/glutils.js";//Change to your js file
    // document.getElementsByTagName('head')[0].appendChild(node2);

    // let node3 = document.createElement('script');
    // node3.src = "assets/js/cctv_js/connector.js";//Change to your js file
    // document.getElementsByTagName('head')[0].appendChild(node3);

    // let node4 = document.createElement('script');
    // node4.src = "assets/js/cctv_js/play.js";//Change to your js file
    // document.getElementsByTagName('head')[0].appendChild(node4);
    // node4.onload = () => {
    //   this?.init(); 
    // };


  }

  filterFormData() {
    this.filterForm = this.fb.group({
      talukaId: [''],
      centerId: [''],
      villageId: [''],
      schoolId: [''],
      cCTVLocationId: [''],
      textSearch: [''],
    })
  }

  // Get Taluka Dropdown By district

  getTalukaDropByDis() {
    this.talukaArr = [];
    this.masterService.getAllTaluka('').subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.talukaArr.push({ "id": 0, "taluka": "All", "m_Taluka": "सर्व" }, ...res.responseData);
          this.f['talukaId'].setValue(0);
          this.filterForm?.value.talukaId ? this.getCenterDropByTaluka() : '';
        } else {
          this.commonMethodS.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethodS.showPopup(res.statusMessage, 1);
          this.talukaArr = [];
        }
      }
    });
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
            this.filterForm?.value.villageId ? this.getSchoolDropByFilter() : '';
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
          this.selectedCCTV = this.tableDataArray[0]; // bydefault patch first CCTV camera
          this.tableDataArray.map((x: any, i: any)=>{
            x.canvas = 'canvas'+i
          })
          console.log("this.tableDataArray", this.tableDataArray);
          
          this?.init();
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

  // Click table row 
  childCompInfo(obj?: any) {
    if (obj.label == 'View') {
      this.selectedCCTV = obj;
      console.log("call view ");

      this.connect(obj);

    }
    else {

    }
  }


  // clear dropdown 
  onChangeDropD(flag?: string) {
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

  // clear button func
  clearForm() {
    this.filterForm.reset();
    this.villageArr = [];
    this.centerArr = [];
    this.schoolArr = [];
    this.CCTVLocationArr = [];
    this.getTableData();
  }

  init() {
    for(let i = 0; i < this.tableDataArray.length; i++){
      // this.canvas.push(document.getElementById('canvas'+i));
    // this.canvas.push(document.getElementById(this.tableDataArray[i].canvas));
    this.canvas.push('canvas#'+this.tableDataArray[i].canvas)
    console.log([this.canvas]);
    
    
     
    }
    // document.getElementById("canvas1")
    Player?.init(this.canvas);
    this.connect();
  }

  connect(_obj?: any) {
    for(let i = 0; i < this.tableDataArray.length; i++){
      this.ngxSpinner.show();
      let streamid = 1;
      let channel = 0;
      Player?.ConnectDevice('5625617245', '', 'admin', '87be!01cd4', 0, 80, 0, +channel, +streamid)

      // document.getElementById("channel").disabled = true;
      var devid: any ="5625617245";
      Player?.OpenStream(devid?.value, '', +channel, +streamid, 0);
      this.ngxSpinner.hide();
      // setTimeout(() => { this.openvideo() }, 0);
      // Player?.ConnectDevice(obj?.deviceId, '', obj?.userName, obj?.password, 0, 80, 0, +channel?.value, +streamid?.value)
    
    }

   }

  disconnect() {
    debugger;
    var devid: any = document.getElementById("dev_id");
    Player?.DisConnectDevice(devid?.value)
  }

  openvideo() {
    debugger;

  }

  closevideo() {
    Player?.CloseStream(0)
  }
}

