import { Injectable, inject } from '@angular/core';
import { ContactService } from './contact.service';
import { ToastController, Platform } from '@ionic/angular';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

export interface ImportResult {
  contacts: any[];
  exportDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ImportExportService {

  private contactService = inject(ContactService);
  private toastController = inject(ToastController);
  private platform = inject(Platform);

  constructor() { }

  async exportContacts() {
    const contacts = this.contactService.getContacts();
    const now = new Date();

    // New format with metadata
    const exportData = {
      version: '1.0',
      exportDate: now.toISOString(),
      contacts: contacts
    };

    const dataStr = JSON.stringify(exportData, null, 2);

    // Formatted filename: contacts_backup_YYYY-MM-DD.json
    const dateStr = now.toISOString().split('T')[0];
    const fileName = `contacts_backup_${dateStr}.json`;

    if (this.platform.is('capacitor')) {
      try {
        // 1. Write file to temporary directory on Android
        const result = await Filesystem.writeFile({
          path: fileName,
          data: dataStr,
          directory: Directory.Cache,
          encoding: Encoding.UTF8,
        });

        // 2. Open Android Share Sheet so user can save it to "Downloads" or send via WA/Email
        await Share.share({
          title: 'Export Kontak',
          text: 'Cadangan data kontak Anda',
          url: result.uri,
          dialogTitle: 'Simpan file cadangan ke...',
        });

      } catch (error) {
        console.error('Export error:', error);
        await this.showToast('Gagal mengeksport data');
      }
    } else {
      // Browser fallback (Old method)
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const link = document.createElement('a');
      link.setAttribute('href', dataUri);
      link.setAttribute('download', fileName);
      link.click();
      await this.showToast('Data kontak berhasil dieksport');
    }
  }

  /**
   * Parses the file and returns the data without applying it.
   * This allows the UI to show a confirmation dialog first.
   */
  async prepareImport(file: File): Promise<ImportResult | null> {
    try {
      const text = await file.text();
      const rawData = JSON.parse(text);

      let contacts: any[] = [];
      let exportDate: string | undefined;

      // Check if it's the new format (object) or old format (array)
      if (rawData && typeof rawData === 'object' && !Array.isArray(rawData)) {
        if (Array.isArray(rawData.contacts)) {
          contacts = rawData.contacts;
          exportDate = rawData.exportDate;
        } else {
          throw new Error('Format file tidak dikenali');
        }
      } else if (Array.isArray(rawData)) {
        contacts = rawData;
      } else {
        throw new Error('Format file tidak valid');
      }

      const isValid = contacts.length === 0 || contacts.every(c => c.firstName !== undefined);
      if (!isValid) throw new Error('Data kontak tidak valid');

      return { contacts, exportDate };
    } catch (error) {
      await this.showToast('Gagal membaca file: ' + (error as Error).message);
      return null;
    }
  }

  async executeImport(contacts: any[]) {
    try {
      const existingContacts = this.contactService.getContacts();
      const merged = [...existingContacts];

      contacts.forEach(newContact => {
        const index = merged.findIndex(c => c.id === newContact.id);
        if (index > -1) {
          merged[index] = newContact;
        } else {
          merged.push(newContact);
        }
      });

      this.contactService.importContactsData(merged);
      await this.showToast('Data kontak berhasil diimport');
      return true;
    } catch (error) {
      await this.showToast('Gagal mengimport data');
      return false;
    }
  }

  private async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 1500,
      position: 'middle',
      cssClass: 'modern-toast'
    });
    await toast.present();
  }
}
