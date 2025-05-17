export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export enum ItemType {
  TASK = 'TASK',
  EVENT = 'EVENT'
}

export abstract class AgendaItem {
  id?: number;
  title: string;
  description?: string;
  date: Date;
  priority: Priority;
  reminder?: Date;
  userId: number;
  categoryId?: number;
  createdAt: Date;
  updatedAt: Date;
  type: ItemType;

  constructor(data: Partial<AgendaItem>) {
    this.id = data.id;
    this.title = data.title || '';
    this.description = data.description;
    this.date = data.date || new Date();
    this.priority = data.priority || Priority.MEDIUM;
    this.reminder = data.reminder;
    this.userId = data.userId || 1; // Default user ID
    this.categoryId = data.categoryId;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.type = data.type || ItemType.TASK;
  }
}