import { Component, OnInit } from '@angular/core';
import { ThemeService, ThemeMode } from '../services/theme.service';
import { ImportExportService } from '../services/import-export.service';
import { SidebarService } from '../services/sidebar.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: false
})
export class SettingsPage implements OnInit {
  currentTheme: ThemeMode = 'system';

  constructor(
    private themeService: ThemeService,
    private importExportService: ImportExportService,
    private sidebarService: SidebarService
  ) { }

  ngOnInit() {
    this.currentTheme = this.themeService.getCurrentTheme();
  }

  changeTheme(event: any) {
    const mode = event.detail.value as ThemeMode;
    this.themeService.setTheme(mode);
  }

  async onExport() {
    await this.importExportService.exportContacts();
  }

  async onImport(event: any) {
    const file = event.target.files[0];
    if (file) {
      const success = await this.importExportService.importContacts(file);
      if (success) {
        // Reset input
        event.target.value = '';
      }
    }
  }

  openMenu() {
    this.sidebarService.openSidebar();
  }
}
