import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AddItemComponent } from './add-item/add-item.component';

@Component({
  selector: 'app-item-registration',
  templateUrl: './item-registration.component.html',
  styleUrls: ['./item-registration.component.scss']
})
export class ItemRegistrationComponent {
  
  viewStatus="Table";
  cardViewFlag: boolean = false;
  filterForm!: FormGroup;
  constructor (private fb: FormBuilder,
    public dialog: MatDialog){}

  filterFormData() {
    this.filterForm = this.fb.group({
      CategoryId: [''],
      SubCategoryId: [''],
      villageId:[''],
      ItemsId: [''],
      textSearch: ['']
    })
  }
  openDialog() {
    const dialogRef = this.dialog.open(AddItemComponent,
      {
        width: '500px',
        disableClose: true,
        autoFocus: false
      });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }
}

