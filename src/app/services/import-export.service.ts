import { Injectable } from '@angular/core';
import { ContactService } from './contact.service';
import { ToastController, Platform } from '@ionic/angular';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

@Injectable({
  providedIn: 'root'
})
export class ImportExportService {

  constructor(
    private contactService: ContactService,
    private toastController: ToastController,
    private platform: Platform
  ) { }

  async exportContacts() {
    const contacts = this.contactService.getContacts();
    const dataStr = JSON.stringify(contacts, null, 2);
    const fileName = `contacts_backup_${new Date().getTime()}.json`;

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

  async importContacts(file: File) {
    try {
      const text = await file.text();
      const contacts = JSON.parse(text);

      if (Array.isArray(contacts)) {
        const isValid = contacts.every(c => c.firstName !== undefined);
        if (!isValid) throw new Error('Format file tidak valid');

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
      }
      return false;
    } catch (error) {
      await this.showToast('Gagal mengimport data: ' + (error as Error).message);
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
