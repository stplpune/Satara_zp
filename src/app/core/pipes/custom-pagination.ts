import { Injectable } from "@angular/core";
import { MatPaginatorIntl } from "@angular/material/paginator";
import { WebStorageService } from "../services/web-storage.service";

@Injectable({
  providedIn: "root"
})

export class CustomMatPaginatorIntl extends MatPaginatorIntl{
  ofKeyValue: any;

  constructor(private webStorage: WebStorageService){
    super();
    this.webStorage.langNameOnChange.subscribe(lang => {
      this.nextPageLabel = lang == 'English' ? 'Next Page' : 'पुढील पान';
      this.previousPageLabel = lang == 'English' ? 'Previous Page' : 'मागील पान';
      this.lastPageLabel = lang == 'English' ? 'Last Page' : 'शेवटचे पान';
      this.firstPageLabel = lang == 'English' ? 'First Page' : 'पहिले पान';
      this.ofKeyValue = lang == 'English' ? 'of' : 'मधील';
      this.getRangeLabel = this.RangeLabel;
      this.changes.next();
    });
  }

  RangeLabel = (page: number, pageSize: number, length: number) => {
    if (length == 0 || pageSize == 0) {
      return `0 ${this.ofKeyValue} ${length}`;
    }
  
    length = Math.max(length, 0);
  
    const startIndex = page * pageSize;
  
    // If the start index exceeds the list length, do not try and fix the end index to the end.
    const endIndex =
      startIndex < length
        ? Math.min(startIndex + pageSize, length)
        : startIndex + pageSize;
   let mar = `${this.webStorage.numberTransformFunction(length)} ${this.ofKeyValue} ${this.webStorage.numberTransformFunction(startIndex + 1)} - ${this.webStorage.numberTransformFunction(endIndex)}`;
   let eng = `${this.webStorage.numberTransformFunction(startIndex + 1)} - ${this.webStorage.numberTransformFunction(endIndex)} ${this.ofKeyValue} ${this.webStorage.numberTransformFunction(length)}`
    // return `${this.webStorage.numberTransformFunction(length)} ${this.ofKeyValue} ${this.webStorage.numberTransformFunction(startIndex + 1)} - ${this.webStorage.numberTransformFunction(endIndex)}`;
    return  this.webStorage.languageFlag=='EN'  ? eng : mar  ;
  };

}