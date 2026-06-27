import { Pipe, PipeTransform } from '@angular/core';
import { Contact } from '../models/contact.model';

@Pipe({
  name: 'extractLabels',
  pure: true
})
export class ExtractLabelsPipe implements PipeTransform {
  transform(contact: Contact): string[] {
    if (!contact || !contact.additionalFields) return [];
    return contact.additionalFields
      .filter(field => field.type === 'label')
      .map(field => field.value)
      .sort();
  }
}
