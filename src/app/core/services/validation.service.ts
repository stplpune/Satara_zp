import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  constructor() { }
  name = ('^[a-zA-Z]+$');
  fullName = ('^[a-zA-Z][a-zA-Z ]*$');
  email = ('^[a-zA-Z0-9._]+@([a-z0-9.]+[.])+[a-z]{2,5}$');
  email1 = ('^[a-zA-Z0-9._]+@([a-z]+[.])+[a-z]{1,5}$');
  mobile_No = ('[6-9]\\d{9}');
  age = ('[0-9]{2,}|[5-9]{1}$');
  aadhar_card = ('^[2-9][0-9]{11}$');
  valPassword = '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,10}$';
  alphaNumericOnly = '^([ a-zA-Z])[- a-zA-Z0-9]+$';   //Valid - Manager 1, Manager / Invalid - 9865232     
  alphanumericMarathi = '^[\u0900-\u096F ]+$';
  valLandlineNo = '(([+][(]?[0-9]{1,3}[)]?)|([(]?[0-9]{4}[)]?))\s*[)]?[-\s\.]?[(]?[0-9]{1,3}[)]?([-\s\.]?[0-9]{3})([-\s\.]?[0-9]{3,4})';
  numericWithdecimaluptotwoDigits='^[0-9][0-9]*[.]?[0-9]{0,2}$';



  alphabetsWithSpaces(event: any) {
    const maskSeperator = new RegExp('^([a-zA-Z ])', 'g');
    return maskSeperator.test(event.key);
  }

  unicodeMarathiAlphanumberic(event: any) {
    const maskSeperator = new RegExp('[^\u0900-\u096F ]+', 'm');
    return !maskSeperator.test(event.key);
  }

  noSpacesAtStart(event: any) {
    const maskSeperator = new RegExp('^[ ]+|[ ]+$', 'm');
    return !maskSeperator.test(event.key);
  }

  onlyDigits(event: any) {
    const maskSeperator = new RegExp('^([0-9])', 'g');
    return maskSeperator.test(event.key);
  }

  onlyAlphabets(event: any) {
    if (!this.noSpacesAtStart(event)) {
      return false
    }
    const maskSeperator = new RegExp('^([a-zA-Z])', 'g');
    return maskSeperator.test(event.key);
  }

  removeSpaceAtBegining(event: any) {
    let temp = true;
    try {
      if (!event.target.value[0].trim()) {
        event.target.value = event.target.value.substring(1).trim();
        temp = false;
      }
    }
    catch (e) {
      temp = false;
    }
    return temp
  }

  noSpaceAllow(event: any) {  // for All Space Not Allow
    if (event.code === 'Space') {
      event.preventDefault();
    }
  }

  noFirstSpaceAllow(event: any) {  // for First Space Not Allow
    if (event.target.selectionStart === 0 && (event.code === 'Space')) {
      event.preventDefault();
    }
  }
  
  unicodeMarathiValidation(event: any) {
    const maskSeperator = new RegExp('[^\u0900-\u0965 ]+', 'm');
    return !maskSeperator.test(event.key);
  }

  alphaNumericWithSpaces(event: any) {
    // alphaNumeric With Spaces but first Space Not Allow
    this.noFirstSpaceAllow(event);
    const maskSeperator = new RegExp('^([a-zA-Z0-9 ])', 'g');
    return maskSeperator.test(event.key);
  }

  emailRegex(event: any) { //Email Validation
    if (!this.noSpacesAtStart(event)) return false; // First Space not Accept
    if (event.currentTarget.value.split('..').length - 1 == 1 && (event.keyCode == 46)) return false;  // double .Dot not accept
    if (event.currentTarget.value.split('@').length - 1 == 1 && (event.keyCode == 64)) return false;  // double @ not accept
    if (event.target.selectionStart === 0 && (event.keyCode == 46)) return false;  // starting .Dot not accept
    if (event.target.selectionStart === 0 && (event.keyCode == 64)) return false;  // starting @ not accept
    let key = parseInt(event.key); if (event.target.selectionStart === 0 && (!isNaN(key))) return false; // starting Number not accept
    const maskSeperator = new RegExp('^([a-zA-Z0-9 _.@])', 'g'); // only Accept A-Z & 0-9 & .@
    return maskSeperator.test(event.key);
  }
 
  NumericWithDot(event: any) {
    const maskSeperator = new RegExp('^([0-9.])', 'g');
    return maskSeperator.test(event.key);
  }

}
