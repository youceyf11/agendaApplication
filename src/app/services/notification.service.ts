import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Notification, NotificationStatus } from '../models/notification.model';
import { AgendaItem } from '../models/agenda-item.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private LOCAL_STORAGE_KEY = 'notifications';
  
  private notificationsSubject = new BehaviorSubject<Notification[]>(this.getNotificationsFromLocalStorage());
  public notifications$ = this.notificationsSubject.asObservable();
  
  private reminderInterval: any;
  
  constructor() {
    this.checkForDueReminders();
    
    // Check for reminders every minute
    this.reminderInterval = setInterval(() => {
      this.checkForDueReminders();
    }, 60000);
  }
  
  private getNotificationsFromLocalStorage(): Notification[] {
    const notifications = localStorage.getItem(this.LOCAL_STORAGE_KEY);
    if (!notifications) {
      return [];
    }
    
    const parsedNotifications = JSON.parse(notifications);
    return parsedNotifications.map((notification: any) => ({
      ...notification,
      scheduledTime: new Date(notification.scheduledTime),
      createdAt: new Date(notification.createdAt),
      updatedAt: new Date(notification.updatedAt)
    }));
  }
  
  private saveNotificationsToLocalStorage(notifications: Notification[]) {
    localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(notifications));
  }
  
  getNotifications(): Observable<Notification[]> {
    return this.notifications$;
  }
  
  getUnreadNotifications(): Observable<Notification[]> {
    return of(this.notificationsSubject.value.filter(
      notification => notification.status !== NotificationStatus.READ
    ));
  }
  
  createNotification(agendaItem: AgendaItem, reminderTime: Date): Observable<Notification> {
    const notifications = this.notificationsSubject.value;
    const newId = notifications.length > 0 ? Math.max(...notifications.map(n => n.id || 0)) + 1 : 1;
    
    const notification = new Notification({
      id: newId,
      agendaItemId: agendaItem.id || 0,
      userId: agendaItem.userId,
      message: `Reminder: ${agendaItem.title}`,
      scheduledTime: reminderTime,
      status: NotificationStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const updatedNotifications = [...notifications, notification];
    this.notificationsSubject.next(updatedNotifications);
    this.saveNotificationsToLocalStorage(updatedNotifications);
    
    return of(notification);
  }
  
  markAsRead(id: number): Observable<boolean> {
    const notifications = this.notificationsSubject.value;
    const index = notifications.findIndex(n => n.id === id);
    
    if (index === -1) {
      return of(false);
    }
    
    const updatedNotification = {
      ...notifications[index],
      status: NotificationStatus.READ,
      updatedAt: new Date()
    };
    
    const updatedNotifications = [...notifications];
    updatedNotifications[index] = updatedNotification;
    
    this.notificationsSubject.next(updatedNotifications);
    this.saveNotificationsToLocalStorage(updatedNotifications);
    
    return of(true);
  }
  
  markAllAsRead(): Observable<boolean> {
    const notifications = this.notificationsSubject.value;
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      status: NotificationStatus.READ,
      updatedAt: new Date()
    }));
    
    this.notificationsSubject.next(updatedNotifications);
    this.saveNotificationsToLocalStorage(updatedNotifications);
    
    return of(true);
  }
  
  deleteNotification(id: number): Observable<boolean> {
    const notifications = this.notificationsSubject.value;
    const updatedNotifications = notifications.filter(n => n.id !== id);
    
    this.notificationsSubject.next(updatedNotifications);
    this.saveNotificationsToLocalStorage(updatedNotifications);
    
    return of(true);
  }
  
  private checkForDueReminders() {
    const now = new Date();
    const notifications = this.notificationsSubject.value;
    let hasUpdates = false;
    
    const updatedNotifications = notifications.map(notification => {
      if (notification.status === NotificationStatus.PENDING && 
          notification.scheduledTime <= now) {
        this.showNotification(notification);
        hasUpdates = true;
        return {
          ...notification,
          status: NotificationStatus.DELIVERED,
          updatedAt: new Date()
        };
      }
      return notification;
    });
    
    if (hasUpdates) {
      this.notificationsSubject.next(updatedNotifications);
      this.saveNotificationsToLocalStorage(updatedNotifications);
    }
  }

  private showNotification(notification: Notification) {
    // Vérifie si les notifications sont supportées
    if ('Notification' in window) {
      (window as any).Notification.requestPermission().then((permission: NotificationPermission) => {
        if (permission === 'granted') {
          new (window as any).Notification(notification.message);
        } else {
          alert(notification.message);
        }
      });
    } else {
      alert(notification.message);
    }
  }
  
  ngOnDestroy() {
    if (this.reminderInterval) {
      clearInterval(this.reminderInterval);
    }
  }
}