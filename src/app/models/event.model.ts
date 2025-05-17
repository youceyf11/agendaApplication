import { AgendaItem, ItemType, Priority } from './agenda-item.model';

export class Event extends AgendaItem {
  startTime: Date;
  endTime: Date;
  location?: string;

  constructor(data: Partial<Event>) {
    super({
      ...data,
      type: ItemType.EVENT
    });
    this.startTime = data.startTime || new Date();
    this.endTime = data.endTime || new Date();
    this.location = data.location;
  }
}