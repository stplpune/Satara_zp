import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { AesencryptDecryptService } from 'src/app/core/services/aesencrypt-decrypt.service';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { DownloadPdfExcelService } from 'src/app/core/services/download-pdf-excel.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { MasterService } from 'src/app/core/services/master.service';
import { WebStorageService } from 'src/app/core/services/web-storage.service';

@Component({
  selector: 'app-store-master',
  templateUrl: './store-master.component.html',
  styleUrls: ['./store-master.component.scss']
})
export class StoreMasterComponent {
  viewStatus = "Table";
  cardViewFlag: boolean = false;
  filterForm!: FormGroup;
  languageFlag:any;
  pageNumber: number = 1;
  tableDataArray = new Array();
  tableDatasize!:number;
  resultDownloadArr= new Array();
  highLightFlag !: boolean;
  isWriteRight !: boolean;
  stateArr = new Array();
  districtArr = new Array();
  talukaArr = new Array();
  centerArr = new Array();
  villageArr = new Array();
  schoolArr = new Array();
  categoryArr = new Array();
  subCategoryArr = new Array();
  itemArr = new Array();
  loginData = this.webService.getLoggedInLocalstorageData();
  totalCount!:number;
  
  displayedColumns = [ 'srNo','category', 'Type', 'Item', 'Total Inward','Total Outward','Available Stock','action'];
  marathiDisplayedColumns = ['srNo','m_Category', 'm_SubCategory','m_ItemName', 'description', 'action'];
  displayedheaders = ['Sr. No.',' Category', 'Sub-Category', 'Item Name', 'Total Inward','Total Outward','Available Stock','action'];
  marathiDisplayedheaders = ['अनुक्रमांक','श्रेणी', 'उप-श्रेणी', 'वस्तूचे नाव', 'एकूण आवक','एकूण जावक','उपलब्ध साठा', 'कृती'];
 


  constructor (private fb: FormBuilder,
    public dialog: MatDialog,
    private apiService: ApiService,
    public webService: WebStorageService,
    private commonMethodS: CommonMethodsService,
    private errors: ErrorsService,
    private masterService: MasterService,
    private commonMethods: CommonMethodsService,
    private downloadFileService: DownloadPdfExcelService,
    public datepipe: DatePipe,
    private ngxSpinner: NgxSpinnerService,
    private encrypt: AesencryptDecryptService,
    private router:Router,
    ){}

    get f(){return this.filterForm.controls}

  ngOnInit(): void {
    this.languageFlag = this.webService.languageFlag;
    this.webService.langNameOnChange.subscribe(lang => {
      this.languageFlag = lang;
      this.setTableData();
    });
    this.filterFormData();
    this.getState();
    this.getAllCategory();
    setTimeout(() => {
      this.getTableData();
    }, 1000);
  

    
  }

  filterFormData() {
    this.filterForm = this.fb.group({  
      // talukaId :[this.loginData.userTypeId > 2 ? this.loginData.talukaId : ''],
      // centerId:[this.loginData.userTypeId > 2 ? this.loginData.centerId : ''],
      // villageId:[this.loginData.userTypeId > 2 ? this.loginData.villageId : ''],
      // schoolId:[this.loginData.userTypeId > 2 ? this.loginData.schoolId : ''],
      stateId: [''],
      districtId: [''],
      talukaId :[''],
      centerId:[''],
      villageId:[''],
      schoolId:[''],
      CategoryId: [0],
      SubCategoryId: [''],     
      ItemsId: [''],
      textSearch: ['']
    })
  }

  getTableData(flag?: string) {
    let formValue =this.filterForm?.value;
    this.ngxSpinner.show();
    this.pageNumber = flag == 'filter' ? 1 : this.pageNumber;
   
    let str =`SchoolId=${formValue?.schoolId || 0}&CategoryId=${formValue?.CategoryId ||0}&SubCategoryId=${formValue?.SubCategoryId || 0}&ItemId=${formValue?.ItemsId || 0}&DistrictId=${formValue?.districtId || 0}&StateId=${formValue?.stateId || 0}&CenterId=${formValue?.centerId || 0}&TalukaId=${formValue?.talukaId || 0}&VillageId=${formValue?.villageId || 0}&PageNo=${this.pageNumber}&PageSize=10&lan=${this.languageFlag}`
    // let str=`CategoryId=${formValue?.CategoryId || 0}&SubCategoryId=${formValue?.SubCategoryId || 0}&pageno=${pageNo}&pagesize=10&TextSearch=${formValue?.textSearch || ''}&lan=${this.languageFlag}`   
    let reportStr = `SchoolId=${formValue?.schoolId || 0}&CategoryId=${formValue?.CategoryId ||0}&SubCategoryId=${formValue?.SubCategoryId || 0}&ItemId=${formValue?.ItemsId || 0}&DistrictId=${formValue?.districtId || 0}&StateId=${formValue?.stateId || 0}&CenterId=${formValue?.centerId || 0}&TalukaId=${formValue?.talukaId || 0}&VillageId=${formValue?.villageId || 0}&PageNo=1&PageSize=${this.tableDatasize*10}&lan=${this.languageFlag}`

    this.apiService.setHttp('GET', 'zp-satara/InwardOutwardReport/GetInwardOutwardReport?' + ((flag == 'pdfFlag' || flag == 'excel') ? reportStr : str), false, false, false, 'baseUrl');     
    this.apiService.getHttp().subscribe({
      next: (res: any) => {   
        if (res.statusCode == 200) {
          this.ngxSpinner.hide();
          flag != 'pdfFlag' && flag !='excel' ? this.tableDataArray = res.responseData.responseData1 : this.tableDataArray = this.tableDataArray;      
         this.tableDatasize = res.responseData.responseData2[0].pageCount; 
         this.totalCount = res.responseData.responseData2[0].totalCount;    
         this.resultDownloadArr=[];
         let data: [] = (flag == 'pdfFlag' || flag == 'excel') ? res.responseData.responseData1 : [];
         flag == 'pdfFlag' ? this.pdfDownload(data,'pdfFlag') : flag == 'excel' ? this.pdfDownload(data,'excel') :'';  
        }else{
          this.ngxSpinner.hide();
          this.tableDataArray =[];
          this.tableDatasize = 0;
          this.totalCount = 0;
        }
        this.setTableData();
      },
      error: ((err: any) => { (this.ngxSpinner.hide(),this.commonMethodS.checkEmptyData(err.statusText) == false) ? this.errors.handelError(err.statusCode) : this.commonMethodS.showPopup(err.statusText, 1); })
   
    });
  }

  setTableData(){
    this.highLightFlag =true;
    let displayedColumns  = [ 'srNo','category', 'subCategory', 'itemName', 'totalInward','totalOutward','availableStock'];;
    let marathiDisplayedColumns = ['srNo','m_Category', 'm_SubCategory','m_ItemName', 'totalInward','totalOutward','availableStock'];
    let tableData = {
      highlightedrow:true,
      pageNumber: this.pageNumber,
      img: 'docPath', blink: '', badge: '', isBlock: '', pagintion: this.totalCount > 10 ? true : false,
      displayedColumns: this.isWriteRight == true ? this.languageFlag == 'English' ? this.displayedColumns : this.marathiDisplayedColumns : this.languageFlag == 'English' ? displayedColumns : marathiDisplayedColumns,
      tableData: this.tableDataArray,
      tableSize: this.totalCount,      
      tableHeaders: this.languageFlag == 'English' ? this.displayedheaders : this.marathiDisplayedheaders,
    };
    this.highLightFlag?tableData.highlightedrow=true:tableData.highlightedrow=false,
    this.apiService.tableData.next(tableData);
  }

  // downloadPdf(data: any) { 
  //   data.find((ele: any, i: any) => {
  //     let obj = {
  //       srNo: i + 1,
  //       category: ele.category,
  //       subCategory: ele.subCategory,
  //       itemName: ele.itemName,
  //       description: ele.description,
  //     }
  //     this.resultDownloadArr.push(obj);
  //   });
  //   // download pdf call
  //   if (this.resultDownloadArr.length > 0) {
  //     let keyPDFHeader = ['Sr. No.',' Category', 'Type', 'Item Name', 'Total Inward','Total Outward','Available Stock'];;
  //     let ValueData =
  //       this.resultDownloadArr.reduce(
  //         (acc: any, obj: any) => [...acc, Object.values(obj).map((value) => value)], []
  //       );
  //     let objData: any = {
  //       'topHedingName': 'Stock Store List',
  //       'createdDate': 'Created on:' + this.datepipe.transform(new Date(), 'yyyy-MM-dd, h:mm a')
  //     }
  //     ValueData.length > 0 ? this.downloadFileService.downLoadPdf(keyPDFHeader, ValueData, objData) : ''
  //   }
  // }

  private marathiDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  convertToMarathiNumber(number: number): string {
    const englishNumberString = number.toString();
    let marathiNumberString = '';
    for (let i = 0; i < englishNumberString.length; i++) {
      const digit = parseInt(englishNumberString[i], 10);
      marathiNumberString += this.marathiDigits[digit];
    }
    return marathiNumberString;
  }

  pdfDownload(data?: any,flag?:string) {  
    this.resultDownloadArr=[];  
    data.find((ele: any, i: any) => {
      let  obj = {
        srNo: this.languageFlag == 'English' || flag != 'excel' ? (i + 1):this.convertToMarathiNumber(i+1),
        category:  flag == 'excel' ?this.languageFlag == 'English' ? ele.category:ele.m_Category:ele.category,
        type: flag == 'excel'?this.languageFlag == 'English' ?ele.subCategory:ele.m_SubCategory:ele.subCategory,
        itemName:flag == 'excel'?this.languageFlag == 'English' ? ele.itemName:ele.m_ItemName:ele.itemName,
        totalInward: ele.totalInward,
        totalOutward:ele.totalOutward,
        availableStock:ele.availableStock
      }
      // if(flag=='excel'){
      //    obj = {
      //     srNo: this.languageFlag == 'English' ? (i + 1):this.convertToMarathiNumber(i+1),
      //     category: this.languageFlag == 'English' ? ele.category:ele.m_Category,
      //     type: this.languageFlag == 'English' ?ele.subCategory:ele.m_SubCategory,
      //     itemName:this.languageFlag == 'English' ? ele.itemName:ele.m_ItemName,
      //     totalInward: ele.totalInward,
      //     totalOutward:ele.totalOutward,
      //     availableStock:ele.availableStock
      //   }
      // }else if(flag=='pdfFlag'){
      //    obj = {
      //     srNo: i + 1,
      //     category: ele.category,
      //     type: ele.subCategory,
      //     itemName: ele.itemName,
      //     totalInward: ele.totalInward,
      //     totalOutward:ele.totalOutward,
      //     availableStock:ele.availableStock
      //   }
      // }
      
      this.resultDownloadArr.push(obj);
    });


    if (this.resultDownloadArr?.length > 0) {
      let keyPDFHeader = [ 'Sr.No.','Category', 'Type', 'Item', 'Total Inward','Total Outward','Available Stock'];
      let MarathikeyPDFHeader =['अनुक्रमांक','श्रेणी', 'प्रकार', 'वस्तू', 'एकूण आवक','एकूण जावक','उपलब्ध साठा'];
      let ValueData =
        this.resultDownloadArr.reduce(
          (acc: any, obj: any) => [...acc, Object.values(obj).map((value) => value)], []
        );

        let objData: any;
        // if(flag=='excel'){
        //   objData = {
        //     'topHedingName': this.languageFlag == 'English'?'Store Stock List':'स्टोअर स्टॉक यादी',
        //     'createdDate':this.languageFlag == 'English'?'Created on:'+this.datepipe.transform(new Date(), 'yyyy-MM-dd, h:mm a') : 'रोजी तयार केले :'+this.datepipe.transform(new Date(), 'yyyy-MM-dd, h:mm a')
        //   }
        // }else if(flag=='pdfFlag'){
        //   objData = {
        //     'topHedingName': 'Store Stock List',
        //     'createdDate': 'Created on:' + this.datepipe.transform(new Date(), 'yyyy-MM-dd, h:mm a')
        //   }
        // }
        objData= {
          'topHedingName': flag == 'excel' ? this.languageFlag == 'English' ? 'Store Stock List' : 'स्टोअर स्टॉक यादी' : 'Store Stock List',
          'createdDate': (flag == 'excel' ? this.languageFlag == 'English' ? 'Created on:' : 'रोजी तयार केले :' : 'Created on:')+ this.datepipe.transform(new Date(), 'yyyy-MM-dd, h:mm a')
        }
        let headerKeySize = [7, 15, 20, 30, 20,20,20,20]
        flag == 'pdfFlag' ? this.downloadFileService.downLoadPdf(keyPDFHeader, ValueData, objData) :this.downloadFileService.allGenerateExcel(this.languageFlag == 'English'?keyPDFHeader:MarathikeyPDFHeader, ValueData, objData, headerKeySize)
    }
  }



  
  childCompInfo(obj: any) {
    switch (obj.label) {
      case 'Pagination':
        this.pageNumber = obj.pageNumber;
        this.getTableData();
        break;
      case 'Edit':
        //  this.addUpdateItem(obj);
        break;
      case 'Delete':
        // this.globalDialogOpen(obj);
        break;
      case 'View':
        this.openDetailsDialog(obj);
        break;
    }
  }

  openDetailsDialog(obj: any) {  
      let id:any = obj.stateId+'.'+obj.districtId+'.'+obj.talukaId+'.'+obj.centerId+'.'+obj.villageId+'.'+obj.schoolId+'.'+obj.categoryId+'.'+obj.subCategoryId+'.'+obj.itemId;
      let formdata:any = this.encrypt.encrypt(`${id}`);
       this.router.navigate(['/view-stock-details'], {
         queryParams: { id: formdata },
       });   
  }

  getState(){
    this.stateArr = [
      {"id": 0, "state": "All", "m_State": "सर्व"},
      {"id": 1, "state": "Maharashtra", "m_State": "महाराष्ट्र"}
    ];
  }

  getDistrict() {
    this.districtArr = [];
    // let stateId = this.filterForm.value.stateId;
    this.masterService.getAllDistrict('').subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.districtArr.push({"id": 0, "district": "All", "m_District": "सर्व"}, ...res.responseData);
          this.filterForm.controls['districtId'].setValue(0);
        }
        else {
          this.districtArr = [];
        }
      },
      error: ((err: any) => { this.commonMethods.checkEmptyData(err.statusText) == false ? this.errors.handelError(err.statusCode) : this.commonMethods.showPopup(err.statusText, 1); })
    });
  }

  getTaluka() {
    this.talukaArr = [];
    this.masterService.getAllTaluka('').subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.talukaArr.push({ "id": 0, "taluka": "All taluka", "m_Taluka": "सर्व तालुके" }, ...res.responseData);   
          // this.filterForm?.value.talukaId ? this.getAllCenter() : '';
          this.loginData?.talukaId ? (this.f['talukaId'].setValue(this.loginData?.talukaId),this.getAllCenter()) : this.f['talukaId'].setValue(0) 
        } else {
          this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
          this.talukaArr = [];
        }
      },
      // error: ((err: any) => { this.errors.handelError(err.statusCode || err.status) })
    });
  }

  getAllCenter() {
    this.centerArr = [];
    let id = this.filterForm.value.talukaId;
    if (id != 0) {
      this.masterService.getAllCenter('', id).subscribe({
        next: (res: any) => {
          if (res.statusCode == 200) {
            this.centerArr.push({ "id": 0, "center": "All center", "m_Center": "सर्व केंद्र" }, ...res.responseData);    
            // this.filterForm.controls['centerId'].setValue(0); 
            // this.filterForm?.value.centerId ? this.getVillage():'';
            this.loginData?.centerId ? (this.f['centerId'].setValue(this.loginData?.centerId), this.getVillage()) : this.f['centerId'].setValue(0)
          } else {
            this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
            this.centerArr = [];
          }
        },
        // error: ((err: any) => { this.errors.handelError(err.statusCode || err.status) })
      });
    }
  }

  getVillage() {
    this.villageArr = [];
    let Cid = this.filterForm.value.centerId;
    // let Cid = 0;
    if (Cid != 0) {
      this.masterService.getAllVillage('', Cid).subscribe({
        next: (res: any) => {
          if (res.statusCode == 200) {
            this.villageArr.push({ "id": 0, "village": "All village", "m_Village": "सर्व गाव" }, ...res.responseData);     
            // this.filterForm.controls['villageId'].setValue(0); 
            // this.filterForm?.value.villageId ? this.getAllSchoolsByCenterId():'';
            this.loginData?.villageId ? (this.f['villageId'].setValue(this.loginData?.villageId),this.getAllSchoolsByCenterId()) : this.f['villageId'].setValue(0)
          } else {
            this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
            this.villageArr = [];
          }
        },
        // error: ((err: any) => { this.errors.handelError(err.statusCode || err.status) })
      });
    }
  }

  getAllSchoolsByCenterId() {
    this.schoolArr = [];
    let Tid = this.filterForm.value.talukaId
    let Cid = this.filterForm.value.centerId || 0;
    let Vid = 0;
    this.masterService.getAllSchoolByCriteria('', Tid, Vid, Cid).subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.schoolArr.push({ "id": 0, "schoolName": "All school", "m_SchoolName": "सर्व शाळा" }, ...res.responseData);   
          this.loginData?.schoolId ? this.f['schoolId'].setValue(this.loginData?.schoolId):this.f['schoolId'].setValue(0)
        } else {
          this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
          this.schoolArr = [];
        }
      },
      // error: ((err: any) => { this.errors.handelError(err.statusCode || err.status) })
    });
  }

  getAllCategory() {
    this.categoryArr = [];
    this.masterService.GetAllAssetCategory(this.languageFlag).subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.categoryArr.push( {id: 0,category: "All category",m_Category: "सर्व श्रेणी"}, ...res.responseData);
          this.filterForm.controls['CategoryId'].setValue(0);  
        } else {
          this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
          this.categoryArr = [];
        }
      },
      // error: ((err: any) => { this.errors.handelError(err.statusCode) })
    });
  }

  getAllSubCategory() {
    let catId = this.filterForm.value.CategoryId; 
    this.subCategoryArr = [];
    this.masterService.GetAssetSubCateByCateId(catId,this.languageFlag).subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.subCategoryArr.push({"id": 0,"subCategory": "All SubCategory","m_SubCategory": "सर्व उपश्रेणी" },...res.responseData);
          this.filterForm.controls['SubCategoryId'].setValue(0);  
        } else {
          this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
          this.subCategoryArr = [];
        }
      },
      // error: ((err: any) => { this.errors.handelError(err.statusCode) })
    });
  }

  getItemDrop() {
    this.itemArr = [];
    let subCategoryId =  this.filterForm.value.SubCategoryId
    this.masterService.GetAllItem(subCategoryId, '').subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.itemArr.push({ "id": 0, "itemName": "All", "m_Item": "सर्व" }, ...res.responseData);
          this.filterForm.controls['ItemsId'].setValue(0); 
        } else {
          this.commonMethodS.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethodS.showPopup(res.statusMessage, 1);
          this.itemArr = [];
        }
      }
    });
  }

  clearDropdown(flag: any){
    if(flag == 'state'){
      this.filterForm.controls['districtId'].setValue(0);
      this.filterForm.controls['talukaId'].setValue(0);
      this.filterForm.controls['centerId'].setValue(0);
      this.filterForm.controls['villageId'].setValue(0);
      this.filterForm.controls['schoolId'].setValue(0);
      this.talukaArr = [];
      this.centerArr = [];
      this.villageArr = [];
      this.schoolArr = [];
    }else if(flag == 'district'){
      this.filterForm.controls['talukaId'].setValue(0);
      this.filterForm.controls['centerId'].setValue(0);
      this.filterForm.controls['villageId'].setValue(0);
      this.filterForm.controls['schoolId'].setValue(0);
      this.centerArr = [];
      this.villageArr = [];
      this.schoolArr = [];
    }else if(flag == 'taluka'){
      this.filterForm.controls['centerId'].setValue(0);
      this.filterForm.controls['villageId'].setValue(0);
      this.filterForm.controls['schoolId'].setValue(0);
      this.villageArr = [];
      this.schoolArr = [];
    }else if(flag == 'kendra'){
      this.filterForm.controls['villageId'].setValue(0);
      this.filterForm.controls['schoolId'].setValue(0);
      this.schoolArr = [];
    }else if(flag == 'village'){
      this.filterForm.controls['schoolId'].setValue(0);
    }else if(flag == 'category'){
      this.filterForm.controls['SubCategoryId'].setValue(0);
      this.filterForm.controls['ItemsId'].setValue(0);
      this.itemArr = [];
    }else if(flag == 'subcategory'){
      this.filterForm.controls['ItemsId'].setValue(0);
    }
  }

  onClear(){
    this.filterFormData();
    this.getTableData();
    this.districtArr = [];
    this.talukaArr = [];
    this.centerArr = [];
    this.villageArr = [];
    this.schoolArr = [];
    this.subCategoryArr = [];
    this.itemArr = [];
  }

  
}
