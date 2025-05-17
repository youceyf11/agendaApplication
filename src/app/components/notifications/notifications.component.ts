import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../../services/notification.service';
import { Notification, NotificationStatus } from '../../models/notification.model';
import { DatePipe, NgIf, NgFor } from '@angular/common';

@Component({
    selector: 'app-notifications',
    templateUrl: './notifications.component.html',
    standalone: true,
    imports: [
        DatePipe,
        NgIf,
        NgFor
    ],
    styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  showPanel = false;
  
  constructor(private notificationService: NotificationService) { }
  
  ngOnInit(): void {
    this.loadNotifications();
  }
  
  loadNotifications(): void {
    this.notificationService.getNotifications().subscribe(notifications => {
      this.notifications = notifications;
    });
  }
  
  togglePanel(): void {
    this.showPanel = !this.showPanel;
  }
  
  markAsRead(id: number): void {
    this.notificationService.markAsRead(id).subscribe(() => {
      this.loadNotifications();
    });
  }
  
  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe(() => {
      this.loadNotifications();
    });
  }
  
  deleteNotification(id: number): void {
    this.notificationService.deleteNotification(id).subscribe(() => {
      this.loadNotifications();
    });
  }
  
  getUnreadCount(): number {
    return this.notifications.filter(n => n.status !== NotificationStatus.READ).length;
  }
  
  getStatusClass(status: NotificationStatus): string {
    switch (status) {
      case NotificationStatus.PENDING:
        return 'status-pending';
      case NotificationStatus.DELIVERED:
        return 'status-delivered';
      case NotificationStatus.READ:
        return 'status-read';
      default:
        return '';
    }
  }
}