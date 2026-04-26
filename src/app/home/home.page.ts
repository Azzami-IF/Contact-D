import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController, Platform } from '@ionic/angular';
import { Contact, SortBy } from '../models/contact.model';
import { ContactService } from '../services/contact.service';
import { LabelService } from '../services/label.service';
import { SidebarService } from '../services/sidebar.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit, OnDestroy {
  contacts: Contact[] = [];
  displayedContacts: Contact[] = [];
  searchQuery: string = '';
  showSearchBar: boolean = false;
  showSortMenu: boolean = false;
  currentSort: SortBy = 'name-asc';

  // Label filter
  activeFilters: string[] = [];
  availableLabels: string[] = [];

  // Label Modal state
  isLabelModalOpen: boolean = false;
  labelModalMode: 'filter' | 'apply' = 'apply';
  labelSearchQuery: string = '';
  filteredLabels: string[] = [];

  // Multi-select state
  isSelectionMode: boolean = false;
  selectedIds: Set<string> = new Set();
  private pressTimer: any;
  private isLongPress: boolean = false;

  private destroy$ = new Subject<void>();

  constructor(
    private contactService: ContactService,
    private labelService: LabelService,
    private router: Router,
    private sidebarService: SidebarService,
    private alertController: AlertController,
    private toastController: ToastController,
    private platform: Platform
  ) {}

  ngOnInit() {
    this.loadContacts();
    this.loadLabels();
    this.setupAndroidBackButton();
  }

  setupAndroidBackButton() {
    this.platform.backButton.subscribeWithPriority(10, () => {
      if (this.isSelectionMode) {
        this.exitSelectionMode();
      }
    });
  }

  loadLabels(): void {
    this.availableLabels = this.labelService.getAllLabels();
  }

  onLabelFilterChange(event: any): void {
    // This was for the old select, can be removed or kept if needed.
    // Let's remove it in the HTML later.
  }

  setLabelFilter(label: string): void {
    if (label === '') {
      this.activeFilters = [];
    } else {
      if (!this.activeFilters.includes(label)) {
        this.activeFilters.push(label);
      }
    }
    this.updateDisplayedContacts();
  }

  removeFilter(label: string): void {
    this.activeFilters = this.activeFilters.filter(f => f !== label);
    this.updateDisplayedContacts();
  }

  openFilterModal(): void {
    this.loadLabels();
    this.labelModalMode = 'filter';
    this.labelSearchQuery = '';
    this.filterLabels();
    this.isLabelModalOpen = true;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openMenu(): void {
    this.sidebarService.openSidebar();
  }

  loadContacts(): void {
    this.contactService.contacts$
      .pipe(takeUntil(this.destroy$))
      .subscribe((contacts) => {
        this.contacts = contacts;
        this.updateDisplayedContacts();
      });
  }

  // Sorting methods
  setSortBy(sortBy: SortBy): void {
    this.currentSort = sortBy;
    this.contactService.setSortBy(sortBy);
    this.updateDisplayedContacts();
    this.showSortMenu = false;
  }

  toggleSortMenu(): void {
    this.showSortMenu = !this.showSortMenu;
  }

  // Search methods
  toggleSearchBar(): void {
    this.showSearchBar = !this.showSearchBar;
    if (this.showSearchBar) {
      this.showSortMenu = false; // Tutup sort saat fokus mencari
    } else {
      this.searchQuery = '';
      this.onSearch();
    }
  }

  onSearch(): void {
    this.updateDisplayedContacts();
  }

  // Favorites
  toggleFavorite(event: any, contactId: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.contactService.toggleFavorite(contactId);
  }

  // Helper Methods
  getLabelsForContact(contactId: string): string[] {
    const contact = this.contacts.find(c => c.id === contactId);
    if (!contact) return [];
    return this.labelService.getContactLabels(contactId);
  }

  // Multi-select methods
  async startPress(contactId: string): Promise<void> {
    this.isLongPress = false;
    this.pressTimer = setTimeout(async () => {
      this.isLongPress = true;
      if (this.platform.is('capacitor')) {
        await Haptics.impact({ style: ImpactStyle.Medium });
      }
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

  async deleteSelected(): Promise<void> {
    const count = this.selectedIds.size;
    const alert = await this.alertController.create({
      header: 'Hapus Kontak',
      message: `Hapus ${count} kontak yang dipilih?`,
      buttons: [
        { text: 'Batal', role: 'cancel' },
        {
          text: 'Hapus',
          role: 'destructive',
          handler: () => {
            this.selectedIds.forEach(id => this.contactService.deleteContact(id));
            this.showToast(`${count} kontak berhasil dihapus`);
            this.exitSelectionMode();
          }
        }
      ]
    });
    await alert.present();
  }

  async favoriteSelected(): Promise<void> {
    const contacts = Array.from(this.selectedIds).map(id => this.contactService.getContactById(id));
    const allFavorite = contacts.every(c => c?.isFavorite);

    this.selectedIds.forEach(id => {
      this.contactService.updateContact(id, { isFavorite: !allFavorite });
    });

    this.showToast(`${this.selectedIds.size} kontak diperbarui`);
    this.exitSelectionMode();
  }

  async addLabelSelected(): Promise<void> {
    this.loadLabels();
    this.labelModalMode = 'apply';
    this.labelSearchQuery = '';
    this.filterLabels();
    this.isLabelModalOpen = true;
  }

  filterLabels(): void {
    const query = this.labelSearchQuery.toLowerCase().trim();
    this.filteredLabels = this.availableLabels.filter(l =>
      l.toLowerCase().includes(query)
    );
  }

  onLabelSelected(label: string): void {
    if (this.labelModalMode === 'apply') {
      this.applyLabelToSelected(label);
    } else {
      this.setLabelFilter(label);
      this.closeLabelModal();
    }
  }

  applyLabelToSelected(label: string): void {
    this.selectedIds.forEach(id => {
      this.labelService.addLabelToContact(id, label);
    });
    this.showToast(`Label "${label}" ditambahkan ke ${this.selectedIds.size} kontak`);
    this.closeLabelModal();
    this.exitSelectionMode();
    this.loadLabels(); // Refresh list label
  }

  createAndApplyNewLabel(): void {
    const newLabel = this.labelSearchQuery.trim();
    if (newLabel) {
      this.applyLabelToSelected(newLabel);
    }
  }

  closeLabelModal(): void {
    this.isLabelModalOpen = false;
  }

  private async showToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom'
    });
    await toast.present();
  }

  // Navigation
  addNewContact(): void {
    this.router.navigate(['/contact-add']);
  }

  private updateDisplayedContacts(): void {
    let filtered = this.contacts;

    // Apply label filters
    if (this.activeFilters.length > 0) {
      filtered = filtered.filter(contact => {
        const contactLabels = this.labelService.getContactLabels(contact.id);
        return this.activeFilters.some(filter => contactLabels.includes(filter));
      });
    }

    // Apply search first
    if (this.searchQuery.trim()) {
      const lowerQuery = this.searchQuery.toLowerCase();
      filtered = filtered.filter(contact => {
        const fullName = `${contact.firstName} ${contact.lastName}`.toLowerCase();
        const company = (contact.company || '').toLowerCase();
        const notes = (contact.notes || '').toLowerCase();

        if (fullName.includes(lowerQuery) || company.includes(lowerQuery) || notes.includes(lowerQuery)) {
          return true;
        }

        return contact.additionalFields.some(field =>
          field.value.toLowerCase().includes(lowerQuery)
        );
      });
    }

    // Then apply sorting to filtered results
    switch (this.currentSort) {
      case 'name-asc':
        filtered.sort((a, b) =>
          `${a.firstName} ${a.lastName}`.localeCompare(
            `${b.firstName} ${b.lastName}`
          )
        );
        break;
      case 'name-desc':
        filtered.sort((a, b) =>
          `${b.firstName} ${b.lastName}`.localeCompare(
            `${a.firstName} ${a.lastName}`
          )
        );
        break;
      case 'date-asc':
        filtered.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
      case 'date-desc':
        filtered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
    }

    this.displayedContacts = filtered;
  }
}
