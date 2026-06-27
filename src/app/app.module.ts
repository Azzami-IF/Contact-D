import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy, createAnimation } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

const customAnimation = (_: HTMLElement, opts: any) => {
  const isBack = opts.direction === 'back';
  const isForward = opts.direction === 'forward';

  // For root navigation (like from side menu), use a smooth fade instead of slide
  if (!isBack && !isForward) {
    return createAnimation()
      .addElement(opts.enteringEl)
      .duration(200)
      .easing('ease-in-out')
      .fromTo('opacity', '0', '1');
  }

  // For hierarchical navigation (forward/back), use horizontal slide
  const enteringAnimation = createAnimation()
    .addElement(opts.enteringEl)
    .fromTo('transform', isBack ? 'translateX(-100%)' : 'translateX(100%)', 'translateX(0)')
    .fromTo('opacity', '0.8', '1');

  const leavingAnimation = createAnimation()
    .addElement(opts.leavingEl)
    .fromTo('transform', 'translateX(0)', isBack ? 'translateX(100%)' : 'translateX(-100%)')
    .fromTo('opacity', '1', '0.2');

  return createAnimation()
    .duration(300)
    .easing('cubic-bezier(0.3, 0, 0.66, 1)')
    .addAnimation([enteringAnimation, leavingAnimation]);
};

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot({
      navAnimation: customAnimation,
      mode: 'md'
    }),
    AppRoutingModule
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
