import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AgendaItem, Priority, ItemType } from '../../models/agenda-item.model';
import { Event } from '../../models/event.model';

@Component({
  selector: 'app-calendar-nav',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="calendar-nav">
      <div class="calendar-header">
        <button class="nav-btn" (click)="previousMonth()">
          <span class="material-icons">chevron_left</span>
        </button>
        <h2 class="current-month">{{getFormattedMonth()}}</h2>
        <button class="nav-btn" (click)="nextMonth()">
          <span class="material-icons">chevron_right</span>
        </button>
      </div>

      <div class="weekdays">
        <div *ngFor="let day of weekDays" class="weekday">{{day}}</div>
      </div>

      <div class="calendar-grid">
        <div *ngFor="let day of calendarDays" 
             class="calendar-day"
             [class.today]="isToday(day)"
             [class.selected]="isSelected(day)"
             [class.other-month]="!isSameMonth(day, currentDate)"
             (click)="selectDate(day)">
          <span class="day-number">{{getFormattedDay(day)}}</span>
          <div class="priority-indicators" *ngIf="getDayItems(day).length > 0">
            <div class="priority-dots">
              <div *ngFor="let priority of getPriorities(day)" 
                   class="priority-dot"
                   [class]="'priority-' + priority.toLowerCase()">
              </div>
            </div>
            <div class="item-count" *ngIf="getDayItems(day).length > 3">
              +{{getDayItems(day).length - 3}}
            </div>
          </div>
          
          <!-- Tooltip au survol -->
          <div class="day-tooltip" *ngIf="getDayItems(day).length > 0">
            <div class="tooltip-header">
              <span class="tooltip-date">{{getFormattedFullDate(day)}}</span>
              <span class="tooltip-count">{{getDayItems(day).length}} tâche(s)</span>
            </div>
            
            <div class="tooltip-content">
              <div class="priority-section" *ngFor="let priority of getPriorities(day)">
                <div class="priority-header" [class]="'priority-' + priority.toLowerCase()">
                  {{getPriorityLabel(priority)}}
                </div>
                <div class="priority-items">
                  <div *ngFor="let item of getItemsByPriority(day, priority)" class="tooltip-item">
                    <span class="item-title">{{item.title}}</span>
                    <span class="item-time" *ngIf="isEvent(item) && hasStartTime(item)">
                      {{formatEventTime(item)}}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .calendar-nav {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .calendar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.5rem;
    }

    .current-month {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e293b;
      text-transform: capitalize;
    }

    .nav-btn {
      background: none;
      border: none;
      color: #64748b;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 8px;
      transition: all 0.2s;
    }

    .nav-btn:hover {
      background: #f1f5f9;
      color: #334155;
    }

    .weekdays {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .weekday {
      text-align: center;
      font-size: 0.875rem;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
    }

    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 0.5rem;
    }

    .calendar-day {
      aspect-ratio: 1;
      padding: 0.5rem;
      border-radius: 12px;
      cursor: pointer;
      position: relative;
      transition: all 0.2s;
      display: flex;
      flex-direction: column;
      align-items: center;
      background: #f8fafc;
    }

    .calendar-day:hover {
      background: #f1f5f9;
      z-index: 10;
    }

    .calendar-day.today {
      background: #e0f2fe;
      font-weight: 600;
    }

    .calendar-day.selected {
      background: #2196f3;
      color: white;
    }

    .calendar-day.other-month {
      opacity: 0.5;
    }

    .day-number {
      font-size: 0.875rem;
      margin-bottom: 0.25rem;
    }

    .priority-indicators {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      width: 100%;
    }

    .priority-dots {
      display: flex;
      gap: 0.25rem;
      justify-content: center;
    }

    .priority-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }

    .priority-high {
      background: #ef4444;
    }

    .priority-medium {
      background: #f59e0b;
    }

    .priority-low {
      background: #10b981;
    }

    .item-count {
      font-size: 0.75rem;
      color: #64748b;
      background: #f1f5f9;
      padding: 0.125rem 0.375rem;
      border-radius: 999px;
    }

    .selected .item-count {
      color: white;
      background: rgba(255, 255, 255, 0.2);
    }

    /* Styles pour le tooltip */
    .day-tooltip {
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      padding: 1rem;
      width: 280px;
      opacity: 0;
      visibility: hidden;
      transition: all 0.2s;
      z-index: 100;
      margin-top: 0.5rem;
    }

    .calendar-day:hover .day-tooltip {
      opacity: 1;
      visibility: visible;
    }

    .tooltip-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .tooltip-date {
      font-weight: 600;
      color: #1e293b;
      text-transform: capitalize;
    }

    .tooltip-count {
      font-size: 0.75rem;
      color: #64748b;
      background: #f1f5f9;
      padding: 0.25rem 0.5rem;
      border-radius: 999px;
    }

    .tooltip-content {
      max-height: 200px;
      overflow-y: auto;
    }

    .priority-section {
      margin-bottom: 0.75rem;
    }

    .priority-header {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      margin-bottom: 0.5rem;
      color: white;
    }

    .priority-items {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .tooltip-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.875rem;
      padding: 0.25rem 0;
    }

    .item-title {
      color: #334155;
    }

    .item-time {
      color: #64748b;
      font-size: 0.75rem;
    }

    /* Flèche du tooltip */
    .day-tooltip::before {
      content: '';
      position: absolute;
      top: -6px;
      left: 50%;
      transform: translateX(-50%);
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-bottom: 6px solid white;
    }
  `]
})
export class CalendarNavComponent {
  @Input() selectedDate: Date = new Date();
  @Input() agendaItems: AgendaItem[] = [];
  @Output() dateSelected = new EventEmitter<Date>();

  currentDate = new Date();
  weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  ItemType = ItemType;

  get calendarDays(): Date[] {
    const start = startOfMonth(this.currentDate);
    const end = endOfMonth(this.currentDate);
    return eachDayOfInterval({ start, end });
  }

  getFormattedMonth(): string {
    return format(this.currentDate, 'MMMM yyyy', { locale: fr });
  }

  getFormattedDay(date: Date): string {
    return format(date, 'd');
  }

  getFormattedFullDate(date: Date): string {
    return format(date, 'EEEE d MMMM', { locale: fr });
  }

  getFormattedTime(time: Date): string {
    return format(time, 'HH:mm');
  }

  isEvent(item: AgendaItem): boolean {
    return item.type === ItemType.EVENT;
  }

  hasStartTime(item: AgendaItem): boolean {
    return this.isEvent(item) && 'startTime' in item && item.startTime !== null;
  }

  formatEventTime(item: AgendaItem): string {
    if (!this.hasStartTime(item)) return '';
    const event = item as Event;
    return this.getFormattedTime(new Date(event.startTime));
  }

  getPriorityLabel(priority: Priority): string {
    switch (priority) {
      case Priority.HIGH:
        return 'Haute priorité';
      case Priority.MEDIUM:
        return 'Priorité moyenne';
      case Priority.LOW:
        return 'Basse priorité';
      default:
        return 'Sans priorité';
    }
  }

  getItemsByPriority(date: Date, priority: Priority): AgendaItem[] {
    return this.getDayItems(date).filter(item => item.priority === priority);
  }

  previousMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1);
  }

  nextMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1);
  }

  selectDate(date: Date) {
    this.dateSelected.emit(date);
  }

  isToday(date: Date): boolean {
    return isToday(date);
  }

  isSelected(date: Date): boolean {
    return isSameDay(date, this.selectedDate);
  }

  isSameMonth(date: Date, currentDate: Date): boolean {
    return isSameMonth(date, currentDate);
  }

  getDayItems(date: Date): AgendaItem[] {
    return this.agendaItems.filter(item => 
      isSameDay(new Date(item.date), date)
    );
  }

  getPriorities(date: Date): Priority[] {
    const items = this.getDayItems(date);
    const priorities = new Set<Priority>();
    
    items.forEach(item => {
      if (item.priority) {
        priorities.add(item.priority);
      }
    });

    return Array.from(priorities);
  }
} 