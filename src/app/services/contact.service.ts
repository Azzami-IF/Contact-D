import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Contact, SortBy } from '../models/contact.model';
import { Preferences } from '@capacitor/preferences';

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

  constructor() {
    this.loadFromStorage();
  }

  // Load dari Capacitor Preferences (Lebih stabil dari localStorage)
  private async loadFromStorage(): Promise<void> {
    const { value } = await Preferences.get({ key: this.STORAGE_KEY });
    if (value) {
      const contacts = JSON.parse(value);
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

  // Public helper for import
  importContactsData(contacts: Contact[]): void {
    this.saveAndUpdate(contacts);
  }

  // Private helper
  private async saveAndUpdate(contacts: Contact[]): Promise<void> {
    await Preferences.set({
      key: this.STORAGE_KEY,
      value: JSON.stringify(contacts),
    });
    this.contactsSubject.next(contacts);
    this.updateFavorites();
  }

  private updateFavorites(): void {
    this.favoriteContactsSubject.next(this.getFavoriteContacts());
  }

  // Clear all
  async clearAll(): Promise<void> {
    await Preferences.remove({ key: this.STORAGE_KEY });
    this.contactsSubject.next([]);
    this.favoriteContactsSubject.next([]);
  }
}
