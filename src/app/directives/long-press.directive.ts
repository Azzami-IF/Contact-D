import { Directive, ElementRef, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Gesture, GestureController } from '@ionic/angular';

@Directive({
  selector: '[appLongPress]',
  standalone: false
})
export class LongPressDirective implements OnInit, OnDestroy {
  @Output() longPress = new EventEmitter();
  private gesture?: Gesture;

  constructor(private el: ElementRef, private gestureCtrl: GestureController) {}

  ngOnInit() {
    this.gesture = this.gestureCtrl.create({
      el: this.el.nativeElement,
      threshold: 0,
      gestureName: 'long-press',
      onStart: () => {
        const timeout = setTimeout(() => {
          this.longPress.emit();
        }, 500);

        // Clear timeout if the gesture ends early
        this.gesture!.setDisabled(false);
        const onEnd = () => {
          clearTimeout(timeout);
        };
        this.gesture!.onEnd = onEnd;
      }
    });
    this.gesture.enable(true);
  }

  ngOnDestroy() {
    if (this.gesture) {
      this.gesture.destroy();
    }
  }
}
