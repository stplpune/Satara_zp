import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-add-tasksheet',
  templateUrl: './add-tasksheet.component.html',
  styleUrls: ['./add-tasksheet.component.scss']
})
export class AddTasksheetComponent {
  editFlag:any;
  eventForm !: FormGroup;
}
