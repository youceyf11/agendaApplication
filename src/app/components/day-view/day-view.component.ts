import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AgendaService } from '../../services/agenda.service';
import { AgendaItem, ItemType, Priority } from '../../models/agenda-item.model';
import { Task } from '../../models/task.model';
import { Event } from '../../models/event.model';
import { format } from 'date-fns';
import { DatePipe, NgIf, NgFor } from '@angular/common';

@Component({
  selector: 'app-day-view',
  templateUrl: './day-view.component.html',
  styleUrls: ['./day-view.component.css'],
  standalone: true,
  imports: [
    DatePipe,
    NgIf,
    NgFor
  ]
})
export class DayViewComponent implements OnInit {
  @Input() selectedDate: Date = new Date();
  @Output() editItem = new EventEmitter<AgendaItem>();
  @Output() deleteItem = new EventEmitter<number>();
  
  agendaItems: AgendaItem[] = [];
  itemType = ItemType;
  
  constructor(private agendaService: AgendaService) { }
  
  ngOnInit(): void {
    this.loadItems();
  }
  
  ngOnChanges(): void {
    this.loadItems();
  }
  
  loadItems(): void {
    this.agendaService.getItemsByDate(this.selectedDate).subscribe(items => {
      this.agendaItems = items;
    });
  }
  
  getFormattedDate(): string {
    return format(this.selectedDate, 'EEEE, MMMM d, yyyy');
  }
  
  getFormattedTime(date?: Date): string {
    if (!date) return '';
    return format(date, 'h:mm a');
  }
  
  getPriorityClass(priority: Priority): string {
    switch (priority) {
      case Priority.HIGH:
        return 'priority-high';
      case Priority.MEDIUM:
        return 'priority-medium';
      case Priority.LOW:
        return 'priority-low';
      default:
        return '';
    }
  }
  
  onEdit(item: AgendaItem): void {
    this.editItem.emit(item);
  }
  
  onDelete(id: number): void {
    if (confirm('Are you sure you want to delete this item?')) {
      this.deleteItem.emit(id);
    }
  }
  
  onToggleComplete(task: Task): void {
    const updatedTask = new Task({
      ...task,
      completed: !task.completed
    });
    
    this.agendaService.updateItem(task.id!, updatedTask).subscribe(() => {
      this.loadItems();
    });
  }
  
  isTask(item: AgendaItem): boolean {
    return item.type === ItemType.TASK;
  }
  
  isEvent(item: AgendaItem): boolean {
    return item.type === ItemType.EVENT;
  }
  
  hasTasks(): boolean {
    return this.agendaItems.some(item => item.type === ItemType.TASK);
  }
  
  hasEvents(): boolean {
    return this.agendaItems.some(item => item.type === ItemType.EVENT);
  }
  
  getTasks(): Task[] {
    return this.agendaItems.filter(item => item.type === ItemType.TASK) as Task[];
  }
  
  getEvents(): Event[] {
    return this.agendaItems.filter(item => item.type === ItemType.EVENT) as Event[];
  }

    protected readonly Task = Task;
}