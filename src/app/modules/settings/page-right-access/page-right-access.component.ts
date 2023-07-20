import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { MasterService } from 'src/app/core/services/master.service';
import { ValidationService } from 'src/app/core/services/validation.service';
import { WebStorageService } from 'src/app/core/services/web-storage.service';

@Component({
  selector: 'app-page-right-access',
  templateUrl: './page-right-access.component.html',
  styleUrls: ['./page-right-access.component.scss']
})
export class PageRightAccessComponent {
  pageNumber: number = 1;
  searchContent = new FormControl('');
  tableData: any;
  DesignationLevelArr = new Array();
  DesignationArr = new Array();
  userRightFrm !: FormGroup;
  initialLoadFlag: boolean = true;
  tableDataArray = new Array();
  tableDatasize!: Number;
  displayedColumns = new Array();
  displayedheaders = ['Sr. No.', 'Page Name', 'Page URL', 'Select'];
  displayedheadersMarathi = ['अनुक्रमांक', 'पृष्ठाचे नाव', 'पृष्ठ युआरएल','निवडा',];
  isWriteRight!: boolean;
  langTypeName:any;
  constructor(
    private apiService: ApiService, 
    private errors: ErrorsService, 
    private webStorage: WebStorageService,    
    public commonService: MasterService,
    public commonMethods: CommonMethodsService,
    public validation: ValidationService,
    private ngxSpinner: NgxSpinnerService,
    private fb: FormBuilder) { }

  ngOnInit() {
    this.getIsWriteFunction();
    this.assignUserRightsForm();
    this.webStorage.langNameOnChange.subscribe(lang => {
      this.langTypeName = lang;
      this.getTableTranslatedData();
    });
  }

  getIsWriteFunction(){
    let print = this.webStorage?.getAllPageName().find((x: any) => {
      return x.pageURL == "page-right-access"
     });
     (print.writeRight === true) ?  this.isWriteRight = true : this.isWriteRight = false
  }

  getTableTranslatedData(){
    this.displayedColumns = ['srNo', this.langTypeName == 'English' ? 'pageName' : 'm_PageName', 'pageURL', 'select'];
      this.tableData = {
        pageNumber: this.pageNumber,
        img: '', blink: '', badge: '', isBlock: '', pagintion: true, checkBox: 'select',
        displayedColumns: this.displayedColumns, tableData: this.tableDataArray,
        tableSize: this.tableDatasize,
        isWriteRight: this.isWriteRight,
        tableHeaders: this.langTypeName == 'English' ? this.displayedheaders : this.displayedheadersMarathi,
      };
    this.apiService.tableData.next(this.tableData);
  }

  getDesignationLevel() {
    this.DesignationLevelArr = [];
    this.DesignationArr = [];
    this.commonService.GetAllDesignationLevel('').subscribe((response: any) => { 
      if(response?.statusCode == 200 && response?.responseData) {     
        this.DesignationLevelArr.push(...response?.responseData);    
        const objWithIdIndex = this.DesignationLevelArr.findIndex((obj) => obj.id === 1 );        
        this.DesignationLevelArr.splice(objWithIdIndex, 1);
        // this.DesignationLevelArr.splice(0, 1);
        if(this.DesignationLevelArr.length > 0){
          this.userRightFrm.patchValue({
            userType: this.DesignationLevelArr[0]?.id
          })
          this.getDesignation(this.DesignationLevelArr[0]?.id);
        }
      }
    });
  }

  getDesignation(id: any){
    this.DesignationArr = [];
    this.commonService.GetDesignationByLevelId('' , id).subscribe((response: any) => {
      if(response?.statusCode == 200 && response?.responseData) {
        this.DesignationArr.push(...response?.responseData);        
        let clerkIndex = this.DesignationArr.findIndex((x:any)=>(x.id == 16));
        id == 4 ? (this.DesignationArr.splice(clerkIndex,1)):'';
        let parentIndex = this.DesignationArr.findIndex((x:any)=>(x.id == 17));
        id == 4 ? this.DesignationArr.splice(parentIndex,1): ''        
        if(this.DesignationArr.length > 0){
          this.userRightFrm.patchValue({
            subUserType: this.DesignationArr[0]?.id
          })
          this.initialLoadFlag ? this.getUserRightPageList() : '';
        }
      }
    })
  }

  assignUserRightsForm() {
    this.userRightFrm = this.fb.group({
      userType: [''],
      subUserType: [''],
      Textsearch: ['']
    });
    this.getDesignationLevel();
  }

  getUserRightPageList(flag?: string) {
    this.ngxSpinner.show();
    this.tableDataArray = [];
    this.pageNumber = flag == 'filter' ? 1 : this.pageNumber;
    let str = 'pageno=' + this.pageNumber + '&TextSearch=' + this.userRightFrm.value.Textsearch + '&UserTypeId=' + this.userRightFrm.value.userType + '&SubUserTypeId=' + this.userRightFrm.value.subUserType;
    this.apiService.setHttp('GET', 'api/UserPages/GetByCriteria?' + str, false, false, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        this.ngxSpinner.hide()
        if (res.statusCode == 200) {
          this.tableDataArray = res.responseData.responseData1;
          this.tableDatasize = res.responseData.responseData2[0].pageCount;
        } else {
          this.tableDataArray = [];
          this.tableDatasize = 0;
        }
        this.getTableTranslatedData();
      },
      error: ((err: any) => { this.errors.handelError(err), this.ngxSpinner.hide(); })
    });

  }

  onSubmit() {
    this.pageNumber = 1;
    this.getUserRightPageList();
  }

  resetFilter(){
    this.assignUserRightsForm();
    this.pageNumber == 1;
    this.initialLoadFlag = true;
    this.DesignationLevelArr = [];
    this.DesignationArr = [];
  }

  childCompInfo(obj: any) {
    switch (obj.label) {
      case 'Pagination':
        this.pageNumber = obj.pageNumber;
        this.getUserRightPageList();
        break;
      case 'checkBox':
        let req = [{
          ...this.webStorage.createdByProps(),
          "id": obj.id,
          "userTypeId": this.userRightFrm.value.userType,
          "subUserTypeId": this.userRightFrm.value.subUserType,
          "readRight": obj?.readRight,
          "writeRight": obj?.writeRight,
          "pageId": obj.pageId
        }]
        this.apiService.setHttp('post', 'api/UserPages/AddRecord', false, req, false, 'baseUrl');
        this.apiService.getHttp().subscribe({
          next: ((res: any) => {
            if (res.statusCode == 200) {
              this.getUserRightPageList();
              this.commonMethods.snackBar(res.statusMessage, 0)
            } else {
              this.commonMethods.checkEmptyData(res.statusMessage) == false ? this.errors.handelError(res.statusCode) : this.commonMethods.snackBar(res.statusMessage, 1);
            }
          }),
          error: (error: any) => {
            this.commonMethods.checkEmptyData(error.statusText) == false ? this.errors.handelError(error.statusCode) : this.commonMethods.snackBar(error.statusMessage, 1);
          }
        })
        break;
    }
  }
}
