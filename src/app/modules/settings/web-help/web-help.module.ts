import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WebHelpRoutingModule } from './web-help-routing.module';
import { WebHelpComponent } from './web-help.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';


@NgModule({
  declarations: [
    WebHelpComponent
  ],
  imports: [
    CommonModule,
    WebHelpRoutingModule,
    MatCardModule,
    MatIconModule,
    TranslateModule,
    MatButtonModule
  ]
})
export class WebHelpModule { }
