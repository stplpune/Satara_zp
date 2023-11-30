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
  baseUrl = "http://apisatara.shikshandarpan.com/"
  constructor(private apiService: ApiService,
    private http: HttpClient,
    private webstorageService: WebStorageService,
    private router: Router,
    private commonMethods: CommonMethodsService) { }

  getAllState(langFlag?: string) {
    return new Observable((obj: any) => {
      this.apiService.setHttp('GET', 'zp-satara/master/GetAllState?flag_lang=' + langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") { obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  getAllDistrict(langFlag?: string, stateId?: number) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-satara/master/GetAllDistrict?flag_lang=' + langFlag+'&StateId='+stateId, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") { obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  getAlllDistrict(langFlag?: string): Observable<any> {
    const URL = `${this.baseUrl}zp-satara/master/GetAllDistrict?flag_lang='${langFlag}`
    return this.http.get<any>(URL).pipe(map((resp: any) => resp.responseData));
  }


  getAllTaluka(langFlag?: string, districtId?: number) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-satara/master/GetAllTaluka?flag_lang=' + langFlag +'&DistrictId='+districtId, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") { obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  getAllVillageByTaluka(langFlag?: string, talukaId?: any) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-satara/master/GetAllVillageByTalukaId?flag_lang=' + langFlag + '&TalukaId=' + talukaId, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") {obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  getAllVillage(langFlag?: string, centerId?: any) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-satara/master/GetAllVillageByCenterId?flag_lang=' + langFlag + '&CenterId=' + centerId, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") { obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  getAllCenter(langFlag?: string, talukaId?: any) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-satara/master/GetAllCenterByTalukaId?flag_lang=' + langFlag + '&TalukaId=' + talukaId, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") { obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  getAllSchoolType(langFlag?: string) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-satara/master/GetAllSchoolType?flag_lang=' + langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") { obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  getAllSubject(langFlag?: string) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-satara/master/GetAllSubject?flag_lang=' + langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") { obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  GetAllSubjectsByGroupClassId(langFlag?: string, groupId?: any) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-satara/master/GetAllSubjectsByGroupClassId?flag_lang=' + langFlag + '&GroupClassId=' + groupId, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") { obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  getAllStandard(schoolId?: number, groupId?: number, langFlag?: string) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-satara/master/GetAllStandard?schoolId=' + schoolId + '&GroupId=' + groupId + '&flag_lang=' + langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") { obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  getClassWiseSubject(lan?: string) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-satara/Dashboard/GetDashboardCountClassWise?&lan=' + lan, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") { obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  getAllGroupClass(langFlag: string) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-satara/master/GetAllGroupClass?flag_lang=' + langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") { obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  getAllGender(langFlag: string) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-satara/master/GetAllGender?flag_lang=' + langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") { obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  getAllReligion(langFlag: string) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-satara/master/GetAllReligion?flag_lang=' + langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") { obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  GetAllCasteCategory(religionId?: number, langFlag?: string) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-satara/master/GetAllCasteCategory?ReligionId=' + religionId + '&flag_lang=' + langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") { obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  getAllSpecialization(langFlag: string) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-satara/master/GetAllSpecialization?flag_lang=' + langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") { obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }
  // http://apisatara.shikshandarpan.com/zp-satara/master/GetAllCaste?CategoryId=1&flag_lang=EN
  getAllCaste(casteCategoryId?: number, langFlag?: string) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-satara/master/GetAllCaste?CategoryId=' + casteCategoryId + '&flag_lang=' + langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") { obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  getRoleOfTeacher(langFlag: string) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-satara/master/GetRoleOfTeacher?flag_lang=' + langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") { obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }


  getTeacherBySchoolId(scoolId?: number, langFlag?: string){
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-satara/master/GetAllTeacherBySchoolId?SchoolId='+scoolId+'&flag_lang='+langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") { obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });

  }

  GetAllGraphLevel(langFlag?: string){
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-satara/master/GetAllGraphLevel?flag_lang='+langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") { obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }
  getAllUserType(langFlag: string) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-satara/master/GetAllUserType?flag_lang=' + langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") { obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  getAllSubUserTypeById(id: number) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-satara/master/GetAllSubUserByUserTypeId?UserTypeId=' + id, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") { obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }


  GetAllDesignationLevel(langFlag: string) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-satara/master/GetAllDesignationLevel?flag_lang=' + langFlag, false, false, false, 'baseUrl');
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
      this.apiService.setHttp('GET', 'zp-satara/master/GetDesignationByLevelId?DesignationLevelId=' + desigLevelId + '&flag_lang= ' + langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") { obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  GetSchoolCategoryDescById(langFlag: string) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-satara/master/GetSchoolCategoryDescById?flag_lang=' + langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") { obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  GetSchoolMngDescById(langFlag: string) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-satara/master/GetSchoolMngDescById?flag_lang=' + langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") { obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  getUniversityCategoryDescById(langFlag: string) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-satara/master/GetUniversityCategoryDescById?flag_lang=' + langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") { obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  getTwelveBranchCategoryDescById(langFlag: string) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-satara/master/GetTwelveBranchCategoryDescById?flag_lang=' + langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") { obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  getOptionalSubjectCategoryDescById(langFlag: string) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-satara/master/GetOptionalSubjectCategoryDescById?flag_lang=' + langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") { obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  getPayscaleCategoryDescById(langFlag: string) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-satara/master/GetPayscaleCategoryDescById?flag_lang=' + langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") { obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  getClusterCategoryDescById(langFlag: string) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-satara/master/GetClusterCategoryDescById?flag_lang=' + langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") { obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  getCastCategoryDescById(langFlag: string) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-satara/master/GetCastCategoryDescById?flag_lang=' + langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") { obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  getAllSchoolByCriteria(langFlag: string, TalukaId: number, VillageId: number, CenterId: number) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-satara/master/GetAllSchoolByCriteria?flag_lang=' + langFlag + '+&TalukaId=' + TalukaId + '&VillageId=' + VillageId + '&CenterId=' + CenterId + '', false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") { obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  getEducationalQualificationById(langFlag: string) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-satara/master/GetEducationalQualificationById?flag_lang=' + langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") { obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }


  getProfessinalQualificationById(langFlag: string) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-satara/master/GetProfessinalQualificationById?flag_lang=' + langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") { obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  getAllInterDistrictTransferType(langFlag: string) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-satara/master/GetAllInterDistrictTransferType?flag_lang=' + langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") { obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  getAllSchoolsByCenterId(langFlag?: string, CenterId?: number, TalukaId?: number) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-satara/master/GetAllSchoolsByCenterId?flag_lang=' + langFlag + '&CenterId=' + CenterId + '&TalukaId=' + TalukaId, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") { obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }


  GetStandardBySchool(schoolId: number, langFlag: string) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-satara/master/GetAllStandard?SchoolId=' + schoolId + '&lan=' + langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") { obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }



  GetDesignationLevel(langFlag: string) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-satara/master/GetDesignationLevel?flag_lang=' + langFlag, false, false, false, 'baseUrl');
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
      this.apiService.setHttp('GET', 'zp-satara/master/GetAllAgencyRegistration?flag_lang=' + langFlag, false, false, false, 'baseUrl');
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
      this.apiService.setHttp('GET', 'zp-satara/master/GetBit?TalukaId=' + talukaId + '&flag_lang=' + langFlag, false, false, false, 'baseUrl');
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

  GetAllSchoolsByTalukaAndCenterId(langFlag?: string, centerId?: number, talukaId?: number) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-satara/master/GetAllSchoolsByTalukaAndCenterId?flag_lang=' + langFlag + '&CenterId=' + centerId + '&TalukaId=' + talukaId, false, false, false, 'baseUrl');
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
      this.apiService.setHttp('GET', 'zp-satara/master/GetAllStudentGender?flag_lang=' + langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") { obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  getAcademicYears(langFlag?: string) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-satara/master/GetEductionYearMaster?flag_lang=' + langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") { obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  getExamType(langFlag?: string) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-satara/master/GetAllExamType?flag_lang=' + langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") { obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  getAllQuestionType(langFlag?: string) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-satara/master/GetAllQuestionType?flag_lang=' + langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") { obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  getAssementType(langFlag?: string) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-satara/master/GetAssessmentTypeMaster?flag_lang=' + langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") { obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  getServerDateTime() {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-satara/user-registration/GetCurrentDateTime', false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") { obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  GetAllStandardClassWise(langFlag?: string) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-satara/master/GetAllStandardClassWise?flag_lang=' + langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") { obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  GetAllAssetCategory(langFlag?: string) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-satara/master/GetAllAssetCategory?flag_lang=' + langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") { obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  GetAssetSubCateByCateId(categoryId: number, langFlag: string) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-satara/master/GetAllAssetSubCategory?CategoryId=' + categoryId + '&flag_lang=' + langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") { obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  GetAllAssetType(subCategoryId: number, langFlag: string) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-satara/master/GetAllAssetType?SubCategoryId=' + subCategoryId + '&flag_lang=' + langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") { obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  GetAllItem(subCategoryId: number, langFlag: string) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-satara/master/GetAllItem?SubCategoryId=' + subCategoryId + '&flag_lang=' + langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") { obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  GetAllOpeningQty(schoolId: number, categoryId: number, subCategoryId: number, itemId: number, langFlag: string) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-satara/ItemMaster/GetOpeningQty?SchoolId=' + schoolId + '&CategoryId=' + categoryId + '&SubCategoryId=' + subCategoryId + '&ItemId=' + itemId + '&lan=' + langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") { obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }


  refreshTokenJWT(obj: any) {
    this.apiService.setHttp('POST', 'zp-satara/user-registration/refresh-token', false, obj, false, 'baseUrl');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          let loginObj: any = this.webstorageService.getLoggedInLocalstorageData();
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

  GetOptionListByGroupSubject(groupId?: number, subId?: number, questionId?: number, langFlag?: any) {
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-satara/master/GetOptionListByGroupSubject?GroupId=' + groupId + '&AssessmentSubjectId=' + subId + '&QuestionId=' + questionId + '&flag_lang=' + langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") { obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }
  
  getCCTVLocation(langFlag?: string) {   
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-satara/master/GetAllCCTVLocation?flag_lang=' + langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") { obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  getCCTVType(langFlag?: string) {   
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-satara/master/GetAllCCTVType?flag_lang=' + langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") { obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }

  GetAllExamTypeCriteria(StandardId?: any,  SubjectId?: any, langFlag?: string){
    return new Observable((obj) => {
      this.apiService.setHttp('GET', 'zp-satara/master/GetQuestionListByStandardSubject?StandardId=' + StandardId + '&SubjectId=' + SubjectId + '&flag_lang=' + langFlag, false, false, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode == "200") { obj.next(res) } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }




}
