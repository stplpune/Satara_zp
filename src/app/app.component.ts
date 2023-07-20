import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { environment } from 'src/environments/environment';
import { WebStorageService } from './core/services/web-storage.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'zilla Parishad Satara';
  langTypeName: any;
  classname: any;
  constructor(private router: Router,
    private titleService: Title,
    private dialog: MatDialog, 
    private activatedRoute: ActivatedRoute,
    private webStorage: WebStorageService) {
    this.checkBaseUrl();
    // this.setTitle();
  }

  ngOnInit() {
    this.webStorage.getTheme().subscribe((res: any) => {
      this.classname = res;
    });
    
    this.webStorage.langNameOnChange.subscribe(lang => {
      this.langTypeName = lang;
      this.setTitle();
    });

    // code for logout from all login tab
    window.addEventListener('storage', (event) => {
      if (event.storageArea == localStorage) {
        let loggedInData = localStorage.getItem('loggedInData');
        if(loggedInData == undefined) {
          this.dialog.closeAll();
          this.router.navigate(['/home']);
        }
      }
    }, false);

    if (environment.production) { // redirect
      if (location.protocol === 'http:') {
        window.location.href = location.href.replace('http', 'https');
      }
    }
  }

  checkBaseUrl() {//If base url is log in hide header and footer
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        window.scroll(0, 0);
      }
    });
  }

  setTitle() {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd),  // set title dynamic
    ).subscribe(() => {
      var rt = this.getChild(this.activatedRoute);
      if(rt?.data._value.breadcrumb){
        let titleName = rt?.data._value?.breadcrumb[rt.data?._value?.breadcrumb?.length - 1]?.title;
        // let m_tile =  rt?.data._value?.breadcrumb[rt.data?._value?.breadcrumb?.length - 1]?.m_title
        rt.data.subscribe(() => {
          this.titleService.setTitle(titleName);
        })
      }
    
    });
  }

  getChild(activatedRoute: ActivatedRoute): any {
    if (activatedRoute.firstChild) {
      return this.getChild(activatedRoute.firstChild);
    } else {
      return activatedRoute;
    }
  }


}
