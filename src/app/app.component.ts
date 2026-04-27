import { Component, OnDestroy, OnInit } from '@angular/core';
import { AlertController, Platform } from '@ionic/angular';
import { SidebarService } from './services/sidebar.service';
import { ThemeService } from './services/theme.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App } from '@capacitor/app';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit, OnDestroy {
  sidebarOpen = false;
  private destroy$ = new Subject<void>();

  constructor(
    private alertController: AlertController,
    private sidebarService: SidebarService,
    private themeService: ThemeService,
    private platform: Platform
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      if (this.platform.is('capacitor')) {
        StatusBar.setStyle({ style: Style.Default });

        // Listen to hardware back button
        this.platform.backButton.subscribeWithPriority(-1, () => {
          if (this.sidebarOpen) {
            this.closeSidebar();
          } else {
            // Let Ionic handle internal navigation automatically
            // If we are at the top of the stack, it will exit
          }
        });
      }
    });
  }

  ngOnInit() {
    this.sidebarService.sidebarOpen$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isOpen => {
        this.sidebarOpen = isOpen;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openSidebar(): void {
    this.sidebarService.openSidebar();
  }

  closeSidebar(): void {
    this.sidebarService.closeSidebar();
  }
}
