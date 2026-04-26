export interface AdditionalField {
  id: string;
  type: 'phone' | 'email' | 'address' | 'birthday' | 'label' | 'custom';
  label: string;
  value: string;
  customFieldName?: string;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  company?: string;
  notes?: string;
  profileImage?: string; // Base64 or URL
  additionalFields: AdditionalField[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SortBy = 'name-asc' | 'name-desc' | 'date-asc' | 'date-desc';
