import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Contact, SortBy } from '../models/contact.model';

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  private contactsSubject = new BehaviorSubject<Contact[]>([]);
  public contacts$ = this.contactsSubject.asObservable();

  private favoriteContactsSubject = new BehaviorSubject<Contact[]>([]);
  public favoriteContacts$ = this.favoriteContactsSubject.asObservable();

  private sortBySubject = new BehaviorSubject<SortBy>('name-asc');
  public sortBy$ = this.sortBySubject.asObservable();

  private readonly STORAGE_KEY = 'contacts';
  private readonly FAVORITES_KEY = 'favorite_contacts';

  constructor() {
    this.loadFromStorage();
  }

  // Load dari localStorage
  private loadFromStorage(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      const contacts = JSON.parse(stored);
      this.contactsSubject.next(contacts);
      this.updateFavorites();
    }
  }

  // Get all contacts
  getContacts(): Contact[] {
    return this.contactsSubject.value;
  }

  // Get contact by ID
  getContactById(id: string): Contact | undefined {
    return this.getContacts().find(c => c.id === id);
  }

  // Add contact
  addContact(contact: Contact): void {
    const newContact: Contact = {
      id: Date.now().toString(),
      firstName: contact.firstName,
      lastName: contact.lastName,
      company: contact.company || '',
      notes: contact.notes || '',
      profileImage: contact.profileImage,
      additionalFields: contact.additionalFields || [],
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const contacts = [...this.getContacts(), newContact];
    this.saveAndUpdate(contacts);
  }

  // Update contact
  updateContact(id: string, updates: Partial<Contact>): void {
    const contacts = this.getContacts().map(c =>
      c.id === id
        ? { ...c, ...updates, updatedAt: new Date().toISOString() }
        : c
    );
    this.saveAndUpdate(contacts);
  }

  // Delete contact
  deleteContact(id: string): void {
    const contacts = this.getContacts().filter(c => c.id !== id);
    this.saveAndUpdate(contacts);
  }

  // Toggle favorite
  toggleFavorite(id: string): void {
    const contact = this.getContactById(id);
    if (contact) {
      this.updateContact(id, { isFavorite: !contact.isFavorite });
    }
  }

  // Get favorite contacts
  getFavoriteContacts(): Contact[] {
    return this.getContacts().filter(c => c.isFavorite);
  }

  // Search contacts
  searchContacts(query: string): Contact[] {
    if (!query.trim()) {
      return this.getContacts();
    }
    const lowerQuery = query.toLowerCase();
    return this.getContacts().filter(contact => {
      const fullName = `${contact.firstName} ${contact.lastName}`.toLowerCase();
      const company = (contact.company || '').toLowerCase();
      const notes = (contact.notes || '').toLowerCase();
      
      if (fullName.includes(lowerQuery) || company.includes(lowerQuery) || notes.includes(lowerQuery)) {
        return true;
      }

      // Search in additional fields
      return contact.additionalFields.some(field =>
        field.value.toLowerCase().includes(lowerQuery)
      );
    });
  }

  // Sort contacts
  getSortedContacts(sortBy: SortBy = 'name-asc'): Contact[] {
    const contacts = [...this.getContacts()];

    switch (sortBy) {
      case 'name-asc':
        return contacts.sort((a, b) =>
          `${a.firstName} ${a.lastName}`.localeCompare(
            `${b.firstName} ${b.lastName}`
          )
        );
      case 'name-desc':
        return contacts.sort((a, b) =>
          `${b.firstName} ${b.lastName}`.localeCompare(
            `${a.firstName} ${a.lastName}`
          )
        );
      case 'date-asc':
        return contacts.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case 'date-desc':
        return contacts.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      default:
        return contacts;
    }
  }

  // Set sort option
  setSortBy(sortBy: SortBy): void {
    this.sortBySubject.next(sortBy);
  }

  // Filter by label
  getContactsByLabel(label: string): Contact[] {
    return this.getContacts().filter(contact =>
      contact.additionalFields.some(
        field => field.type === 'label' && field.value === label
      )
    );
  }

  // Get all labels used in contacts
  getAllLabels(): string[] {
    const labels = new Set<string>();
    this.getContacts().forEach(contact => {
      contact.additionalFields.forEach(field => {
        if (field.type === 'label' && field.value) {
          labels.add(field.value);
        }
      });
    });
    return Array.from(labels).sort();
  }

  // Private helper
  private saveAndUpdate(contacts: Contact[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(contacts));
    this.contactsSubject.next(contacts);
    this.updateFavorites();
  }

  private updateFavorites(): void {
    this.favoriteContactsSubject.next(this.getFavoriteContacts());
  }

  // Clear all
  clearAll(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.contactsSubject.next([]);
    this.favoriteContactsSubject.next([]);
  }
}
