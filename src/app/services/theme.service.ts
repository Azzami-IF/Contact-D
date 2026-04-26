import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ThemeMode = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeSubject = new BehaviorSubject<ThemeMode>('system');
  public theme$ = this.themeSubject.asObservable();

  constructor() {
    const savedTheme = localStorage.getItem('theme-preference') as ThemeMode;
    if (savedTheme) {
      this.setTheme(savedTheme);
    } else {
      this.applyTheme('system');
    }

    // Listen to system changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (this.themeSubject.value === 'system') {
        this.applyTheme('system');
      }
    });
  }

  setTheme(mode: ThemeMode) {
    localStorage.setItem('theme-preference', mode);
    this.themeSubject.next(mode);
    this.applyTheme(mode);
  }

  private applyTheme(mode: ThemeMode) {
    let isDark = false;
    if (mode === 'system') {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
      isDark = mode === 'dark';
    }
    document.body.classList.toggle('dark', isDark);
  }

  getCurrentTheme(): ThemeMode {
    return this.themeSubject.value;
  }
}
