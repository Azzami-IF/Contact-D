import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private contactService: ContactService,
    private labelService: LabelService,
    private sidebarService: SidebarService
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
