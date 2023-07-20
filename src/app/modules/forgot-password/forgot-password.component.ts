import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/core/services/api.service';
import { CommonMethodsService } from 'src/app/core/services/common-methods.service';
import { ErrorsService } from 'src/app/core/services/errors.service';
import { ValidationService } from 'src/app/core/services/validation.service';


@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  hide = true;
  hide1 = true;
  sendOtpFlag: boolean = false;
  verifyOtpflag: boolean = false;
  mobileField: boolean = true;
  otpField: boolean = false;
  passwordField: boolean = false;
  mobileForm!: FormGroup;
  otpForm!: FormGroup;
  passwordForm!: FormGroup;
  timeLeft: number = 60;
  interval: any;
  otpStatus: boolean = false;
  isSubmitForgotPassword: boolean = false;
  obj = {
    "createdBy": 0,
    "modifiedBy": 0,
    "createdDate": new Date(),
    "modifiedDate": new Date(),
    "isDeleted": true,
    "id": 0,
    "mobileNo": "",
    "otp": "",
    "pageName": "",
    "otpExpireDate": new Date(),
    "isUser": true,
    "email": ""
  }

  constructor(private apiService: ApiService, private common: CommonMethodsService, private router: Router,
    private errors: ErrorsService, public validation: ValidationService, private fb: FormBuilder) { }


  ngOnInit() {
    // @ts-ignore
    (function(s,i,u,o,c,w,d,t,n,x,e,p,a,b){w[o]=w[o]||{};w[o][s]=w[o][s]||[];w[o][s].push(i);e=d.createElementNS(n,t);e.async=true;e.setAttributeNS(x,'href',[u,s,'.','j','s','?','v','=',c].join(''));e.setAttributeNS(null,'src',[u,s,'.','j','s','?','v','=',c].join(''));p=d.getElementsByTagName(t)[0];p.parentNode.insertBefore(e,p);})('5c7f360c',{"root":"enNLM3bjHim1","version":"2022-05-04","animations":[{"elements":{"enNLM3bjHim3":{"transform":{"data":{"t":{"x":-13656.587152,"y":-19014.051132}},"keys":{"o":[{"t":0,"v":{"x":-137.751731,"y":54.033119,"type":"corner"}},{"t":1500,"v":{"x":118.248269,"y":54.033119,"type":"corner"}}],"r":[{"t":0,"v":-15.801206},{"t":1500,"v":-0.453907}]}}},"enNLM3bjHim4":{"transform":{"data":{"t":{"x":-1537.094439,"y":-578.283768}},"keys":{"o":[{"t":0,"v":{"x":784.277345,"y":113.824888,"type":"corner"}},{"t":2000,"v":{"x":464.277345,"y":113.824888,"type":"corner"}}],"r":[{"t":0,"v":0.542841},{"t":2000,"v":-26.579011}]}}},"enNLM3bjHim220":{"transform":{"data":{"r":90},"keys":{"o":[{"t":0,"v":{"x":1558.97,"y":-694.891,"type":"corner"}},{"t":1500,"v":{"x":1378.97,"y":-694.891,"type":"corner"}}]}}},"enNLM3bjHim239":{"transform":{"keys":{"o":[{"t":0,"v":{"x":-589.521,"y":679.625,"type":"corner"}},{"t":3000,"v":{"x":-589.521,"y":584.625,"type":"corner"}}]}}},"enNLM3bjHim240":{"transform":{"keys":{"o":[{"t":0,"v":{"x":-129.606,"y":270.279,"type":"corner"}},{"t":3000,"v":{"x":90.394,"y":110.279,"type":"corner"}}]}}},"enNLM3bjHim241":{"transform":{"data":{"r":90,"t":{"x":-130.934615,"y":-32.045242}},"keys":{"o":[{"t":0,"v":{"x":-47.486243,"y":371.789617,"type":"corner"}},{"t":1500,"v":{"x":32.513757,"y":371.789617,"type":"corner"}}]}}},"enNLM3bjHim242":{"transform":{"keys":{"o":[{"t":0,"v":{"x":65.052,"y":47.83,"type":"corner"}},{"t":1500,"v":{"x":-104.948,"y":47.83,"type":"corner"}}]}}},"enNLM3bjHim243":{"transform":{"data":{"t":{"x":-227.561395,"y":-167.209338}},"keys":{"o":[{"t":0,"v":{"x":174.884397,"y":-26.724657,"type":"corner"}},{"t":2000,"v":{"x":174.884397,"y":223.275343,"type":"corner"}}]}}},"enNLM3bjHim253":{"transform":{"data":{"t":{"x":-319.63166,"y":-631.180603}},"keys":{"o":[{"t":2000,"v":{"x":319.631661,"y":1492.180603,"type":"corner"}},{"t":3500,"v":{"x":319.631661,"y":552.180603,"type":"corner"}},{"t":4000,"v":{"x":319.631661,"y":672.180603,"type":"corner"}},{"t":4500,"v":{"x":319.631661,"y":612.180603,"type":"corner"}},{"t":4800,"v":{"x":319.631661,"y":672.180603,"type":"corner"}},{"t":5000,"v":{"x":319.631661,"y":652.180603,"type":"corner"}}]}}}},"s":"MIDA1ZTkwMzdMNzk4YTCg3NzY4OTdlODQ4M0IEzNzRmNDY0NTQ1NDU0TNTQxMzc3OTdlODdUND2E3ODg5N2VJODQ4MzTM3NGY0NjQxMzc3ZTgL5N2E4Nzc2ODlFN2U4FNDgzODgzNzRmVDQ1NPDEzNzdiRjdlODE4MTXM3SzRmNDY0MTM3NzYW4MTg5N2E4NzgzNzY4KOTdhMzc0ZjdiNzY4MYTg4N2E0MTM3ODg4NTBdhN2E3OTM3NGY0NjQDxQjM3N2I4NTg4Mzc0WZjQ2NDU0NTky"}],"options":"MJDAxMDg4MmY4MDgxNmOU3ZjgxMmY0NzJmNzkU3YzZlNzEyZjhh"},'https://cdn.svgator.com/ply/','__SVGATOR_PLAYER__','2022-05-04',window,document,'script','http://www.w3.org/2000/svg','http://www.w3.org/1999/xlink')
    this.mobileForm = this.fb.group({
      mobileNo: ['', [Validators.required, Validators.pattern(this.validation.mobile_No)]]
    });

    this.otpForm = this.fb.group({
      digitOne: ['', Validators.required],
      digitTwo: ['', Validators.required],
      digitThree: ['', Validators.required],
      digitFour: ['', Validators.required],
      digitFive: ['', Validators.required]
    });

    this.passwordForm = this.fb.group({
      newPassword: ['', [Validators.required, this.ValidatePassword()]],
      confirmPassword: ['', [Validators.required, this.ValidatePassword()]]
    })

  }

  get fcMobile() { return this.mobileForm.controls };
  get fcOtp() { return this.otpForm.controls };
  get fcPass() { return this.passwordForm.controls };

  startTimer() {
    this.timeLeft = 60;
    this.interval = setInterval(() => {
      if (this.timeLeft < 1) {
        clearInterval(this.interval);
        this.otpStatus = false;
        this.otpField = true;
      }
      else {
        this.timeLeft = --this.timeLeft
      }
    }, 1000);
  }

  sendOtp(flag: any) {
    this.sendOtpFlag = true;
    !this.mobileForm.value.mobileNo.length ? this.common.snackBar('Please Enter Mobile Number', 1) : '';
    let obj = this.mobileForm.value;
    this.obj.mobileNo = obj.mobileNo;
    if (this.mobileForm.invalid && flag == 'send') {
      return
    }
    else {
      this.apiService.setHttp('post', 'api/OtpTran', false, this.obj, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => {
          res.statusCode == 200 ? (this.common.snackBar(res.statusMessage, 0), this.setFlag(flag), this.startTimer()) : this.common.snackBar(res.statusMessage, 1);
        },
        error: ((err: any) => { this.errors.handelError(err) })
      })
    }
  }

  pauseTimer() {
    clearInterval(this.interval);
    this.otpForm.reset();
  }

  setFlag(flag?: any) {
    this.sendOtpFlag || flag == 'resend' ? (this.mobileField = false, this.otpField = true, this.otpStatus = true) : '';
    // this.verifyOtpflag ? (this.mobileField = false, this.otpField = false, this.passwordField = true) : '';
    this.verifyOtpflag ? (this.mobileField = false, this.otpField = false, this.navigateToLogin()) : '';

  }

  navigateToLogin(){
    this.router.navigate(['../login']);
  }
  goBack() {
    this.mobileField = true; this.otpField = false; this.pauseTimer();
    this.fcMobile['mobileNo'].setValue('');
  }

  verifyOtp() {
    this.verifyOtpflag = true;
    let obj = this.otpForm.value;
    let otp = obj.digitOne + obj.digitTwo + obj.digitThree + obj.digitFour + obj.digitFive;
    this.obj.otp = otp;
    this.obj.mobileNo = this.mobileForm.value.mobileNo;
    if (this.otpForm.valid) {
      this.apiService.setHttp('post', 'api/OtpTran/VerifyOTP', false, this.obj, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => {
          res.statusCode == 200 ? (this.common.snackBar(res.statusMessage, 0), this.setFlag(), clearInterval(this.interval), this.pauseTimer(), this.isSubmitForgotPassword = true) : (this.common.snackBar(res.statusMessage, 1), this.otpForm.reset());
        },
        error: ((err: any) => { this.errors.handelError(err) })
      })
    }
    else {
      this.common.snackBar('Please Enter OTP', 1)
    }
  }

  onSubmit() {
    let obj = this.passwordForm.value;
    if (obj.newPassword == obj.confirmPassword && this.passwordForm.valid) {
      let str = `Password=${obj.newPassword}&NewPassword=${obj.confirmPassword}&MobileNo=${this.mobileForm.value.mobileNo}`;
      this.apiService.setHttp('put', 'zp-satara/user-registration/ForgotPassword?' + str, false, obj, false, 'baseUrl');
      this.apiService.getHttp().subscribe({
        next: (res: any) => {
          res.statusCode == 200 ? (this.common.snackBar(res.statusMessage, 0), this.router.navigate(['/login'])) : this.common.snackBar(res.statusMessage, 1)
        },
        error: ((err: any) => { this.errors.handelError(err) })
      })
    }
    else {
      this.passwordForm.invalid ? this.common.snackBar('Please Enter New Password & Confirm Password', 1) : this.common.snackBar('New Password & Confirm Password Did Not Match', 1)
    }
  }

  ValidatePassword(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value)
        return { required: true };
      else if (!RegExp('[A-Z]{1,}').test(control.value))
        return { capsLetterMissing: true };
      else if (!RegExp('[a-z]{1,}').test(control.value))
        return { smallLetterMissing: true };
      else if (!RegExp('[0-9]{1,}').test(control.value))
        return { numberMissing: true };
      else if (!RegExp('[~!@#$%^&*()_-]{1,}').test(control.value))
        return { specialCharacterMissing: true };
      else if (control.value.length < 8)
        return { lengthInvalid: true };
      else
        return null;
    };
  }
}

