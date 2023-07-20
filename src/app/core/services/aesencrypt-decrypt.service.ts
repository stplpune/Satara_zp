import { Injectable } from '@angular/core';
import  *  as CryptoJS from  'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class AesencryptDecryptService {
  secretKey = "8080808080808080";

  constructor() { }

  encrypt(value : string) : string{
    return CryptoJS.AES.encrypt(value, this.secretKey).toString();
  }

  decrypt(value : string){
    return CryptoJS.AES.decrypt(value, this.secretKey.trim()).toString(CryptoJS.enc.Utf8);
  }
}
