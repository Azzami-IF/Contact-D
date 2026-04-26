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
      lastName: ['', Validators.required],
      company: [''],
      notes: [''],
    });
  }

  openMenu(): void {
    this.sidebarService.openSidebar();
  }

  ngOnInit() {
    this.availableLabels = this.labelService.getAllLabels();
    this.contactId = this.route.snapshot.paramMap.get('id');
    if (this.contactId) {
      this.loadContact();
    }
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
            
            // Separate labels from other fields
            this.additionalFields = this.contact.additionalFields
              .filter(field => field.type !== 'label')
              .map(field => ({ ...field }));
            
            // Load selected labels
            this.selectedLabels.clear();
            this.contact.additionalFields
              .filter(field => field.type === 'label')
              .forEach(field => this.selectedLabels.add(field.value));
            this.updateSelectedLabelsArray();
          }
        });
    }
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
    const lastName = this.contactForm.get('lastName')?.value?.trim() || '';
    return firstName.length > 0 || lastName.length > 0;
  }

  getFieldLabel(type: string, customName?: string): string {
    if (type === 'custom' && customName) {
      return customName;
    }
    const option = this.fieldOptions.find(f => f.type === type);
    return option?.label || type;
  }

  getFieldPlaceholder(type: string): string {
    const option = this.fieldOptions.find(f => f.type === type);
    return option?.placeholder || '';
  }

  async showAddFieldMenu(): Promise<void> {
    const buttons = this.fieldOptions.map(option => ({
      text: option.label,
      handler: () => {
        this.addField(option.type as any);
      },
    }));

    buttons.push({
      text: 'Lainnya (Custom)',
      handler: () => {
        this.addCustomField();
      },
    });

    const alert = await this.alertController.create({
      header: 'Tambahkan Info Lain',
      buttons: [
        ...buttons,
        {
          text: 'Batal',
          role: 'cancel',
        },
      ],
    });

    await alert.present();
  }

  private addField(type: 'phone' | 'email' | 'address' | 'birthday' | 'label'): void {
    const newField: AdditionalField = {
      id: Date.now().toString(),
      type,
      label: this.getFieldLabel(type),
      value: '',
    };
    this.additionalFields.push(newField);
  }

  private async addCustomField(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Tambah Field Custom',
      inputs: [
        {
          name: 'fieldName',
          type: 'text',
          placeholder: 'Nama field (e.g., Jabatan, Dept)',
        },
      ],
      buttons: [
        {
          text: 'Batal',
          role: 'cancel',
        },
        {
          text: 'Tambah',
          handler: (data) => {
            if (data.fieldName && data.fieldName.trim()) {
              const newField: AdditionalField = {
                id: Date.now().toString(),
                type: 'custom',
                label: data.fieldName,
                value: '',
                customFieldName: data.fieldName,
              };
              this.additionalFields.push(newField);
            }
          },
        },
      ],
    });

    await alert.present();
  }

  removeField(index: number): void {
    this.additionalFields.splice(index, 1);
  }

  // Label Management
  toggleLabel(label: string): void {
    if (this.selectedLabels.has(label)) {
      this.selectedLabels.delete(label);
    } else {
      this.selectedLabels.add(label);
    }
    this.updateSelectedLabelsArray();
  }

  private updateSelectedLabelsArray(): void {
    this.selectedLabelsArray = Array.from(this.selectedLabels);
  }

  hasLabel(label: string): boolean {
    return this.selectedLabels.has(label);
  }

  async showLabelSelector(): Promise<void> {
    const allLabels = this.availableLabels;
    const inputs = allLabels.map(label => ({
      name: label,
      type: 'checkbox',
      label: label,
      value: label,
      checked: this.selectedLabels.has(label),
    }));

    const alert = await this.alertController.create({
      header: 'Pilih Labels',
      message: 'Centang label yang ingin ditambahkan:',
      inputs: inputs as any,
      buttons: [
        {
          text: 'Tambah Label Baru',
          handler: () => {
            this.addNewLabel();
          },
        },
        {
          text: 'Batal',
          role: 'cancel',
        },
        {
          text: 'OK',
          handler: (data) => {
            this.selectedLabels.clear();
            if (Array.isArray(data)) {
              data.forEach(label => this.selectedLabels.add(label));
            }
            this.updateSelectedLabelsArray();
          },
        },
      ],
    });

    await alert.present();
  }

  private async addNewLabel(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Label Baru',
      inputs: [
        {
          name: 'labelName',
          type: 'text',
          placeholder: 'Masukkan nama label baru',
        },
      ],
      buttons: [
        {
          text: 'Batal',
          role: 'cancel',
        },
        {
          text: 'Tambah',
          handler: (data) => {
            if (data.labelName && data.labelName.trim()) {
              const newLabel = data.labelName.trim();
              if (!this.availableLabels.includes(newLabel)) {
                this.availableLabels.push(newLabel);
                this.availableLabels.sort();
              }
              this.selectedLabels.add(newLabel);
              this.updateSelectedLabelsArray();
            }
          },
        },
      ],
    });

    await alert.present();
  }

  updateContact(): void {
    if (!this.isFormValid() || !this.contactId) {
      return;
    }

    const fieldsWithLabels = [...this.additionalFields];
    
    // Add selected labels
    this.selectedLabels.forEach(label => {
      fieldsWithLabels.push({
        id: Date.now().toString(),
        type: 'label',
        label: 'Label',
        value: label,
      });
    });

    const updatedContact: Partial<Contact> = {
      firstName: this.contactForm.get('firstName')?.value.trim(),
      lastName: this.contactForm.get('lastName')?.value.trim(),
      company: this.contactForm.get('company')?.value || '',
      notes: this.contactForm.get('notes')?.value || '',
      profileImage: this.profileImageBase64 || undefined,
      additionalFields: fieldsWithLabels,
    };

    this.contactService.updateContact(this.contactId, updatedContact);
    this.router.navigate(['/contact-detail', this.contactId]);
  }

  cancel(): void {
    if (this.contactId) {
      this.router.navigate(['/contact-detail', this.contactId]);
    } else {
      this.router.navigate(['/home']);
    }
  }
}

