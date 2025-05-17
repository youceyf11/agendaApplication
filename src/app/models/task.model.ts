import { AgendaItem, ItemType, Priority } from './agenda-item.model';

export class Task extends AgendaItem {
  deadline?: Date;
  completed: boolean;

  constructor(data: Partial<Task>) {
    super({
      ...data,
      type: ItemType.TASK
    });
    this.deadline = data.deadline;
    this.completed = data.completed || false;
  }
}