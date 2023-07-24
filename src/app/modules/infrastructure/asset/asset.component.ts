import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddAssetComponent } from './add-asset/add-asset.component';
import { WebStorageService } from 'src/app/core/services/web-storage.service';
import { ApiService } from 'src/app/core/services/api.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MasterService } from 'src/app/core/services/master.service';

@Component({
  selector: 'app-asset',
  templateUrl: './asset.component.html',
  styleUrls: ['./asset.component.scss']
})
export class AssetComponent {
  viewStatus='Table';
  displayedColumns: string[] = ['position', 'name', 'SubCategory','AssetType','Quantity','Description','Date','Addedby','symbol'];
  dataSource = ELEMENT_DATA;
  languageFlag!: string;
  pageNumber: number = 1;
  tableDataArray = new Array();
  tableDatasize!: Number;
  tableData: any;
  totalCount: number = 0;
  displayedheaders = ['Sr.No.','Taluka', 'Center', 'School Name', 'Standard', 'Assessed BaseLevel Student Count','Assessed ClassWise Student Count', 'Total Student Count'];
  displayedheadersMarathi = ['अनुक्रमांक', 'तालुका', 'केंद्र', 'शाळेचे नाव', 'इयत्ता','मूल्यांकन बेस लेव्हल विद्यार्थी संख्या', 'मूल्यांकन वर्गनिहाय विद्यार्थी संख्या','एकूण विद्यार्थी संख्या' ];
  highLightFlag: boolean =true;
  resultDownloadArr = new Array();
  filterForm!: FormGroup;
  categoryArr= new Array();
  subCategoryArr = new Array();
  assetTypeArr= new Array();

  constructor(public dialog: MatDialog,
              private webService: WebStorageService,
              private apiService: ApiService,
              private errors: ErrorsService,
              private commonMethods: CommonMethodsService,
              private fb: FormBuilder,
              private masterService: MasterService

              ) {}

  ngOnInit(){
    this.webService.langNameOnChange.subscribe(lang => {
      this.languageFlag = lang;
      this.setTableData();
    });
    this.getCategoryDrop();
    this.filterFormData()
    this.getTableData();   

  }

  filterFormData(){
    this.filterForm = this.fb.group({
      categoryId: [],
      subCategoryId: [],
      assetTypeId: [],
      textArea: []
    })
  }

  getCategoryDrop(){
    this.categoryArr = [];
    this.masterService.GetAllAssetCategory('').subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.categoryArr.push({ "id": 0, "category": "All", "m_Category": "सर्व" }, ...res.responseData);
          this.filterForm.controls['categoryId'].setValue(0);         
        } else {
          this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
          this.categoryArr = [];
        }
      }
    });

  }

  getSubCategoryDrop(){
    this.subCategoryArr = [];
    this.masterService.GetAssetSubCateByCateId(this.filterForm.value.categoryId,'').subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.subCategoryArr.push({ "id": 0, "subCategory": "All", "m_SubCategory": "सर्व" }, ...res.responseData);
          this.filterForm.controls['subCategoryId'].setValue(0);         
        } else {
          this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
          this.subCategoryArr = [];
        }
      }
    });

  }

  getAssetTypeDrop(){
    this.assetTypeArr = [];
    this.masterService.GetAllAssetType(this.filterForm.value.subCategoryId, '').subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.assetTypeArr.push({ "id": 0, "category": "All", "m_category": "सर्व" }, ...res.responseData);
          this.filterForm.controls['assetTypeId'].setValue(0);         
        } else {
          this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.showPopup(res.statusMessage, 1);
          this.assetTypeArr = [];
        }
      }
    });

  }

  getTableData(flag?: string){
    let formData = this.filterForm.value;
    let str = `zp-satara/Asset/GetAll?CategoryId=${formData?.categoryId}&SubCategoryId=${formData?.subCategoryId}&TypeId=${formData?.assetTypeId}&TextSearch=${formData?.textArea}&PageNo=${this.pageNumber}&PageSize=10&lan=''`
    let reportStr = `zp-satara/Asset/GetAll?CategoryId=${formData?.categoryId}&SubCategoryId=${formData?.subCategoryId}&TypeId=${formData?.assetTypeId}&TextSearch=${formData?.textArea}&PageNo=${1}&RowCount=0`;
    this.pageNumber =   flag == 'filter'? 1 :this.pageNumber;
    this.apiService.setHttp('GET', 'zp-satara/assessment-report/Download_AssessmentReport_SchoolWise?' + (flag == 'pdfFlag' ? reportStr : str), false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          flag != 'pdfFlag' ? this.tableDataArray = res.responseData.responseData1 : this.tableDataArray = this.tableDataArray;
          this.tableDatasize = res.responseData.responseData2[0].totalCount;
          console.log("tableDatasize", this.tableDatasize);
          
          this.totalCount = res.responseData.responseData2.totalCount;
          this.resultDownloadArr = [];
          let data: [] = res.responseData.responseData1;
          flag == 'pdfFlag' ? this.downloadPdf(data) : '';
        } else {
          this.tableDataArray = [];
          this.tableDatasize = 0;
          this.tableDatasize == 0 && flag == 'pdfFlag' ? this.commonMethods.showPopup('No Record Found', 1) : '';
        }
        this.setTableData();
      },
      error: ((err: any) => { this.errors.handelError(err) })
    });

  }

  setTableData(){

  }

  downloadPdf(data: any){
    console.log(data);
    
  }

  openDialog() {
    const dialogRef = this.dialog.open(AddAssetComponent,{
      width: '500px',
      disableClose: true,
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  clearDrop(flag?: string){
    switch(flag){
      case 'category':
        this.filterForm.controls['subCategoryId'].setValue('');
        this.filterForm.controls['assetTypeId'].setValue('');
        break;
        case 'subCategory':
          this.filterForm.controls['assetTypeId'].setValue('')
    }
  }
}

export interface PeriodicElement {
  name: string;
  position: any;
  SubCategory:any;
  AssetType:any;
  Quantity:any;
  Description:any;
  Date:any;
  Addedby:any;
  symbol: any;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: 'Hydrogen', SubCategory:'Table', AssetType:'Wooden',Quantity: 1.0079, Description: 'H',Date:'13/07/2023',Addedby:'Yuvraj Shinde',symbol:'',},
  {position: 2, name: 'Hydrogen', SubCategory:'Table', AssetType:'Wooden',Quantity: 1.0079, Description: 'H',Date:'14/08/2023',Addedby:'Yuvraj Shinde',symbol:'',},
  {position: 3, name: 'Hydrogen', SubCategory:'Table', AssetType:'Wooden',Quantity: 1.0079, Description: 'H',Date:'13/07/2023',Addedby:'Yuvraj Shinde',symbol:'',},
  {position: 4, name: 'Hydrogen', SubCategory:'Table', AssetType:'Wooden',Quantity: 1.0079, Description: 'H',Date:'14/08/2023',Addedby:'Yuvraj Shinde',symbol:'',},
];
