import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { Contact } from '../models/contact.model';
import { ContactService } from '../services/contact.service';
import { LabelService } from '../services/label.service';
import { SidebarService } from '../services/sidebar.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-label-detail',
  templateUrl: './label-detail.page.html',
  styleUrls: ['./label-detail.page.scss'],
  standalone: false,
})
export class LabelDetailPage implements OnInit, OnDestroy {
  labelName: string | null = null;
  contacts: Contact[] = [];
  displayedContacts: Contact[] = [];
  searchQuery: string = '';
  showSearchBar: boolean = false;

  // Multi-select state
  isSelectionMode: boolean = false;
  selectedIds: Set<string> = new Set();
  private pressTimer: any;
  private isLongPress: boolean = false;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private contactService: ContactService,
    private labelService: LabelService,
    private sidebarService: SidebarService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  openMenu(): void {
    this.sidebarService.openSidebar();
  }

  ngOnInit() {
    const encodedLabelName = this.route.snapshot.paramMap.get('labelName');
    if (encodedLabelName) {
      this.labelName = decodeURIComponent(encodedLabelName);
      this.loadContactsWithLabel();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadContactsWithLabel(): void {
    if (!this.labelName) return;

    this.contacts = this.labelService.getContactsWithLabel(this.labelName);
    this.updateDisplayedContacts();
  }

  toggleSearchBar(): void {
    this.showSearchBar = !this.showSearchBar;
    if (!this.showSearchBar) {
      this.searchQuery = '';
      this.onSearch();
    }
  }

  onSearch(): void {
    this.updateDisplayedContacts();
  }

  // Multi-select methods
  startPress(contactId: string): void {
    this.isLongPress = false;
    this.pressTimer = setTimeout(() => {
      this.isLongPress = true;
      this.enterSelectionMode(contactId);
    }, 500);
  }

  endPress(): void {
    if (this.pressTimer) {
      clearTimeout(this.pressTimer);
    }
  }

  enterSelectionMode(contactId: string): void {
    if (!this.isSelectionMode) {
      this.isSelectionMode = true;
      this.selectedIds.add(contactId);
    }
  }

  exitSelectionMode(): void {
    this.isSelectionMode = false;
    this.selectedIds.clear();
  }

  toggleSelection(contactId: string): void {
    if (this.selectedIds.has(contactId)) {
      this.selectedIds.delete(contactId);
      if (this.selectedIds.size === 0) {
        this.exitSelectionMode();
      }
    } else {
      this.selectedIds.add(contactId);
    }
  }

  onItemClick(contact: Contact): void {
    if (this.isLongPress) {
      this.isLongPress = false;
      return;
    }

    if (this.isSelectionMode) {
      this.toggleSelection(contact.id);
    } else {
      this.router.navigate(['/contact-detail', contact.id]);
    }
  }

  isSelected(contactId: string): boolean {
    return this.selectedIds.has(contactId);
  }

  selectAll(): void {
    if (this.selectedIds.size === this.displayedContacts.length) {
      this.selectedIds.clear();
      this.exitSelectionMode();
    } else {
      this.displayedContacts.forEach(c => this.selectedIds.add(c.id));
    }
  }

  async removeSelectedFromLabel(): Promise<void> {
    if (!this.labelName) return;

    const count = this.selectedIds.size;
    const alert = await this.alertController.create({
      header: 'Hapus dari Label',
      message: `Hapus ${count} kontak dari label "${this.labelName}"?`,
      buttons: [
        { text: 'Batal', role: 'cancel' },
        {
          text: 'Hapus',
          role: 'destructive',
          handler: () => {
            this.selectedIds.forEach(id => {
              this.labelService.removeLabelFromContact(id, this.labelName!);
            });
            this.showToast(`${count} kontak berhasil dihapus dari label`);
            this.exitSelectionMode();
            this.loadContactsWithLabel();
          }
        }
      ]
    });
    await alert.present();
  }

  private async showToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 1500,
      position: 'middle',
      cssClass: 'modern-toast'
    });
    await toast.present();
  }

  private updateDisplayedContacts(): void {
    let filtered = this.contacts;

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(contact =>
        contact.firstName.toLowerCase().includes(query) ||
        contact.lastName.toLowerCase().includes(query) ||
        (contact.company?.toLowerCase().includes(query) || false)
      );
    }

    this.displayedContacts = filtered;
  }

  viewContact(contactId: string): void {
    this.router.navigate(['/contact-detail', contactId]);
  }

  toggleFavorite(event: any, contactId: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.contactService.toggleFavorite(contactId);
  }

  getLabelsForContact(contactId: string): string[] {
    return this.labelService.getContactLabels(contactId);
  }
}
