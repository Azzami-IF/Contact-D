import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ContactEditPageRoutingModule } from './contact-edit-routing.module';

import { ContactEditPage } from './contact-edit.page';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IonicModule,
    ContactEditPageRoutingModule
  ],
  declarations: [ ContactEditPage ]
})
export class ContactEditPageModule { }
