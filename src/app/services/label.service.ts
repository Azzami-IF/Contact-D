import { Injectable } from '@angular/core';
import { ContactService } from './contact.service';
import { Contact } from '../models/contact.model';

export interface LabelInfo {
  name: string;
  count: number;
  color?: string;
}

@Injectable({
  providedIn: 'root',
})
export class LabelService {
  constructor(private contactService: ContactService) {}

  /**
   * Get all unique labels from all contacts
   */
  getAllLabels(): string[] {
    const allLabels = new Set<string>();
    const contacts = this.contactService.getContacts();

    contacts.forEach(contact => {
      contact.additionalFields.forEach(field => {
        if (field.type === 'label' && field.value) {
          allLabels.add(field.value);
        }
      });
    });

    return Array.from(allLabels).sort();
  }

  /**
   * Get label info with count
   */
  getLabelInfo(): LabelInfo[] {
    const labels = this.getAllLabels();
    return labels.map(label => ({
      name: label,
      count: this.getContactsWithLabel(label).length,
      color: this.getLabelColor(label),
    }));
  }

  /**
   * Get all contacts that have a specific label
   */
  getContactsWithLabel(labelName: string): Contact[] {
    return this.contactService.getContacts().filter(contact =>
      contact.additionalFields.some(
        field => field.type === 'label' && field.value === labelName
      )
    );
  }

  /**
   * Add label to contact
   */
  addLabelToContact(contactId: string, labelName: string): void {
    const contact = this.contactService.getContactById(contactId);
    if (!contact) return;

    // Check if label already exists
    const hasLabel = contact.additionalFields.some(
      field => field.type === 'label' && field.value === labelName
    );

    if (!hasLabel && labelName.trim()) {
      contact.additionalFields.push({
        id: `label-${Date.now()}`,
        type: 'label',
        label: 'Label',
        value: labelName.trim(),
      });
      this.contactService.updateContact(contactId, { additionalFields: contact.additionalFields });
    }
  }

  /**
   * Remove label from contact
   */
  removeLabelFromContact(contactId: string, labelName: string): void {
    const contact = this.contactService.getContactById(contactId);
    if (!contact) return;

    contact.additionalFields = contact.additionalFields.filter(
      field => !(field.type === 'label' && field.value === labelName)
    );
    this.contactService.updateContact(contactId, { additionalFields: contact.additionalFields });
  }

  /**
   * Get labels for specific contact
   */
  getContactLabels(contactId: string): string[] {
    const contact = this.contactService.getContactById(contactId);
    if (!contact) return [];

    return contact.additionalFields
      .filter(field => field.type === 'label')
      .map(field => field.value)
      .sort();
  }

  /**
   * Delete label from all contacts
   */
  deleteLabel(labelName: string): void {
    const contacts = this.getContactsWithLabel(labelName);

    contacts.forEach(contact => {
      contact.additionalFields = contact.additionalFields.filter(
        field => !(field.type === 'label' && field.value === labelName)
      );
      this.contactService.updateContact(contact.id, { additionalFields: contact.additionalFields });
    });
  }

  /**
   * Rename label across all contacts
   */
  renameLabel(oldName: string, newName: string): void {
    const contacts = this.getContactsWithLabel(oldName);

    contacts.forEach(contact => {
      contact.additionalFields = contact.additionalFields.map(field => {
        if (field.type === 'label' && field.value === oldName) {
          return { ...field, value: newName };
        }
        return field;
      });
      this.contactService.updateContact(contact.id, { additionalFields: contact.additionalFields });
    });
  }

  /**
   * Get color for label (optional - can be extended)
   */
  private getLabelColor(label: string): string {
    const colors = [
      '#427AB5', '#E74C3C', '#2ECC71', '#F39C12',
      '#9B59B6', '#1ABC9C', '#34495E', '#E67E22',
    ];
    const hash = label.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }
}
