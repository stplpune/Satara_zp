import { Component, HostListener } from '@angular/core';
@Component({
  selector: 'app-web-header',
  templateUrl: './web-header.component.html',
  styleUrls: ['./web-header.component.scss']
})
export class WebHeaderComponent {
  @HostListener('window:scroll', ['$event'])

  ngOnInit(){
    window.addEventListener('scroll', this.scroll, true)
  }
  scroll = (): void => {
     if(window.scrollY >= 100){ // scroll height gretaer than  
       document.body.style.setProperty('--navbar-scroll', "#276bc6");

     }else if(window.scrollY < 100){
       document.body.style.setProperty('--navbar-scroll', "transparent");
     }
   }

}
