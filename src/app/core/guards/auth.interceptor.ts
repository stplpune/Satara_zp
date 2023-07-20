import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,

} from '@angular/common/http';
import { Observable } from 'rxjs';
import { CommonMethodsService } from '../services/common-methods.service';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { WebStorageService } from '../services/web-storage.service';
import { MasterService } from '../services/master.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  currentDateTime: any;

  constructor(private masterService: MasterService,
    private webstorageService: WebStorageService,
    private router: Router,
    private commonMethods: CommonMethodsService) {
      window.addEventListener('load', (_event:any) => {
        this.callDateTimeApi();
    });

    if (this.webstorageService.checkUserIsLoggedIn()) {
      this.router.events.subscribe((event: any) => {
        if (event instanceof (NavigationEnd || NavigationStart)) {
          this.callDateTimeApi();
        }
      });
    }
  }

  callDateTimeApi(){
    this.masterService.getServerDateTime().subscribe((resp: any) => {
      if (resp.statusCode == 200) {
        this.currentDateTime = (Math.round(new Date(resp.responseData).getTime() / 1000)); //serverzTime
        let localStorageData = (this.webstorageService.getLoggedInTokendata());  //              
        let expireAccessToken: any = (Math.round(new Date(localStorageData?.expireAccessToken).getTime() / 1000)); //3 logintokentime
        let tokenExpireDateTime: any = (Math.round(new Date(localStorageData?.refreshToken.expireAt).getTime() / 1000)); //5 loginexpiretokentime
        if (this.currentDateTime >= expireAccessToken) { //4 >= 3
          if (this.currentDateTime <= tokenExpireDateTime) { //4 <= 5
            let obj = {
              refreshToken: this.webstorageService.getLoggedInTokendata()?.refreshToken?.tokenString,
              userId: this.webstorageService.getUserId()
            }
            this.masterService.refreshTokenJWT(obj);
          }
          else {
            localStorage.removeItem('loggedInData');
            this.router.navigate(['/login']);
            this.commonMethods.snackBar('Your Session Has Expired. Please Re-Login Again.', 1);
          }
        } 
      }
    })
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!this.webstorageService.checkUserIsLoggedIn()) {
      return next.handle(request);
    } else {
      let logInData = this.webstorageService.getLoggedInTokendata()
      const authHeader = logInData.accessToken
      const authReq = request.clone({ headers: request.headers.set('Authorization', 'Bearer ' + authHeader) });
      return next.handle(authReq)
    }
  }
}
