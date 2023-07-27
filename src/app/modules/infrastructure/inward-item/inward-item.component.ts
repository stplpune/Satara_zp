import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AddInwardItemComponent } from './add-inward-item/add-inward-item.component';
import { ApiService } from 'src/app/core/services/api.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { WebStorageService } from 'src/app/core/services/web-storage.service';

@Component({
  selector: 'app-parameter',
  templateUrl: './inward-item.component.html',
  styleUrls: ['./inward-item.component.scss']
})
export class InwardItemComponent {
  viewStatus="Table";
  cardViewFlag: boolean = false;
  filterForm!: FormGroup;
  pageNumber: number = 1;
  tableDataArray = new Array();
  tableDatasize!: Number;
  totalCount!:number;
  tableData: any;
  highLightFlag: boolean =true;
  displayedColumns = new Array();
  langTypeName: any;
  displayedheadersEnglish = ['Sr. No.', 'Category', 'Sub Category', 'Item', 'Units', 'Purchase Date', 'Price', 'Remark', 'Photo', 'Action'];
  displayedheadersMarathi = ['अनुक्रमांक', 'श्रेणी', 'उप श्रेणी', 'वस्तू', 'युनिट्स', 'खरेदी दिनांक', 'किंमत', 'टिप्पणी', 'फोटो','कृती'];

  constructor (private fb: FormBuilder,
    public dialog: MatDialog,
    private apiService: ApiService,
    private errors: ErrorsService,
    private commonMethodS: CommonMethodsService,
    private ngxSpinner: NgxSpinnerService,
    private webStorageS : WebStorageService){}

    ngOnInit(){
      this.webStorageS.langNameOnChange.subscribe(lang => {
        this.langTypeName = lang;
        this.languageChange();
      });
    }


    filterFormData() {
      this.filterForm = this.fb.group({
        CategoryId: [''],
        SubCategoryId: [''],
        villageId:[''],
        ItemsId: [''],
        textSearch: ['']
      })
    }

    getTableData(flag?: string) {
      // this.tableDataArray = [];
      this.ngxSpinner.show();
      this.pageNumber = flag == 'filter' ? 1 : this.pageNumber;
      let str = ``;
  
      this.apiService.setHttp('GET', '' + str, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
  
        next: (res: any) => {
          if (res.statusCode == 200) {
            this.ngxSpinner.hide();
            this.tableDataArray = res.responseData.responseData1;
            this.totalCount = res.responseData.responseData2.pageCount;
            this.tableDatasize = res.responseData.responseData2.pageCount;     
          }
          else {
            this.ngxSpinner.hide();
            this.tableDataArray = [];
            this.tableDatasize = 0;
            this.tableDatasize == 0 ? this.commonMethodS.showPopup(this.webStorageS.languageFlag == 'EN' ? 'No Record Found' : 'रेकॉर्ड उपलब्ध नाही', 1) : '';
          }
          this.languageChange();
        },
        error: ((err: any) => { this.commonMethodS.checkEmptyData(err.statusText) == false ? this.errors.handelError(err.statusCode) : this.commonMethodS.showPopup(err.statusText, 1); })
      });
    }

    languageChange() {
      this.highLightFlag=true;
      this.displayedColumns = ['srNo', 'uploadImage', this.langTypeName == 'English' ? 'schoolName' : 'm_SchoolName', this.langTypeName == 'English' ? 'district' : 'm_District', this.langTypeName == 'English' ? 'taluka' : 'm_Taluka', this.langTypeName == 'English' ? 'center' : 'm_Center', this.langTypeName == 'English' ? 'village' : 'm_Village', 'action'];
      // this.displayedColumns = ['srNo', 'uploadImage', this.langTypeName == 'English' ? 'schoolName' : 'm_SchoolName', this.langTypeName == 'English' ? 'district' : 'm_District', this.langTypeName == 'English' ? 'taluka' : 'm_Taluka', this.langTypeName == 'English' ? 'center' : 'm_Center', this.langTypeName == 'English' ? 'village' : 'm_Village', 'action'];
      this.tableData = {
        pageNumber: this.pageNumber,
        img: '', blink: '', badge: '', isBlock: '', pagintion: true, defaultImg: "",
        displayedColumns: this.displayedColumns,
        tableData: this.tableDataArray,
        tableSize: this.tableDatasize,
        tableHeaders: this.langTypeName == 'English' ? this.displayedheadersEnglish : this.displayedheadersMarathi
      };
      this.highLightFlag?this.tableData.highlightedrow=true:this.tableData.highlightedrow=false,
      this.apiService.tableData.next(this.tableData);
    }


    openDialog() {
      const dialogRef = this.dialog.open(AddInwardItemComponent,
        {
          width: '500px',
          disableClose: true,
          autoFocus: false
        });
  
      dialogRef.afterClosed().subscribe(result => {
        console.log(`Dialog result: ${result}`);
      });
    }
  }
  
