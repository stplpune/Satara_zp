import { Component } from '@angular/core';
import { WebStorageService } from '../services/web-storage.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  loginPages = new Array();
  selectedPageId!: number;
  constructor(public WebStorageService: WebStorageService, private router: Router) {
    let data: any = this.WebStorageService.getAllPageName();
    this.sideBarMenu(data);
  }

  sideBarMenu(data: []) {
    this.loginPages = [];
    let items: any = data.filter((ele: any) => {
      if (ele.isSideBarMenu == true) {
        return ele;
      }
    })
    items.forEach((item: any) => {
      let existing: any = this.loginPages.filter((v: any) => {
        return v.pageNameView == item.pageNameView;
      });
      if (existing.length) {
        let existingIndex: any = this.loginPages.indexOf(existing[0]);
        this.loginPages[existingIndex].pageURL = this.loginPages[existingIndex].pageURL.concat(item.pageURL);
        this.loginPages[existingIndex].pageName = this.loginPages[existingIndex].pageName.concat(item.pageName);
        this.loginPages[existingIndex].m_PageName = this.loginPages[existingIndex].m_PageName.concat(item.m_PageName);
        this.loginPages[existingIndex].isCollapsed = false;
      } else {
        if (typeof item.pageName == 'string')
          item.pageURL = [item.pageURL];
        item.pageName = [item.pageName];
        item.m_PageName = [item.m_PageName];
        item.isCollapsed = false;
        this.loginPages.push(item);
      }
    });
    this.loginPages.filter((x: any) => {
      var path = this.router?.url?.split('/')[1];
      if(x.pageURL.includes(path)){
        x.isCollapsed = true;
      }else{
        let data1: any = this.WebStorageService?.getAllPageName();
        data1.filter((d: any) => {
          (d.pageURL == path && d.pageNameView == x.pageNameView) ? x.isCollapsed = true : '';
        })
      }
    })     
  }

    //************************************ Sidebar SubMenu Function - Start Here **********************/
    sidebarMenuClick(id: any, rowCtrl: any){
      this.loginPages.forEach((item: any) => {
        if(item.pageId === id){
          rowCtrl == true ? item.isCollapsed = true : item.isCollapsed = false;
        }else{
          item.isCollapsed = false
        }
      });    
    }
    //************************************ Sidebar SubMenu Function - End Here **********************/
  
  
  closeSidebar() {
    this.WebStorageService.setSidebarState(!this.WebStorageService.getSidebarState());

  }

  getSideBarState() {
    return this.WebStorageService.getSidebarState();
  }
}
