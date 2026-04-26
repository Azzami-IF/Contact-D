import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ContactAddPageRoutingModule } from './contact-add-routing.module';

import { ContactAddPage } from './contact-add.page';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IonicModule,
    ContactAddPageRoutingModule
  ],
  declarations: [ ContactAddPage ]
})
export class ContactAddPageModule { }
