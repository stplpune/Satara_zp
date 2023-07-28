import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-add-inward-item',
  templateUrl: './add-inward-item.component.html',
  styleUrls: ['./add-inward-item.component.scss']
})
export class AddInwardItemComponent {
  uploadImg: string = '';
  itemForm!: FormGroup;
  editFlag: boolean = false;
  editObj: any;
}
