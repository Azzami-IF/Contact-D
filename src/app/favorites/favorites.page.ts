import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Contact, SortBy } from '../models/contact.model';
import { ContactService } from '../services/contact.service';
import { LabelService } from '../services/label.service';
import { SidebarService } from '../services/sidebar.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.page.html',
  styleUrls: ['./favorites.page.scss'],
  standalone: false,
})
export class FavoritesPage implements OnInit, OnDestroy {
  favoriteContacts: Contact[] = [];
  displayedFavorites: Contact[] = [];
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

  openMenu(): void {
    this.sidebarService.openSidebar();
  }

  ngOnInit() {
    this.loadFavoriteContacts();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadFavoriteContacts(): void {
    this.contactService.contacts$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.favoriteContacts = this.contactService.getFavoriteContacts();
        this.updateDisplayedFavorites();
      });
  }

  toggleSearchBar(): void {
    this.showSearchBar = !this.showSearchBar;
    if (!this.showSearchBar) {
      this.searchQuery = '';
      this.onSearch();
    }
  }

  onSearch(): void {
    this.updateDisplayedFavorites();
  }

  toggleSortMenu(): void {
    this.showSortMenu = !this.showSortMenu;
  }

  setSortBy(sortBy: SortBy): void {
    this.currentSort = sortBy;
    this.updateDisplayedFavorites();
    this.showSortMenu = false;
  }

  private updateDisplayedFavorites(): void {
    let filtered = this.favoriteContacts;

    // Apply search
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter((contact) =>
        `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(query) ||
        (contact.company?.toLowerCase().includes(query) || false) ||
        (contact.notes?.toLowerCase().includes(query) || false)
      );
    }

    // Apply sorting
    filtered = this.sortContacts(filtered, this.currentSort);

    this.displayedFavorites = filtered;
  }

  private sortContacts(contacts: Contact[], sortBy: SortBy): Contact[] {
    const sorted = [...contacts];
    switch (sortBy) {
      case 'name-asc':
        return sorted.sort((a, b) =>
          `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
        );
      case 'name-desc':
        return sorted.sort((a, b) =>
          `${b.firstName} ${b.lastName}`.localeCompare(`${a.firstName} ${a.lastName}`)
        );
      case 'date-asc':
        return sorted.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case 'date-desc':
        return sorted.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      default:
        return sorted;
    }
  }

  toggleFavorite(event: any, contactId: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.contactService.toggleFavorite(contactId);
  }

  // Helper Methods
  getLabelsForContact(contactId: string): string[] {
    return this.labelService.getContactLabels(contactId);
  }

  viewContact(contactId: string): void {
    this.router.navigate(['/contact-detail', contactId]);
  }
}
