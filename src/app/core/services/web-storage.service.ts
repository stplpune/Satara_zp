import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
// import * as CryptoJS from 'crypto-js';
@Injectable({
  providedIn: 'root'
})
export class WebStorageService {
  languageFlag = 'EN';
  language = new BehaviorSubject('');
  selectedBarchartObjData = new BehaviorSubject('');
  selectedLineChartObj = new BehaviorSubject('');
  langNameOnChange = this.language.asObservable();
  private theme = new BehaviorSubject('');
  studentDetailsforChart = new Array();
  classWiseDataStudentAssList: any;
  piDetails: any;
  questionArray: any;
  studentDetails: any; //
  numFormat: any;
  baseWiseDataStudentAssList: any;
  inspectionByValue: any;
  baseInfectctId: any;
  toggled: boolean = false;
  selectedTheme = 'light';

  constructor() { }

  getTheme() {
    return this.theme.asObservable();
  }
  setTheme(className: any) {
    this.theme.next(className);
    this.selectedTheme = className == 'lightMode' ? 'light' : 'dark';
  }

  setLanguage(lang: any) {
    this.language.next(lang);
    lang == 'English' ? this.languageFlag = 'EN' : this.languageFlag = 'mr-IN';
    this.numFormat = lang == 'Marathi' ? 'mr-IN' : 'en-IN';
  }

  getLangauge() {
    return this.languageFlag;
  }

  getSidebarState() {
    return this.toggled;
  }

  setSidebarState(state: boolean) {
    this.toggled = state;
  }



  checkUserIsLoggedIn() { // check user isLoggedIn or not
    // let sessionData: any = sessionStorage.getItem('loggedIn');
    // sessionData == null || sessionData == '' ? localStorage.clear() : '';
    // if (localStorage.getItem('loggedInData') && sessionData == 'true')
    if (localStorage.getItem('loggedInData'))
      return true;
    else return false;
  }

  getLoggedInLocalstorageData() {
    if (this.checkUserIsLoggedIn() == true) {
      let data = JSON.parse(localStorage['loggedInData']);
      return data;
    }

    // let localData = localStorage['loggedInData'];
    // let deData =  CryptoJS.AES.decrypt(decodeURIComponent(localData),'secret key 123').toString(CryptoJS.enc.Utf8);
    //  return JSON.parse(deData);
  }

  getLoggedInTokendata() {
    if (this.checkUserIsLoggedIn() == true) {
      let data = JSON.parse(localStorage['loggedInTokenData']);
      return data;
    }


    // let localData = localStorage['loggedInTokenData'];
    // let deData =  CryptoJS.AES.decrypt(decodeURIComponent(localData),'secret key 123').toString(CryptoJS.enc.Utf8);
    //  return JSON.parse(deData);

  }

  getUserId() {
    let data = this.getLoggedInLocalstorageData();
    return data.id;
  }

  getUserTypeId() {
    let data = this.getLoggedInLocalstorageData();
    return data.userTypeId;
  }

  getUserSubTypeId() {
    let data = this.getLoggedInLocalstorageData();
    return data.subUserTypeId;
  }

  getState(){
    let data = this.getLoggedInLocalstorageData();
    return data.stateId || 0;
  }

  getDistrict(){
    let data = this.getLoggedInLocalstorageData();
    return data.districtId || 0;
  }
  getTaluka(){
    let data = this.getLoggedInLocalstorageData();
    return data.talukaId || 0;
  }


  getYearId(){
    let data = this.getLoggedInLocalstorageData();
    return data.educationYearId || 0;
  }
  createdByProps(): any {
    return {
      "createdBy": this.getUserId() || 0,
      "modifiedBy": this.getUserId() || 0,
      "createdDate": new Date(),
      "modifiedDate": new Date(),
      "isDeleted": true
    }
  }

  numberTransformFunction(value: any) {
    let number = new Intl.NumberFormat(this.numFormat).format(value);
    return number
  }

  getAllPageName() {
    if (this.checkUserIsLoggedIn() == true) {
      let getAllPageName: any = this.getLoggedInLocalstorageData();
      return getAllPageName.pageLstModels;
    }
  }
}
