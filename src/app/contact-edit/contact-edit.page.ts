import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Contact, AdditionalField } from '../models/contact.model';
import { ContactService } from '../services/contact.service';
import { LabelService } from '../services/label.service';
import { SidebarService } from '../services/sidebar.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface FieldOption {
  type: 'phone' | 'email' | 'address' | 'birthday' | 'label' | 'custom';
  label: string;
  placeholder: string;
}

@Component({
  selector: 'app-contact-edit',
  templateUrl: './contact-edit.page.html',
  styleUrls: ['./contact-edit.page.scss'],
  standalone: false,
})
export class ContactEditPage implements OnInit, OnDestroy {
  contactForm: FormGroup;
  contact: Contact | null = null;
  contactId: string | null = null;
  additionalFields: AdditionalField[] = [];
  profileImageUrl: string | null = null;
  profileImageBase64: string | null = null;
  selectedLabels: Set<string> = new Set();
  selectedLabelsArray: string[] = [];
  availableLabels: string[] = [];

  // Modal States
  isLabelModalOpen: boolean = false;
  isInfoModalOpen: boolean = false;
  labelSearchQuery: string = '';
  filteredLabels: string[] = [];

  private destroy$ = new Subject<void>();

  private fieldOptions: FieldOption[] = [
    { type: 'phone', label: 'Telepon', placeholder: 'Masukkan nomor telepon' },
    { type: 'email', label: 'Email', placeholder: 'Masukkan email' },
    { type: 'address', label: 'Alamat', placeholder: 'Masukkan alamat' },
    { type: 'birthday', label: 'Ulang Tahun', placeholder: 'Pilih tanggal' },
  ];

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private contactService: ContactService,
    private labelService: LabelService,
    private alertController: AlertController,
    private sidebarService: SidebarService
  ) {
    this.contactForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: [''],
      company: [''],
      notes: [''],
    });
  }

  ngOnInit() {
    this.contactId = this.route.snapshot.paramMap.get('id');
    if (this.contactId) {
      this.loadContact();
    }
  }

  loadAvailableLabels(): void {
    this.availableLabels = this.labelService.getAllLabels();
    this.filterLabels();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadContact(): void {
    if (this.contactId) {
      this.contactService.contacts$
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.contact = this.contactService.getContactById(this.contactId!) || null;
          if (this.contact) {
            this.contactForm.patchValue({
              firstName: this.contact.firstName,
              lastName: this.contact.lastName,
              company: this.contact.company || '',
              notes: this.contact.notes || '',
            });
            this.profileImageUrl = this.contact.profileImage || null;
            this.profileImageBase64 = this.contact.profileImage || null;

            this.additionalFields = this.contact.additionalFields
              .filter(field => field.type !== 'label')
              .map(field => ({ ...field }));

            this.selectedLabels.clear();
            this.contact.additionalFields
              .filter(field => field.type === 'label')
              .forEach(field => this.selectedLabels.add(field.value));
            this.updateSelectedLabelsArray();
            this.loadAvailableLabels();
          }
        });
    }
  }

  // Modal Handlers
  filterLabels(): void {
    const query = this.labelSearchQuery.toLowerCase().trim();
    this.filteredLabels = this.availableLabels.filter(l =>
      l.toLowerCase().includes(query)
    );
  }

  toggleLabelInModal(label: string): void {
    if (this.selectedLabels.has(label)) {
      this.selectedLabels.delete(label);
    } else {
      this.selectedLabels.add(label);
    }
    this.updateSelectedLabelsArray();
  }

  createAndAddLabel(): void {
    const newLabel = this.labelSearchQuery.trim();
    if (newLabel && !this.availableLabels.includes(newLabel)) {
      this.availableLabels.push(newLabel);
      this.availableLabels.sort();
      this.selectedLabels.add(newLabel);
      this.updateSelectedLabelsArray();
      this.labelSearchQuery = '';
      this.filterLabels();
    }
  }

  openLabelModal(): void {
    this.loadAvailableLabels();
    this.labelSearchQuery = '';
    this.isLabelModalOpen = true;
  }

  closeLabelModal(): void {
    this.isLabelModalOpen = false;
  }

  openInfoModal(): void {
    this.isInfoModalOpen = true;
  }

  closeInfoModal(): void {
    this.isInfoModalOpen = false;
  }

  selectInfoType(type: any): void {
    if (type === 'custom') {
      this.addCustomField();
    } else {
      this.addField(type);
    }
    this.closeInfoModal();
  }

  private updateSelectedLabelsArray(): void {
    this.selectedLabelsArray = Array.from(this.selectedLabels);
  }

  onImageSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileImageUrl = e.target.result;
        this.profileImageBase64 = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  isFormValid(): boolean {
    const firstName = this.contactForm.get('firstName')?.value?.trim() || '';
    return firstName.length > 0;
  }

  getFieldLabel(type: string, customName?: string): string {
    if (type === 'custom' && customName) return customName;
    const option = this.fieldOptions.find(f => f.type === type);
    return option?.label || type;
  }

  getFieldPlaceholder(type: string): string {
    const option = this.fieldOptions.find(f => f.type === type);
    return option?.placeholder || '';
  }

  private addField(type: 'phone' | 'email' | 'address' | 'birthday'): void {
    this.additionalFields.push({
      id: Date.now().toString(),
      type,
      label: this.getFieldLabel(type),
      value: '',
    });
  }

  private async addCustomField(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Field Kustom',
      inputs: [{ name: 'fieldName', type: 'text', placeholder: 'Misal: Jabatan' }],
      buttons: [
        { text: 'Batal', role: 'cancel' },
        {
          text: 'Tambah',
          handler: (data) => {
            if (data.fieldName?.trim()) {
              this.additionalFields.push({
                id: Date.now().toString(),
                type: 'custom',
                label: data.fieldName.trim(),
                value: '',
                customFieldName: data.fieldName.trim(),
              });
            }
          }
        }
      ]
    });
    await alert.present();
  }

  removeField(index: number): void {
    this.additionalFields.splice(index, 1);
  }

  updateContact(): void {
    if (!this.isFormValid() || !this.contactId) return;

    const fields = [...this.additionalFields];
    this.selectedLabels.forEach((label, i) => {
      fields.push({ id: `label-${Date.now()}-${i}`, type: 'label', label: 'Label', value: label });
    });

    this.contactService.updateContact(this.contactId, {
      firstName: this.contactForm.get('firstName')?.value.trim(),
      lastName: this.contactForm.get('lastName')?.value.trim(),
      company: this.contactForm.get('company')?.value || '',
      notes: this.contactForm.get('notes')?.value || '',
      profileImage: this.profileImageBase64 || undefined,
      additionalFields: fields,
    });
    this.router.navigate(['/contact-detail', this.contactId]);
  }

  cancel(): void {
    this.router.navigate(['/contact-detail', this.contactId]);
  }
}
