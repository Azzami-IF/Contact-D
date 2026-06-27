import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Preferences } from '@capacitor/preferences';

export type ThemeMode = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeSubject = new BehaviorSubject<ThemeMode>('system');
  public theme$ = this.themeSubject.asObservable();
  private readonly THEME_KEY = 'theme-preference';

  constructor() {
    this.initTheme();

    // Listen to system changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (this.themeSubject.value === 'system') {
        this.applyTheme('system');
      }
    });
  }

  private async initTheme() {
    const { value } = await Preferences.get({ key: this.THEME_KEY });
    if (value) {
      this.setTheme(value as ThemeMode);
    } else {
      this.applyTheme('system');
    }
  }

  async setTheme(mode: ThemeMode) {
    await Preferences.set({ key: this.THEME_KEY, value: mode });
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

    // Apply class to body
    document.body.classList.toggle('dark', isDark);

    // Optional: Add transition effect to make it smoother
    document.body.style.transition = 'background-color 0.3s ease';
  }

  getCurrentTheme(): ThemeMode {
    return this.themeSubject.value;
  }
}
