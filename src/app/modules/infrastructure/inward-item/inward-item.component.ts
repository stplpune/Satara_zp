import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AddInwardItemComponent } from './add-inward-item/add-inward-item.component';

@Component({
  selector: 'app-parameter',
  templateUrl: './inward-item.component.html',
  styleUrls: ['./inward-item.component.scss']
})
export class InwardItemComponent {
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
      const dialogRef = this.dialog.open(AddInwardItemComponent,
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
  
