import { Component, OnInit, inject } from '@angular/core';
import { ThemeService, ThemeMode } from '../services/theme.service';
import { ImportExportService } from '../services/import-export.service';
import { SidebarService } from '../services/sidebar.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: false
})
export class SettingsPage implements OnInit {
  currentTheme: ThemeMode = 'system';

  private themeService = inject(ThemeService);
  private importExportService = inject(ImportExportService);
  private sidebarService = inject(SidebarService);
  private alertController = inject(AlertController);

  constructor() { }

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
      const data = await this.importExportService.prepareImport(file);

      if (data) {
        let dateMsg = 'Tanggal cadangan tidak diketahui.';
        if (data.exportDate) {
          const d = new Date(data.exportDate);
          dateMsg = `Cadangan dibuat pada: ${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
        }

        const alert = await this.alertController.create({
          header: 'Konfirmasi Import',
          message: `${dateMsg}<br><br>Apakah Anda yakin ingin mengimport ${data.contacts.length} kontak? Data yang ada akan digabungkan.`,
          buttons: [
            {
              text: 'Batal',
              role: 'cancel'
            },
            {
              text: 'Import',
              handler: async () => {
                const success = await this.importExportService.executeImport(data.contacts);
                if (success) {
                  event.target.value = '';
                }
              }
            }
          ]
        });

        await alert.present();
      }
    }
  }

  openPrivacyPolicy() {
    window.open('https://shorturl.at/rUFZY', '_blank');
  }

  sendFeedback() {
    const subject = encodeURIComponent('Feedback Aplikasi Contact-D');
    const body = encodeURIComponent('Halo Pengembang,\n\nSaya ingin memberikan masukan terkait aplikasi ini:\n');
    window.location.href = `mailto:ambatu.dev@gmail.com?subject=${subject}&body=${body}`;
  }
}
