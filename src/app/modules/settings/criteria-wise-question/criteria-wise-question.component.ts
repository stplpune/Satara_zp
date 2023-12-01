import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddCriteriaWiseQuestionComponent } from './add-criteria-wise-question/add-criteria-wise-question.component';

@Component({
  selector: 'app-criteria-wise-question',
  templateUrl: './criteria-wise-question.component.html',
  styleUrls: ['./criteria-wise-question.component.scss']
})
export class CriteriaWiseQuestionComponent {
  constructor(public dialog: MatDialog) {}
  openDialog() {
    const dialogRef = this.dialog.open(AddCriteriaWiseQuestionComponent,{
      width: '700px',
      disableClose:true,
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

}
