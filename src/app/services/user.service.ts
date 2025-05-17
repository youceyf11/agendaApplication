import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private LOCAL_STORAGE_KEY = 'current_user';
  
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromLocalStorage());
  public currentUser$ = this.currentUserSubject.asObservable();
  
  constructor() {
    if (!this.currentUserSubject.value) {
      // Create a default user if none exists
      this.setCurrentUser(new User({
        id: 1,
        username: 'default',
        email: 'user@example.com',
        firstName: 'Default',
        lastName: 'User'
      }));
    }
  }
  
  private getUserFromLocalStorage(): User | null {
    const userData = localStorage.getItem(this.LOCAL_STORAGE_KEY);
    if (!userData) {
      return null;
    }
    
    const user = JSON.parse(userData);
    return new User({
      ...user,
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt)
    });
  }
  
  private saveUserToLocalStorage(user: User) {
    localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(user));
  }
  
  getCurrentUser(): Observable<User | null> {
    return this.currentUser$;
  }
  
  setCurrentUser(user: User) {
    this.currentUserSubject.next(user);
    this.saveUserToLocalStorage(user);
  }
  
  updateUser(updates: Partial<User>): Observable<User | null> {
    const currentUser = this.currentUserSubject.value;
    if (!currentUser) {
      return of(null);
    }
    
    const updatedUser = new User({
      ...currentUser,
      ...updates,
      updatedAt: new Date()
    });
    
    this.currentUserSubject.next(updatedUser);
    this.saveUserToLocalStorage(updatedUser);
    
    return of(updatedUser);
  }
  
  logout(): Observable<boolean> {
    this.currentUserSubject.next(null);
    localStorage.removeItem(this.LOCAL_STORAGE_KEY);
    return of(true);
  }
}