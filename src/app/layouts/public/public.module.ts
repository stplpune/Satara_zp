import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PublicRoutingModule } from './public-routing.module';
import { PublicComponent } from './public.component';
import { WebHeaderComponent } from './web-header/web-header.component';
import { WebFooterComponent } from './web-footer/web-footer.component';


@NgModule({
  declarations: [
    PublicComponent,
    WebHeaderComponent,
    WebFooterComponent
  ],
  imports: [
    CommonModule,
    PublicRoutingModule
  ]
})
export class PublicModule { }
