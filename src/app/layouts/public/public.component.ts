import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-public',
  templateUrl: './public.component.html',
  styleUrls: ['./public.component.scss']
})
export class PublicComponent {
  // curtainFlag: boolean = true;

  isShow: boolean | undefined;
  topPosToStartShowing = 100;
  constructor(public router: Router) { }
  @HostListener('window:scroll')

  checkScroll() {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    if (scrollPosition >= this.topPosToStartShowing) {
      this.isShow = true;
    } else {
      this.isShow = false;
    }
  }
  gotoTop() {
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }
  // selCheckBox(event: any) {
  //   if (!event?.target.checked) {
  //     setTimeout(() => {
  //       this.curtainFlag = event?.target.checked;
  //     }, 10000);
  //   }
  // }
}
