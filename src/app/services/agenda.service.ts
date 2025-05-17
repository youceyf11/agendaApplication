import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AgendaItem, Priority, ItemType } from '../models/agenda-item.model';
import { Task } from '../models/task.model';
import { Event } from '../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class AgendaService {
  // API Url - would be connected to Spring Boot backend
  private apiUrl = 'http://localhost:8080/api/items';
  
  // Local storage for offline mode or development
  private LOCAL_STORAGE_KEY = 'agenda_items';
  
  // Observable source for agenda items
  private agendaItemsSubject = new BehaviorSubject<AgendaItem[]>(this.getItemsFromLocalStorage());
  public agendaItems$ = this.agendaItemsSubject.asObservable();
  
  constructor(private http: HttpClient) {
    this.loadItems();
  }
  
  private getItemsFromLocalStorage(): AgendaItem[] {
    const items = localStorage.getItem(this.LOCAL_STORAGE_KEY);
    
    if (!items) {
      return this.generateMockData();
    }
    
    const parsedItems = JSON.parse(items);
    return parsedItems.map((item: any) => {
      const base = {
        ...item,
        date: new Date(item.date),
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
        reminder: item.reminder ? new Date(item.reminder) : undefined
      };
      
      if (item.type === ItemType.TASK) {
        return new Task({
          ...base,
          deadline: item.deadline ? new Date(item.deadline) : undefined
        });
      } else {
        return new Event({
          ...base,
          startTime: new Date(item.startTime),
          endTime: new Date(item.endTime)
        });
      }
    });
  }
  
  private saveItemsToLocalStorage(items: AgendaItem[]) {
    localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(items));
  }
  
  private loadItems() {
    // In a real app, we would load from API
    // this.http.get<AgendaItem[]>(this.apiUrl).subscribe(...)
    
    // For now, use local storage
    const items = this.getItemsFromLocalStorage();
    this.agendaItemsSubject.next(items);
  }
  
  getAllItems(): Observable<AgendaItem[]> {
    return this.agendaItems$;
  }
  
  getItemById(id: number): Observable<AgendaItem | undefined> {
    return this.agendaItems$.pipe(
      map(items => items.find(item => item.id === id))
    );
  }
  
  getItemsByDate(date: Date): Observable<AgendaItem[]> {
    return this.agendaItems$.pipe(
      map(items => items.filter(item => 
        item.date.getFullYear() === date.getFullYear() &&
        item.date.getMonth() === date.getMonth() &&
        item.date.getDate() === date.getDate()
      ))
    );
  }
  
  getItemsByDateRange(start: Date, end: Date): Observable<AgendaItem[]> {
    return this.agendaItems$.pipe(
      map(items => items.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= start && itemDate <= end;
      }))
    );
  }
  
  getItemsByType(type: ItemType): Observable<AgendaItem[]> {
    return this.agendaItems$.pipe(
      map(items => items.filter(item => item.type === type))
    );
  }
  
  getItemsByPriority(priority: Priority): Observable<AgendaItem[]> {
    return this.agendaItems$.pipe(
      map(items => items.filter(item => item.priority === priority))
    );
  }
  
  addItem(item: AgendaItem): Observable<AgendaItem> {
    // Generate an ID for the new item
    const items = this.agendaItemsSubject.value;
    const newId = items.length > 0 ? Math.max(...items.map(i => i.id || 0)) + 1 : 1;
    
    const newItem = { ...item, id: newId, createdAt: new Date(), updatedAt: new Date() };
    
    // Add to local list
    const updatedItems = [...items, newItem];
    this.agendaItemsSubject.next(updatedItems);
    this.saveItemsToLocalStorage(updatedItems);
    
    // In real app, would call API
    // return this.http.post<AgendaItem>(this.apiUrl, newItem);
    return of(newItem);
  }
  
  updateItem(id: number, updates: Partial<AgendaItem>): Observable<AgendaItem> {
    const items = this.agendaItemsSubject.value;
    const index = items.findIndex(item => item.id === id);
    
    if (index === -1) {
      return of(undefined as unknown as AgendaItem);
    }
    
    const updatedItem = { ...items[index], ...updates, updatedAt: new Date() };
    const updatedItems = [...items];
    updatedItems[index] = updatedItem;
    
    this.agendaItemsSubject.next(updatedItems);
    this.saveItemsToLocalStorage(updatedItems);
    
    // In real app, would call API
    // return this.http.put<AgendaItem>(`${this.apiUrl}/${id}`, updatedItem);
    return of(updatedItem);
  }
  
  deleteItem(id: number): Observable<boolean> {
    const items = this.agendaItemsSubject.value;
    const updatedItems = items.filter(item => item.id !== id);
    
    this.agendaItemsSubject.next(updatedItems);
    this.saveItemsToLocalStorage(updatedItems);
    
    // In real app, would call API
    // return this.http.delete(`${this.apiUrl}/${id}`).pipe(map(() => true));
    return of(true);
  }
  
  // Generate mock data for development
  private generateMockData(): AgendaItem[] {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const task1 = new Task({
      id: 1,
      title: 'Complete project proposal',
      description: 'Finish the first draft of the project proposal',
      date: today,
      priority: Priority.HIGH,
      deadline: tomorrow,
      completed: false,
      userId: 1
    });
    
    const task2 = new Task({
      id: 2,
      title: 'Buy groceries',
      description: 'Milk, eggs, bread, and vegetables',
      date: today,
      priority: Priority.MEDIUM,
      deadline: tomorrow,
      completed: true,
      userId: 1
    });
    
    const event1 = new Event({
      id: 3,
      title: 'Team meeting',
      description: 'Weekly team sync-up',
      date: tomorrow,
      startTime: new Date(tomorrow.setHours(10, 0, 0, 0)),
      endTime: new Date(tomorrow.setHours(11, 0, 0, 0)),
      priority: Priority.HIGH,
      location: 'Conference Room A',
      userId: 1
    });
    
    const event2 = new Event({
      id: 4,
      title: 'Dentist appointment',
      date: nextWeek,
      startTime: new Date(nextWeek.setHours(14, 0, 0, 0)),
      endTime: new Date(nextWeek.setHours(15, 0, 0, 0)),
      priority: Priority.MEDIUM,
      location: 'Dental Clinic',
      userId: 1
    });
    
    return [task1, task2, event1, event2];
  }
}