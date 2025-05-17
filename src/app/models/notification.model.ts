import { AgendaItem } from './agenda-item.model';

export enum NotificationStatus {
  PENDING = 'PENDING',
  DELIVERED = 'DELIVERED',
  READ = 'READ'
}

export class Notification {
  id?: number;
  agendaItemId: number;
  userId: number;
  message: string;
  scheduledTime: Date;
  status: NotificationStatus;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<Notification>) {
    this.id = data.id;
    this.agendaItemId = data.agendaItemId || 0;
    this.userId = data.userId || 1; // Default user ID
    this.message = data.message || '';
    this.scheduledTime = data.scheduledTime || new Date();
    this.status = data.status || NotificationStatus.PENDING;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }
}