import { Injectable } from '@angular/core';
import {  CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { WebStorageService } from 'src/app/core/services/web-storage.service';

@Injectable({
  providedIn: 'root'
})
export class CheckLoggedInGuard implements CanActivate {
  constructor(private WebStorageService: WebStorageService, private router: Router){

  }
 
  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree|any {
      if (this.WebStorageService.checkUserIsLoggedIn()) {
        this.router.navigate(['/dashboard']);
      } else {
        return true;
      }
  }
  
}
