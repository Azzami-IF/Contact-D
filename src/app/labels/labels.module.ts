import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LabelsPageRoutingModule } from './labels-routing.module';
import { LabelsPage } from './labels.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LabelsPageRoutingModule
  ],
  declarations: [LabelsPage]
})
export class LabelsPageModule { }
