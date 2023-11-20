import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-add-assessment-configuration',
  templateUrl: './add-assessment-configuration.component.html',
  styleUrls: ['./add-assessment-configuration.component.scss']
})
export class AddAssessmentConfigurationComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,){}
}
