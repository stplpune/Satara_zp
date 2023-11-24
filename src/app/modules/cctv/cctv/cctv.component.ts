import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { MasterService } from 'src/app/core/services/master.service';
import { WebStorageService } from 'src/app/core/services/web-storage.service';
//import { init_api } from '../../../../assets/js/player-min.js';
declare var Flashphoner: any;

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
  i:number = 0;
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
    this.init_api();
  }
  SESSION_STATUS = Flashphoner.constants.SESSION_STATUS;
  STREAM_STATUS = Flashphoner.constants.STREAM_STATUS;
  session: any;
  PRELOADER_URL = "https://github.com/flashphoner/flashphoner_client/raw/wcs_api-2.0/examples/demo/dependencies/media/preloader.mp4";



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

  //loader.style.display = 'none';

  init_api() {
    Flashphoner.init({});
    //Connect to WCS server over websockets
    if(this.session){
      Flashphoner.on(this.SESSION_STATUS.DISCONNECTED)
    }
    
   
    this.session = Flashphoner.createSession({
      urlServer: "wss://demo.flashphoner.com" //specify the address of your WCS
    }).on(this.SESSION_STATUS.ESTABLISHED, (_session: any) => {
      console.log("ESTABLISHED");
    });
  }

  Browser: any = {
    isSafari: function () {
      return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    },
  }

  playClick(url: any) {
    if (this.Browser.isSafari()) {
      Flashphoner.playFirstVideo(document.getElementById("play"), true, this.PRELOADER_URL).then(() => {
        this.playStream(url);
      });
    } else {
      this.playStream(url);
    }
  }

  playStream(url: any) {
    var options:any = {
      name: url,
      display: document.getElementById("play")
    };
    var stream = this.session.createStream(options).on(this.STREAM_STATUS.PLAYING, (_stream: any) => {
      console.log("playing");
    });
    stream.play();
  }

  




  showLoader() {
    let loadershow: any = document.getElementById("myname");
    loadershow.style.display = 'block';
  }

  hideLoader() {
    var loadershow: any = document.getElementById("myname");
    loadershow.style.display = 'none';
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

  
  getState(){
    this.stateArr = [];
    this.masterService.getAllState('').subscribe({
      next: (res: any) => {
        if(res.statusCode == "200"){
          this.stateArr.push({"id": 0, "state": "All", "m_State": "सर्व"}, ...res.responseData);
        }
        else{
          this.stateArr = [];
        }
      }
    })
  }

  getDistrict() {
    this.districtArr = [];
    let stateId = this.filterForm.value.stateId;
    if(stateId != 0){
      this.masterService.getAllDistrict('', stateId).subscribe({
        next: (res: any) => {
          if (res.statusCode == "200") {
            this.districtArr.push({"id": 0, "district": "All", "m_District": "सर्व"}, ...res.responseData);
            this.filterForm.controls['districtId'].setValue(0);
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
          this.f['talukaId'].setValue(0);
          this.filterForm?.value.talukaId ? this.getCenterDropByTaluka() : '';
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

  // Click table row 
  childCompInfo(obj?: any) {
    if (obj.label == 'View') {
      // this.init();    
    }
    else {
    }
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

  clearDependency(flag : any){
    if(flag == 'state'){
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
    else if(flag == 'district'){
      this.filterForm.controls['talukaId']?.setValue('');
      this.filterForm.controls['centerId']?.setValue('');
      this.filterForm.controls['villageId']?.setValue('');
      this.filterForm.controls['schoolId']?.setValue('');   
      this.talukaArr = [];
      this.centerArr = [];  
      this.villageArr = [];
      this.schoolArr = [];
    }
    else if(flag == 'taluka'){
      this.filterForm.controls['centerId']?.setValue(0);
      this.filterForm.controls['villageId']?.setValue('');
      this.filterForm.controls['schoolId']?.setValue('');   
      this.centerArr = [];  
      this.villageArr = [];
      this.schoolArr = [];
    }else if (flag == 'center'){
      this.filterForm.controls['villageId']?.setValue(0);
      this.filterForm.controls['schoolId']?.setValue('');
      this.villageArr = [];
      this.schoolArr = [];
    }else if (flag =='village'){
      this.filterForm.controls['schoolId']?.setValue(0);
      this.schoolArr = [];
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

  // init() {
  //   let streamid = 1;
  //   let channel = 0;
  //   var devid: any = '5625617245';
  //   let username = 'admin';
  //   let pwd = '87be!01cd4';
  //   let element:any;
  //   // let array: any  =[]
  //   element = document.getElementById("canvas1");
  //   Player?.init([element]);
  //   Player.ConnectDevice(devid, '', username, pwd, 0, 80, 0, channel, streamid, "ws")
    
  //     Player.ConnectDevice(devid, '', username, pwd, 0, 80, 0, channel, streamid, "ws")
    
  //   setTimeout(() => {
  //     Player.OpenStream(devid, '', channel, streamid, 0);
  //   }, 15000);
  // }
  

  // callOpenStreamMethod1(){
  //   this.timer = setInterval(() => {
  //     if (this.tableDataArray.length == this.i) {
  //       clearInterval(this.timer);
  //     } else {
  //       let streamid = 1;
  //       let channel = 0;
  //       var devid: any = '5625617245';
  //       Player?.OpenStream(devid, '', +channel, +streamid, this.i)
  //       this.i++;
  //     }
  //   }, 5000);
  // }

  // callOpenStreamMethod(_deviceID,_channel,_streamid, i){
  //   return new Promise((resolve) => {  //  return new Promise((resolve, reject) => {
  //     setTimeout(() => {
  //       Player?.OpenStream(_deviceID, '', +_channel, +_streamid, i)
  //     }, 10000);
  //     resolve
  //   })
   
  // }

  // disconnect() {
  //   Player?.DisConnectDevice('5625617245');
  //   const promiseOne = new Promise((resolve)=>{
  //     this.closeVideo();
  //     resolve('resolved')
  //   });

  //   promiseOne.then((value) => {
  //     console.log(value);
  //     this.init();
  //   });
    
  // }


  // closeVideo() {
  //   console.log("close exist live stream");
  //   // Player.DisConnectDevice('5625617245')
  //   Player?.CloseStream(0);
  //   this.playStopFlag = false;
  // }

  // openVideo(_selectedCCTV?: any){
  //   let devid: any = '5625617245';
  //   let streamid = 1;
  //   let channel = 0;
  //   Player.OpenStream(devid, '', channel, streamid, 0);
  //   this.playStopFlag = true;
  // }

  //  ptz_ctrl_up() {
	// 	let devid: any = '5625617245';
  //   let channel = 0;
	// 	Player.ptz_ctrl(devid, '', channel, 2, 6)
	// }
	//  ptz_ctrl_down() {
	// 	let devid: any = '5625617245';
  //   let channel = 0;
	// 	Player.ptz_ctrl(devid, '', channel, 3, 6)
	// }
	//  ptz_ctrl_left() {
	// 	let devid: any = '5625617245';
  //   let channel = 0;
	// 	Player.ptz_ctrl(devid, '', channel, 4, 6)
	// }
	//  ptz_ctrl_right() {
	// 	let devid: any = '5625617245';
  //   let channel = 0;
	// 	Player.ptz_ctrl(devid, '', channel, 5, 6)
	// }
	//  ptz_ctrl_stop() {
	// 	let devid: any = '5625617245';
  //   let channel = 0;
	// 	Player.ptz_ctrl(devid, '', channel, 0, 0)
	// }
}
