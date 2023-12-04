import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NgxSpinnerService } from 'ngx-spinner';
import { WebStorageService } from 'src/app/core/services/web-storage.service';

declare var Flashphoner: any;
declare var Player: any;

@Component({
  selector: 'app-live-streaming',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatCardModule, MatTooltipModule, TranslateModule, MatIconModule, MatButtonModule],
  templateUrl: './live-streaming.component.html',
  styleUrls: ['./live-streaming.component.scss']
})
export class LiveStreamingComponent {
  langTypeName: any;
  playStopFlag: boolean = true;
  timer: any;
  i: number = 0;
  tableDataArray: any;
  ccTvId!: number;

  constructor(@Inject(MAT_DIALOG_DATA) public obj: any, private ngxSpinner: NgxSpinnerService, private webStorageS: WebStorageService) {
    this.ngxSpinner.show();
    this.ccTvId = obj?.cctvTypeId;
    console.log("obj", obj);
    

    setTimeout(() => {
    if (this.ccTvId == 1 && obj.label == 'View') { //IP
      this.init_WithIP();
    } else if (this.ccTvId == 2 && obj.label == 'View') { //WithoutIP solar
      this.init_WithOutIP()
    }
    }, 1000);

    this.webStorageS.langNameOnChange.subscribe(lang => {
      this.langTypeName = lang;
    });
  }



  //#region ------------------------------------------------------With ip code start heare--------------------------------------------//
  SESSION_STATUS = Flashphoner.constants.SESSION_STATUS;
  STREAM_STATUS = Flashphoner.constants.STREAM_STATUS;
  session: any;
  stream: any;
  PRELOADER_URL = "https://github.com/flashphoner/flashphoner_client/raw/wcs_api-2.0/examples/demo/dependencies/media/preloader.mp4";

  init_WithIP() {
    Flashphoner.init({});
    this.session = Flashphoner.createSession({
      urlServer: "wss://demo.flashphoner.com" //specify the address of your WCS
    }).on(this.SESSION_STATUS.ESTABLISHED, (_session: any) => {
      let url = this.obj?.link
      this.playClick(url)
    });
  }

  Browser: any = {
    isSafari: function () {
      return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    },
  }

  playClick(url: any) {
    if (this.Browser.isSafari()) {
      Flashphoner.playFirstVideo(document.getElementById("play"), true, this.PRELOADER_URL).then(() => {
        this.playStream(url);
      });
    } else {
      this.playStream(url);
    }
  }

  playStream(url: any) {
    var options: any = {
      name: url,
      display: document.getElementById("play")
    };
    this.stream = this.session?.createStream(options).on(this.STREAM_STATUS.PLAYING, (_stream: any) => {
      console.log("playing", this.STREAM_STATUS);
    });
    this.ngxSpinner.hide();
    this.stream?.play();
  }

  //#endregion  ------------------------------------------------------With ip code end heare--------------------------------------------//


  //#region --------------------------------------------  without IP start here -------------------------------------------------

  init_WithOutIP() { // solar
    this.ngxSpinner.show();

    let streamid = 1;
    let channel = 0;
    var devid: any = this.obj?.deviceId || '5625617245';
    let username = this.obj?.userName || 'admin';
    let pwd = this.obj?.password  || 'da]e2e38c5';
    let element: any;
    element = document.getElementById("canvas1");
    Player?.init([element]);
    setTimeout(() => {
      Player.ConnectDevice(devid, '', username, pwd, 0, 80, 0, channel, streamid, "ws")
    }, 2000);
    setTimeout(() => {
      Player.OpenStream(devid, '', channel, streamid, 0);
    }, 15000);
    this.ngxSpinner.hide();
  }

  // openVideo(){
  //   let devid: any = '5625617245';
  //   let streamid = 1;
  //   let channel = 0;
  //   setTimeout(() => {
  //     Player.OpenStream(devid, '', channel, streamid, 0);
  //   }, 2000);
  // }



 

  disconnect() {
    Player?.DisConnectDevice('5625617245');
    const promiseOne = new Promise((resolve) => {
      this.closeVideo();
      resolve('resolved')
    });

    promiseOne.then((value) => {
      console.log(value);
      this.init_WithOutIP();
    });
  }

  closeVideo() {
    this.init_WithOutIP();
  }

 
  
  ngOnDestroy(){
    this.closeModal();
    // this.init_WithIP();
  }

  closeModal(){
    this.stream.stop();
    this.session.disconnect();
  }
}
