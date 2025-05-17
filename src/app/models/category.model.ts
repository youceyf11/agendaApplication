export class Category {
  id?: number;
  name: string;
  color: string;
  userId: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<Category>) {
    this.id = data.id;
    this.name = data.name || '';
    this.color = data.color || '#3B82F6'; // Default blue color
    this.userId = data.userId || 1; // Default user ID
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }
}