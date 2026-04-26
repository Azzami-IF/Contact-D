import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LabelDetailPageRoutingModule } from './label-detail-routing.module';

import { LabelDetailPage } from './label-detail.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LabelDetailPageRoutingModule
  ],
  declarations: [ LabelDetailPage ]
})
export class LabelDetailPageModule { }
