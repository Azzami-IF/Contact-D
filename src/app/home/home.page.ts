import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Contact, SortBy } from '../models/contact.model';
import { ContactService } from '../services/contact.service';
import { LabelService } from '../services/label.service';
import { SidebarService } from '../services/sidebar.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
  private destroy$ = new Subject<void>();

  constructor(
    private contactService: ContactService,
    private labelService: LabelService,
    private router: Router,
    private sidebarService: SidebarService
  ) {}

  ngOnInit() {
    this.loadContacts();
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
    if (!this.showSearchBar) {
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

  // Navigation
  addNewContact(): void {
    this.router.navigate(['/contact-add']);
  }

  private updateDisplayedContacts(): void {
    let filtered = this.contacts;

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
