import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddAssetTypeComponent } from './add-asset-type/add-asset-type.component';
import { ApiService } from 'src/app/core/services/api.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { FormControl } from '@angular/forms';
import { GlobalDialogComponent } from 'src/app/shared/components/global-dialog/global-dialog.component';
import { WebStorageService } from 'src/app/core/services/web-storage.service';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';

@Component({
  selector: 'app-asset-type',
  templateUrl: './asset-type.component.html',
  styleUrls: ['./asset-type.component.scss']
})
export class AssetTypeComponent {
  viewStatus='Table';
  tableresp:any;
  totalItem:any;
  langTypeName: any;
  pageNumber: number = 1;
  assestType=new FormControl();
  filterFlag: boolean = false;
  // displayedColumns: string[] = ['position', 'name', 'SubCategory','AssetType','weight', 'symbol'];
  

  constructor(public dialog: MatDialog,
   private apiService:ApiService,
   private errors:ErrorsService,
   private webStorage:WebStorageService,
   private commonService:CommonMethodsService) {}

   ngOnInit(){
    this.getTableData();
   }

  openDialog(data?:any) {
    const dialogRef = this.dialog.open(AddAssetTypeComponent,{
      width: '400px',
      data:data,
      disableClose: true,
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == 'yes' && data) {
        this.getTableData();
        this.pageNumber = this.pageNumber;
      } else if (result == 'yes') {
        this.getTableData();
        this.pageNumber = 1;
      }
    });
  }


  
  getTableData(status?:any) {
    status == 'filter' ? (this.filterFlag = true, (this.pageNumber = 1)) : '';
    let formData = this.assestType.value || ''
    this.apiService.setHttp('GET', 'zp-satara/AssetType/GetAll?TextSearch='+formData+'&PageNo='+this.pageNumber+'&PageSize=10&lan=e' , false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.tableresp = res.responseData.responseData1;
          this.totalItem = res.responseData.responseData2.pageCount;
        } else {
          this.tableresp = [];
          this.totalItem=0
        }
        this.getTableTranslatedData();
      },
      error: ((err: any) => { this.errors.handelError(err) })
    });
  }

  childCompInfo(obj: any) {
    switch (obj.label) {
      case 'Pagination':
        this.filterFlag ? '' : (this.assestType.setValue(''), this.filterFlag = false);
        this.pageNumber = obj.pageNumber;
        this.getTableData();
        break;
      case 'Edit':
        this.openDialog(obj);
        break;
      case 'Block':
        this.openBlockDialog(obj);
        break;
      case 'Delete':
        // this.globalDialogOpen(obj);
        break;
    }
  }

  getTableTranslatedData() {
    // this.highLightFlag=true;
    let displayedColumnsReadMode = ['srNo', 'Category Name', 'Sub Category', 'Asset Type','Status', 'Action'];
    let displayedColumns = ['srNo', 'category', 'subCategory', 'type','status', 'action'];
    let tableData = {
      pageNumber: this.pageNumber,
      img: '',
      blink: '',
      badge: '',
      isBlock: 'status',
      pagintion:this.totalItem > 10 ? true : false,
      displayedColumns: displayedColumns,
      tableData: this.tableresp,
      tableSize: this.totalItem,
      tableHeaders: displayedColumnsReadMode,
    };
    // this.highLightFlag ? this.tableData.highlightedrow = true : this.tableData.highlightedrow = false,
    this.apiService.tableData.next(tableData);
  }

  clearFilter(){
    this.assestType.setValue('');
    this.pageNumber=1;
    this.getTableData();
  }

  openBlockDialog(obj: any) {
    let userEng = obj.isBlock == false ? 'Active' : 'Inactive';
    let userMara = obj.isBlock == false ? 'सक्रिय' : 'निष्क्रिय';
    let dialoObj = {
      header: this.langTypeName == 'English' ? userEng + ' Asset Type' : 'ऑफिस वापरकर्ता ' + userMara + ' करा',
      title: this.langTypeName == 'English' ? 'Do You Want To ' + userEng + ' The Selected Asset Type?' : 'तुम्ही निवडलेल्या ऑफिस वापरकर्त्याला ' + userMara + ' करू इच्छिता?',
      cancelButton: this.langTypeName == 'English' ? 'Cancel' : 'रद्द करा',
      okButton: this.langTypeName == 'English' ? 'Ok' : 'ओके'
    }
    const deleteDialogRef = this.dialog.open(GlobalDialogComponent, {
      width: '320px',
      data: dialoObj,
      disableClose: true,
      autoFocus: false
    })
    deleteDialogRef.afterClosed().subscribe((result: any) => {
      result == 'yes' ? this.getStatusData(obj) : this.getTableData();
      // this.highLightFlag=false;
      // this.languageChange();
    })
  }

  getStatusData(data:any){
    let webdata = this.webStorage.createdByProps();
    let obj={
      "id": data.id,
      "status": !data.status,
      "statusChangeBy": this.webStorage.getUserId(),
      "statusChangeDate": webdata.modifiedDate,
      "lan": this.webStorage.languageFlag
    }
    this.apiService.setHttp('put', 'zp-satara/AssetType/UpdateStatus' , false, obj, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.commonService.snackBar(res.statusMessage, 0);
          
        } else {
          this.commonService.snackBar(res.statusMessage, 1);
        
        }
        this.getTableTranslatedData();
      },
      error: ((err: any) => { this.errors.handelError(err) })
    });
  }

  

}



