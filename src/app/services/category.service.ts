import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Category } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private LOCAL_STORAGE_KEY = 'categories';
  
  private categoriesSubject = new BehaviorSubject<Category[]>(this.getCategoriesFromLocalStorage());
  public categories$ = this.categoriesSubject.asObservable();
  
  constructor() {
    if (this.categoriesSubject.value.length === 0) {
      // Add default categories
      this.initDefaultCategories();
    }
  }
  
  private getCategoriesFromLocalStorage(): Category[] {
    const categories = localStorage.getItem(this.LOCAL_STORAGE_KEY);
    if (!categories) {
      return [];
    }
    
    const parsedCategories = JSON.parse(categories);
    return parsedCategories.map((category: any) => new Category({
      ...category,
      createdAt: new Date(category.createdAt),
      updatedAt: new Date(category.updatedAt)
    }));
  }
  
  private saveCategoriesToLocalStorage(categories: Category[]) {
    localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(categories));
  }
  
  getCategories(): Observable<Category[]> {
    return this.categories$;
  }
  
  getCategoryById(id: number): Observable<Category | undefined> {
    return of(this.categoriesSubject.value.find(category => category.id === id));
  }
  
  addCategory(category: Partial<Category>): Observable<Category> {
    const categories = this.categoriesSubject.value;
    const newId = categories.length > 0 ? Math.max(...categories.map(c => c.id || 0)) + 1 : 1;
    
    const newCategory = new Category({
      ...category,
      id: newId,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const updatedCategories = [...categories, newCategory];
    this.categoriesSubject.next(updatedCategories);
    this.saveCategoriesToLocalStorage(updatedCategories);
    
    return of(newCategory);
  }
  
  updateCategory(id: number, updates: Partial<Category>): Observable<Category | undefined> {
    const categories = this.categoriesSubject.value;
    const index = categories.findIndex(c => c.id === id);
    
    if (index === -1) {
      return of(undefined);
    }
    
    const updatedCategory = new Category({
      ...categories[index],
      ...updates,
      updatedAt: new Date()
    });
    
    const updatedCategories = [...categories];
    updatedCategories[index] = updatedCategory;
    
    this.categoriesSubject.next(updatedCategories);
    this.saveCategoriesToLocalStorage(updatedCategories);
    
    return of(updatedCategory);
  }
  
  deleteCategory(id: number): Observable<boolean> {
    const categories = this.categoriesSubject.value;
    const updatedCategories = categories.filter(c => c.id !== id);
    
    this.categoriesSubject.next(updatedCategories);
    this.saveCategoriesToLocalStorage(updatedCategories);
    
    return of(true);
  }
  
  private initDefaultCategories() {
    const defaultCategories = [
      new Category({
        id: 1,
        name: 'Work',
        color: '#3B82F6', // Blue
        userId: 1
      }),
      new Category({
        id: 2,
        name: 'Personal',
        color: '#F97316', // Orange
        userId: 1
      }),
      new Category({
        id: 3,
        name: 'Health',
        color: '#10B981', // Green
        userId: 1
      }),
      new Category({
        id: 4,
        name: 'Family',
        color: '#EC4899', // Pink
        userId: 1
      })
    ];
    
    this.categoriesSubject.next(defaultCategories);
    this.saveCategoriesToLocalStorage(defaultCategories);
  }
}