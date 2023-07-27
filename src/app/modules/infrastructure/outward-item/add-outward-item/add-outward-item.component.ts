import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-add-outward-item',
  templateUrl: './add-outward-item.component.html',
  styleUrls: ['./add-outward-item.component.scss']
})
export class AddOutwardItemComponent {
  uploadImg: string = '';
  itemForm!: FormGroup;
  editFlag: boolean = false;
  editObj: any;
}
