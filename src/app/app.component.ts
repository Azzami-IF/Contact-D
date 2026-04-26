import { Component, OnDestroy, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { ContactService } from './services/contact.service';
import { SidebarService } from './services/sidebar.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
    private contactService: ContactService,
    private alertController: AlertController,
    private sidebarService: SidebarService
  ) {}

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

  exportAndClose(): void {
    this.exportContacts();
    this.closeSidebar();
  }

  deleteAndClose(): void {
    this.deleteAllContacts();
    this.closeSidebar();
  }

  async exportContacts(): Promise<void> {
    const contacts = this.contactService.getContacts();
    const dataStr = JSON.stringify(contacts, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `contacts_${new Date().getTime()}.json`;

    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', exportFileDefaultName);
    link.click();
  }

  async deleteAllContacts(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Hapus Semua Kontak',
      message: 'Apakah Anda yakin ingin menghapus semua kontak? Tindakan ini tidak dapat dibatalkan.',
      buttons: [
        {
          text: 'Batal',
          role: 'cancel',
        },
        {
          text: 'Hapus',
          role: 'destructive',
          handler: () => {
            this.contactService.clearAll();
          },
        },
      ],
    });

    await alert.present();
  }
}
