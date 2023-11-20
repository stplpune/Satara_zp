import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddAssessmentConfigurationComponent } from './add-assessment-configuration/add-assessment-configuration.component';

@Component({
  selector: 'app-assessment-configuration',
  templateUrl: './assessment-configuration.component.html',
  styleUrls: ['./assessment-configuration.component.scss']
})
export class AssessmentConfigurationComponent {
  displayedColumns: string[] = ['position', 'name', 'QuestionType', 'AssementType','EducationalYear','Action'];
  dataSource = ELEMENT_DATA;

  constructor(public dialog: MatDialog) {}

  openDialog() {
    const dialogRef = this.dialog.open(AddAssessmentConfigurationComponent,{
      width: '600px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }
}
  export interface PeriodicElement {
    name: any;
    position: any;
    QuestionType: any;
    AssementType: any;
    EducationalYear:any;
    Action:any;
  }
  
  const ELEMENT_DATA: PeriodicElement[] = [
    {position:1, name:'1st - 2nd',QuestionType:'Single Select',AssementType:'BaseWise',EducationalYear:'2022-2023',Action:''},
    {position:2, name:'1st - 2nd',QuestionType:'Single Select',AssementType:'BaseWise',EducationalYear:'2022-2023',Action:''},
    {position:3, name:'1st - 2nd',QuestionType:'Single Select',AssementType:'BaseWise',EducationalYear:'2022-2023',Action:''},
    {position:4, name:'1st - 2nd',QuestionType:'Single Select',AssementType:'BaseWise',EducationalYear:'2022-2023',Action:''},
    {position:5, name:'1st - 2nd',QuestionType:'Single Select',AssementType:'BaseWise',EducationalYear:'2022-2023',Action:''},
  ];
