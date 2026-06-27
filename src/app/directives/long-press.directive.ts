import { Directive, ElementRef, EventEmitter, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { Gesture, GestureController } from '@ionic/angular';

@Directive({
  selector: '[appLongPress]',
  standalone: true
})
export class LongPressDirective implements OnInit, OnDestroy {
  @Output() longPress = new EventEmitter();
  private gesture?: Gesture;
  private timer?: any;

  private el = inject(ElementRef);
  private gestureCtrl = inject(GestureController);

  constructor() {}

  ngOnInit() {
    this.gesture = this.gestureCtrl.create({
      el: this.el.nativeElement,
      threshold: 0,
      gestureName: 'long-press',
      onStart: () => {
        this.timer = setTimeout(() => {
          this.longPress.emit();
        }, 500);
      },
      onEnd: () => {
        if (this.timer) {
          clearTimeout(this.timer);
          this.timer = undefined;
        }
      }
    });
    this.gesture.enable(true);
  }

  ngOnDestroy() {
    if (this.gesture) {
      this.gesture.destroy();
    }
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }
}
