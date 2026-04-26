import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Contact, AdditionalField } from '../models/contact.model';
import { ContactService } from '../services/contact.service';
import { LabelService } from '../services/label.service';
import { SidebarService } from '../services/sidebar.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-contact-detail',
  templateUrl: './contact-detail.page.html',
  styleUrls: ['./contact-detail.page.scss'],
  standalone: false,
})
export class ContactDetailPage implements OnInit, OnDestroy {
  contact: Contact | null = null;
  contactId: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private contactService: ContactService,
    private labelService: LabelService,
    private alertController: AlertController,
    private sidebarService: SidebarService
  ) {}

  openMenu(): void {
    this.sidebarService.openSidebar();
  }

  ngOnInit() {
    this.contactId = this.route.snapshot.paramMap.get('id');
    if (this.contactId) {
      this.loadContact();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadContact(): void {
    if (this.contactId) {
      this.contactService.contacts$
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.contact = this.contactService.getContactById(this.contactId!) || null;
        });
    }
  }

  toggleFavorite(): void {
    if (this.contactId) {
      this.contactService.toggleFavorite(this.contactId);
    }
  }

  getFieldIcon(field: AdditionalField): string {
    switch (field.type) {
      case 'phone':
        return 'call';
      case 'email':
        return 'mail';
      case 'address':
        return 'location';
      case 'birthday':
        return 'calendar';
      case 'label':
        return 'pricetag';
      case 'custom':
        return 'document-text';
      default:
        return 'information-circle';
    }
  }

  getFieldLabel(field: AdditionalField): string {
    if (field.type === 'custom' && field.customFieldName) {
      return field.customFieldName;
    }
    switch (field.type) {
      case 'phone':
        return 'Telepon';
      case 'email':
        return 'Email';
      case 'address':
        return 'Alamat';
      case 'birthday':
        return 'Ulang Tahun';
      case 'label':
        return 'Label';
      default:
        return field.label || field.type;
    }
  }

  editContact(): void {
    if (this.contactId) {
      this.router.navigate(['/contact-edit', this.contactId]);
    }
  }

  // Helper Methods
  getLabelsForContact(contactId: string): string[] {
    return this.labelService.getContactLabels(contactId);
  }

  getAdditionalFieldsWithoutLabels(): AdditionalField[] {
    return this.contact?.additionalFields.filter(field => field.type !== 'label') || [];
  }

  async deleteContact(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Hapus Kontak',
      message: `Apakah Anda yakin ingin menghapus kontak ${this.contact?.firstName} ${this.contact?.lastName}?`,
      buttons: [
        {
          text: 'Batal',
          role: 'cancel',
        },
        {
          text: 'Hapus',
          role: 'destructive',
          handler: () => {
            if (this.contactId) {
              this.contactService.deleteContact(this.contactId);
              this.router.navigate(['/home']);
            }
          },
        },
      ],
    });

    await alert.present();
  }
}
