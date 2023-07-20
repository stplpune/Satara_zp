import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { map, Observable } from 'rxjs';
import { ApiService } from './api.service';
import { CommonMethodsService } from './common-methods.service';
import { WebStorageService } from './web-storage.service';

@Injectable({
  providedIn: 'root'
})
export class MasterService {
  baseUrl =  "https://zposmservices.mahamining.com/"
  constructor(private apiService: ApiService,
              private http: HttpClient,
              private webstorageService: WebStorageService,
              private router: Router,
              private commonMethods: CommonMethodsService) { }

  getAllState(langFlag?: string) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-osmanabad/master/GetAllState?flag_lang=' + langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") {obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  getAllDistrict(langFlag?: string) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-osmanabad/master/GetAllDistrict?flag_lang=' + langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") { obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  getAlllDistrict(langFlag?: string) : Observable<any> {
    const URL = `${this.baseUrl}zp-osmanabad/master/GetAllDistrict?flag_lang='${langFlag}`
    return this.http.get<any>(URL).pipe(map((resp: any) => resp.responseData));
  }


  getAllTaluka(langFlag?: string) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-osmanabad/master/GetAllTaluka?flag_lang=' + langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") { obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  getAllVillage(langFlag?: string, talukaId?: any) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-osmanabad/master/GetAllVillageByTalukaId?flag_lang=' + langFlag + '&TalukaId=' + talukaId, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") {obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  getAllCenter(langFlag?: string, talukaId?: any) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-osmanabad/master/GetAllCenterByTalukaId?flag_lang=' + langFlag+'&TalukaId='+talukaId, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") {obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  getAllSchoolType(langFlag?: string) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-osmanabad/master/GetAllSchoolType?flag_lang=' + langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") {obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  getAllSubject(langFlag?: string) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-osmanabad/master/GetAllSubject?flag_lang=' + langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") {obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

    GetAllSubjectsByGroupClassId(langFlag?: string, groupId?:any) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-osmanabad/master/GetAllSubjectsByGroupClassId?flag_lang=' + langFlag+'&GroupClassId='+ groupId , false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") {obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  getAllStandard(schoolId?: number, groupId?:number,langFlag?: string) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-osmanabad/master/GetAllStandard?schoolId='+schoolId+'&GroupId='+groupId+'&flag_lang=' + langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") {obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  getClassWiseSubject(lan?: string) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-osmanabad/Dashboard/GetDashboardCountClassWise?&lan='+ lan, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") {obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }  

  getAllGroupClass(langFlag: string) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-osmanabad/master/GetAllGroupClass?flag_lang=' + langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") {obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  getAllGender(langFlag: string) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-osmanabad/master/GetAllGender?flag_lang=' + langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") {obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  getAllReligion(langFlag: string) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-osmanabad/master/GetAllReligion?flag_lang=' + langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") {obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  getAllSpecialization(langFlag: string) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-osmanabad/master/GetAllSpecialization?flag_lang=' + langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") {obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  getAllCaste(langFlag: string, religionId: number) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-osmanabad/master/GetAllCaste?flag_lang='+langFlag+'&ReligionId='+religionId, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") {obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  getRoleOfTeacher(langFlag: string) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-osmanabad/master/GetRoleOfTeacher?flag_lang=' + langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") {obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  getAllUserType(langFlag: string) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-osmanabad/master/GetAllUserType?flag_lang=' + langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") {obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  getAllSubUserTypeById(id: number) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-osmanabad/master/GetAllSubUserByUserTypeId?UserTypeId=' + id, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") {obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }


  GetAllDesignationLevel(langFlag: string) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-osmanabad/master/GetAllDesignationLevel?flag_lang='+ langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => {
          if (res.statusCode == "200") {
            obj.next(res)
          } else { obj.error(res); }
        },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  GetDesignationByLevelId(langFlag: string, desigLevelId: number) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-osmanabad/master/GetDesignationByLevelId?DesignationLevelId='+desigLevelId+'&flag_lang= '+langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") {obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  GetSchoolCategoryDescById(langFlag: string) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-osmanabad/master/GetSchoolCategoryDescById?flag_lang=' + langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") {obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  GetSchoolMngDescById(langFlag: string) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-osmanabad/master/GetSchoolMngDescById?flag_lang=' + langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") {obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  getUniversityCategoryDescById(langFlag: string){
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-osmanabad/master/GetUniversityCategoryDescById?flag_lang=' + langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") {obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  getTwelveBranchCategoryDescById(langFlag: string){
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-osmanabad/master/GetTwelveBranchCategoryDescById?flag_lang=' + langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") {obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  getOptionalSubjectCategoryDescById(langFlag: string){
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-osmanabad/master/GetOptionalSubjectCategoryDescById?flag_lang=' + langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") {obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  getPayscaleCategoryDescById(langFlag: string){
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-osmanabad/master/GetPayscaleCategoryDescById?flag_lang=' + langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") {obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  getClusterCategoryDescById(langFlag: string){
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-osmanabad/master/GetClusterCategoryDescById?flag_lang=' + langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") {obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  getCastCategoryDescById(langFlag: string){
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-osmanabad/master/GetCastCategoryDescById?flag_lang=' + langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") {obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  getAllSchoolByCriteria(langFlag: string, TalukaId: number, VillageId: number, CenterId: number  ){
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-osmanabad/master/GetAllSchoolByCriteria?flag_lang='+langFlag+'+&TalukaId='+TalukaId+'&VillageId='+VillageId+'&CenterId='+CenterId+'', false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") {obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  getEducationalQualificationById(langFlag: string){
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-osmanabad/master/GetEducationalQualificationById?flag_lang=' +langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") {obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  
  getProfessinalQualificationById(langFlag: string){
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-osmanabad/master/GetProfessinalQualificationById?flag_lang=' +langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") {obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  getAllInterDistrictTransferType(langFlag: string){
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-osmanabad/master/GetAllInterDistrictTransferType?flag_lang=' +langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") {obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  getAllSchoolsByCenterId(langFlag?: string, CenterId?: number, TalukaId?:number){
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-osmanabad/master/GetAllSchoolsByCenterId?flag_lang='+langFlag+'&CenterId='+CenterId+'&TalukaId='+TalukaId, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") {obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }


  GetStandardBySchool(schoolId: number, langFlag: string){
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-osmanabad/master/GetAllStandard?SchoolId='+schoolId+'&lan='+langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") {obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  
   
  GetDesignationLevel(langFlag: string) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-osmanabad/master/GetDesignationLevel?flag_lang='+ langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => {
          if (res.statusCode == "200") {
            obj.next(res)
          } else { obj.error(res); }
        },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  GetAllAgencyRegistration(langFlag: string) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-osmanabad/master/GetAllAgencyRegistration?flag_lang='+ langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => {
          if (res.statusCode == "200") {
            obj.next(res)
          } else { obj.error(res); }
        },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  GetBit(langFlag?: string, talukaId?: number) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-osmanabad/master/GetBit?TalukaId='+talukaId+'&flag_lang='+ langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => {
          if (res.statusCode == "200") {
            obj.next(res)
          } else { obj.error(res); }
        },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  GetAllSchoolsByTalukaAndCenterId(langFlag?: string, centerId?: number, talukaId?: number){ 
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-osmanabad/master/GetAllSchoolsByTalukaAndCenterId?flag_lang='+langFlag+'&CenterId='+ centerId+'&TalukaId='+talukaId, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => {
          if (res.statusCode == "200") {
            obj.next(res)
          } else { obj.error(res); }
        },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  getAllStudentGender(langFlag: string) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-osmanabad/master/GetAllStudentGender?flag_lang=' + langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") {obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  getAcademicYears(langFlag?: string) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-osmanabad/master/GetEductionYearMaster?flag_lang=' + langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") {obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  getExamType(langFlag?: string) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-osmanabad/master/GetAllExamType?flag_lang=' + langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") {obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  getAssementType(langFlag?: string) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-osmanabad/master/GetAssessmentTypeMaster?flag_lang=' + langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") {obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  getServerDateTime() {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp_osmanabad/user-registration/GetCurrentDateTime', false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") { obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  GetAllStandardClassWise(langFlag?: string) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-osmanabad/master/GetAllStandardClassWise?flag_lang=' + langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") { obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }


  refreshTokenJWT(obj: any) {
    this.apiService.setHttp('POST', 'zp_osmanabad/user-registration/refresh-token', false, obj, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          let loginObj:any = this.webstorageService.getLoggedInLocalstorageData();
          loginObj = res.responseData;
          // this.encryptInfo = encodeURIComponent(());
          localStorage.setItem('loggedInTokenData', JSON.stringify(loginObj));
          // window.location.reload();
        } else { 
          localStorage.removeItem('loggedInData');
          localStorage.removeItem('loggedInTokenData');

          this.router.navigate(['/login']);
          this.commonMethods.snackBar('Your Session Has Expired. Please Re-Login Again.', 1);
        }
      },
      error: () => { 
        localStorage.removeItem('loggedInData');
        localStorage.removeItem('loggedInTokenData');
        this.router.navigate(['/login']);
        this.commonMethods.snackBar('Your Session Has Expired. Please Re Login Again.', 1);
       }
    });
  }

  GetOptionListByGroupSubject(groupId?: number,subId?: number, langFlag?: any) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-osmanabad/master/GetOptionListByGroupSubject?GroupId='+groupId+'&AssessmentSubjectId='+ subId+'&flag_lang=' + langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") { obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }






}
