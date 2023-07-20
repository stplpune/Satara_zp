import { Component } from '@angular/core';

@Component({
  selector: 'app-web-footer',
  templateUrl: './web-footer.component.html',
  styleUrls: ['./web-footer.component.scss']
})
export class WebFooterComponent {
  currentYear: any;
  ngOnInit(){
    this.currentYear = (new Date()).getFullYear();    
  }
}
