import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExtractLabelsPipe } from '../pipes/extract-labels.pipe';
import { LongPressDirective } from '../directives/long-press.directive';

@NgModule({
  imports: [
    CommonModule,
    ExtractLabelsPipe,
    LongPressDirective
  ],
  exports: [
    ExtractLabelsPipe,
    LongPressDirective
  ]
})
export class SharedModule { }
