import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExtractLabelsPipe } from '../pipes/extract-labels.pipe';
import { LongPressDirective } from '../directives/long-press.directive';

@NgModule({
  declarations: [
    ExtractLabelsPipe,
    LongPressDirective
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ExtractLabelsPipe,
    LongPressDirective
  ]
})
export class SharedModule { }
