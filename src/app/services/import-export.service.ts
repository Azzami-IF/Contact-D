import { Injectable } from '@angular/core';
import { ContactService } from './contact.service';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ImportExportService {

  constructor(
    private contactService: ContactService,
    private toastController: ToastController
  ) { }

  async exportContacts() {
    const contacts = this.contactService.getContacts();
    const dataStr = JSON.stringify(contacts, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const fileName = `contacts_backup_${new Date().getTime()}.json`;
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', fileName);
    link.click();

    await this.showToast('Data kontak berhasil dieksport');
  }

  async importContacts(file: File) {
    try {
      const text = await file.text();
      const contacts = JSON.parse(text);

      if (Array.isArray(contacts)) {
        // Simple validation: check if items have firstName
        const isValid = contacts.every(c => c.firstName !== undefined);
        if (!isValid) throw new Error('Format file tidak valid');

        // Overwrite or Merge? Let's overwrite for simplicity or merge based on ID
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

        localStorage.setItem('contacts', JSON.stringify(merged));
        // Force reload contacts in service if needed, or just use service method
        // Since ContactService uses BehaviorSubject, we should update it
        // Actually it's better if ContactService has a setContacts method
        (this.contactService as any).saveAndUpdate(merged);

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
      duration: 2000,
      position: 'bottom'
    });
    await toast.present();
  }
}
