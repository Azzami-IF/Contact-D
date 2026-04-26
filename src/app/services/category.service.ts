import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly DEFAULT_CATEGORIES: string[] = [];
  private categories: string[] = [];
  private categoriesSubject = new BehaviorSubject<string[]>([]);
  public categories$ = this.categoriesSubject.asObservable();

  constructor() {
    this.loadCategories();
  }

  // Load categories from localStorage
  private loadCategories(): void {
    const stored = localStorage.getItem('categories');
    if (stored) {
      this.categories = JSON.parse(stored);
    } else {
      this.categories = [...this.DEFAULT_CATEGORIES];
      this.saveCategories();
    }
    this.categoriesSubject.next(this.categories);
  }

  // Save categories to localStorage
  private saveCategories(): void {
    localStorage.setItem('categories', JSON.stringify(this.categories));
    this.categoriesSubject.next(this.categories);
  }

  // Get all categories
  getCategories(): Observable<string[]> {
    return this.categories$;
  }

  // Get categories synchronously
  getCategoriesSync(): string[] {
    return this.categories;
  }

  // Add new category
  addCategory(category: string): boolean {
    const trimmed = category.trim();
    if (trimmed && !this.categories.includes(trimmed)) {
      this.categories.push(trimmed);
      this.saveCategories();
      return true;
    }
    return false;
  }

  // Delete category
  deleteCategory(category: string): boolean {
    const index = this.categories.indexOf(category);
    if (index !== -1) {
      this.categories.splice(index, 1);
      this.saveCategories();
      return true;
    }
    return false;
  }

  // Update category
  updateCategory(oldName: string, newName: string): boolean {
    const index = this.categories.indexOf(oldName);
    if (index !== -1 && !this.categories.includes(newName)) {
      this.categories[index] = newName;
      this.saveCategories();
      return true;
    }
    return false;
  }

  // Reset to default categories
  resetToDefault(): void {
    this.categories = [...this.DEFAULT_CATEGORIES];
    this.saveCategories();
  }
}
