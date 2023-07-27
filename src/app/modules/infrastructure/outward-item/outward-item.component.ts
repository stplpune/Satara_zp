import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AddOutwardItemComponent } from './add-outward-item/add-outward-item.component';

@Component({
  selector: 'app-item-transfer',
  templateUrl: './outward-item.component.html',
  styleUrls: ['./outward-item.component.scss']
})
export class OutwardItemComponent {
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
      const dialogRef = this.dialog.open(AddOutwardItemComponent,
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
  
