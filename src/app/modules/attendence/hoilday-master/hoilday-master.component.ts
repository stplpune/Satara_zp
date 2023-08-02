import { Component } from '@angular/core';
import { AddHoildayMasterComponent } from './add-hoilday-master/add-hoilday-master.component';
import { MatDialog } from '@angular/material/dialog';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { ApiService } from 'src/app/core/services/api.service';

@Component({
  selector: 'app-hoilday-master',
  templateUrl: './hoilday-master.component.html',
  styleUrls: ['./hoilday-master.component.scss']
})
export class HoildayMasterComponent {
  displayedheadersEnglish = ['Sr. No.', ' Day', 'Check In Time', 'Check Out Time', 'Attendence', 'Remark', 'Action'];
  displayedheadersMarathi = ['अनुक्रमांक', 'दिवस', 'चेक इन वेळ', 'वेळ तपासा', 'उपस्थिती', 'शेरा', 'कृती'];

  viewStatus='Table';
  constructor(public dialog: MatDialog,
    private errors:ErrorsService,
    private apiService:ApiService) {}


 

  openDialog(data?:any) {
   const dialogRef= this['dialog'].open(AddHoildayMasterComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result == 'yes' && data) {
        // this.getTableData();
        // this.pageNumber = this.pageNumber;
      } else if (result == 'yes') {
        // this.getTableData();
        // this.pageNumber = 1;
      }
    });
  }

  childCompInfo(obj: any) {
    switch (obj.label) {
      case 'Pagination':
        // this.filterFlag ? '' : (this.textSearch.setValue(''), this.filterFlag = false);
        // this.pageNumber = obj.pageNumber;
        // this.getTableData();
        break;
      case 'Edit':
        this.openDialog(obj);
        break;
      case 'Block':
        // this.openBlockDialog(obj);
        break;
      case 'Delete':
        // this.globalDialogOpen(obj);
        break;
    }
  }

  getTableData(status?:any) {
    status
    // status == 'filter' ? (this.filterFlag = true, (this.pageNumber = 1)) : '';
    // let formData = this.textSearch.value?.trim() || '';
    // let str = 'TextSearch='+formData+  '&PageNo='+this.pageNumber+'&PageSize=10' ;
    // let excel = 'TextSearch='+formData+  '&PageNo='+1+'&PageSize='+this.totalCount ;
    this.apiService.setHttp('GET', 'zp-satara/AssetSubCategory/GetAll?', false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          // status != 'excel' ? this.tableresp = res.responseData.responseData1 : this.tableresp = this.tableresp;
          // this.totalItem = res.responseData.responseData2.pageCount;
          // this.totalCount = res.responseData.responseData2.pageCount;
          // this.resultDownloadArr = [];
          // let data: [] = res.responseData.responseData1;
          // status == 'excel' ? this.pdfDownload(data) : '';
        } else {
          // this.tableresp = [];
          // this.totalItem=0
        }
        this.setTableData();
      },
      error: ((err: any) => { this.errors.handelError(err) })
    });
  }

  setTableData(){
// this.highLightFlag=true;
    // let displayedColumnsReadMode = ['srNo', 'Category Name', 'Sub Category', 'Status', 'Action'];
    let displayedColumns = ['srNo', 'category', 'subCategory', 'action'];
    let tableData = {
      // pageNumber: this.pageNumber,
      img: '',
      blink: '',
      badge: '',
      // isBlock: 'status',
      // pagintion:this.totalItem > 10 ? true : false,
      displayedColumns: displayedColumns,
      // tableData: this.tableresp,
      // tableSize: this.totalItem,
      // tableHeaders: displayedColumnsReadMode,
      // tableHeaders: this.langTypeName == 'English' ? this.displayedheadersEnglish : this.displayedheadersMarathi,
    };
    // this.highLightFlag ? this.tableData.highlightedrow = true : this.tableData.highlightedrow = false,
    this.apiService.tableData.next(tableData);
  }
}

