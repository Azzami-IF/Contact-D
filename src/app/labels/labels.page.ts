import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { LabelService } from '../services/label.service';
import { ContactService } from '../services/contact.service';
import { SidebarService } from '../services/sidebar.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface LabelInfo {
  label: string;
  count: number;
}

@Component({
  selector: 'app-labels',
  templateUrl: './labels.page.html',
  styleUrls: ['./labels.page.scss'],
  standalone: false,
})
export class LabelsPage implements OnInit, OnDestroy {
  labels: LabelInfo[] = [];
  displayedLabels: LabelInfo[] = [];
  searchQuery: string = '';
  showSearchBar: boolean = false;
  private destroy$ = new Subject<void>();

  private labelService = inject(LabelService);
  private contactService = inject(ContactService);
  private router = inject(Router);
  private alertController = inject(AlertController);
  private sidebarService = inject(SidebarService);

  constructor() {}

  openMenu(): void {
    this.sidebarService.openSidebar();
  }

  ngOnInit() {
    this.contactService.contacts$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateLabels();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleSearchBar(): void {
    this.showSearchBar = !this.showSearchBar;
    if (!this.showSearchBar) {
      this.searchQuery = '';
      this.onSearch();
    }
  }

  onSearch(): void {
    this.updateDisplayedLabels();
  }

  private updateLabels(): void {
    const allLabels = this.labelService.getAllLabels();
    this.labels = allLabels.map(label => ({
      label,
      count: this.labelService.getContactsWithLabel(label).length,
    }));
    this.updateDisplayedLabels();
  }

  private updateDisplayedLabels(): void {
    let filtered = this.labels;

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.label.toLowerCase().includes(query)
      );
    }

    this.displayedLabels = filtered;
  }

  async deleteLabel(labelName: string): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Hapus Label',
      message: `Apakah Anda yakin ingin menghapus label "${labelName}"? Label akan dihapus dari semua kontak.`,
      buttons: [
        {
          text: 'Batal',
          role: 'cancel',
        },
        {
          text: 'Hapus',
          role: 'destructive',
          handler: () => {
            this.removeLabel(labelName);
          },
        },
      ],
    });

    await alert.present();
  }

  private removeLabel(labelName: string): void {
    this.labelService.deleteLabel(labelName);
    this.updateLabels();
  }

  viewLabelDetails(labelName: string): void {
    this.router.navigate(['/label-detail', encodeURIComponent(labelName)]);
  }
}
