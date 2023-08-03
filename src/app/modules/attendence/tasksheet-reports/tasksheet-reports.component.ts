import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tasksheet-reports',
  templateUrl: './tasksheet-reports.component.html',
  styleUrls: ['./tasksheet-reports.component.scss']
})
export class TasksheetReportsComponent {
  viewStatus='Table';

  constructor(private router: Router){

  }

  ngOnInit(){
  }

  navigateToReport(){
    this.router.navigate(['/teacher-tasksheet']);
  }
}
