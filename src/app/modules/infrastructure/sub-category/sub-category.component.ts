import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddSubCategoryComponent } from './add-sub-category/add-sub-category.component';
import { ApiService } from 'src/app/core/services/api.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-sub-category',
  templateUrl: './sub-category.component.html',
  styleUrls: ['./sub-category.component.scss']
})
export class SubCategoryComponent {
  viewStatus = 'Table';
  totalItem: any;
  textSearch = new FormControl();

  tableresp: any;
  constructor(public dialog: MatDialog,
    private apiService: ApiService,
    private errors: ErrorsService) { }

  ngOnInit() {
    this.getTableData();
  }
  openDialog(data?:any) {
    const dialogRef = this.dialog.open(AddSubCategoryComponent, {
      width: '400px',
      data: data,
      disableClose: true,
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
      if (result == 'yes' && data) {
        this.getTableData();
        // this.pageNumber = this.pageNumber;
      } else if (result == 'yes') {
        this.getTableData();
        // this.pageNumber = 1;
      }
    });
  }


  childCompInfo(obj: any) {
    switch (obj.label) {
      case 'Pagination':

        break;
      case 'Edit':
        this.openDialog(obj);
        break;
      // case 'Block':
      //   this.globalDialogOpen();
      //   break;
      case 'Delete':
        // this.globalDialogOpen(obj);
        break;
    }
  }

  getTableData() {
    let formData = this.textSearch.value || ''
    this.apiService.setHttp('GET', 'zp-satara/AssetSubCategory/GetAll?TextSearch=' + formData + '&PageNo=1&PageSize=10', false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.tableresp = res.responseData.responseData1;
          this.totalItem = res.responseData.responseData2.pageCount;
        } else {
          this.tableresp = [];
        }
        this.getTableTranslatedData();
      },
      error: ((err: any) => { this.errors.handelError(err) })
    });
  }

  getTableTranslatedData() {
    // this.highLightFlag=true;
    let displayedColumnsReadMode = ['srNo', 'Category Name', 'Action'];
    let displayedColumns = ['srNo', 'category', 'action'];
    let tableData = {
      // pageNumber: this.totalItem > 10 ? true : false,
      img: '',
      blink: '',
      badge: '',
      isBlock: '',
      pagintion: true,
      displayedColumns: displayedColumns,
      tableData: this.tableresp,
      // tableSize: this.totalItem,
      tableHeaders: displayedColumnsReadMode,
    };
    // this.highLightFlag ? this.tableData.highlightedrow = true : this.tableData.highlightedrow = false,
    this.apiService.tableData.next(tableData);
  }

  clearFilterData() {
    this.textSearch.setValue('');
    // this.pageNumber=1;
    this.getTableData();
  }



}






