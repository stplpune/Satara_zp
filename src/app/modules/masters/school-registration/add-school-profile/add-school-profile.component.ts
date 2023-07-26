import { Component } from '@angular/core';
import { WebStorageService } from 'src/app/core/services/web-storage.service';


@Component({
  selector: 'app-add-school-profile',
  templateUrl: './add-school-profile.component.html',
  styleUrls: ['./add-school-profile.component.scss']
})
export class AddSchoolProfileComponent {
  viewStatus='Table';
  displayedColumns: string[] = ['position', 'name', 'TeacherName', 'EmailID','MobileNo','Desgination'];
  dataSource = ELEMENT_DATA;
  items: any = [];
  dataArray = new Array();
  objData: any;
  showImg!: boolean;
  languageFlag: any;

  constructor(public webStorage:WebStorageService){

  }
 
}

export interface PeriodicElement {
  name: string;
  position: number;
  TeacherName:any;
  EmailID:any;
  MobileNo:any;
  Desgination:any;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: '', TeacherName:'yuvraj sir',EmailID:'abvbsd@gmail.com',MobileNo:'258222588',Desgination:'Principle',},
  {position: 2, name: '', TeacherName:'Patil sir',EmailID:'',MobileNo:'44455400075',Desgination:'Teacher',},
  {position: 3, name: '', TeacherName:'dr.pradip',EmailID:'',MobileNo:'2252005',Desgination:'Student',},
  {position: 4, name: '', TeacherName:'amol sir',EmailID:'',MobileNo:'225225252005',Desgination:'',},
  {position: 5, name: '', TeacherName:'sachin sir',EmailID:'',MobileNo:'25255533350',Desgination:'',},
];
