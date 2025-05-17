import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth,
  isSameDay,
  format,
  addMonths,
  subMonths
} from 'date-fns';
import { AgendaService } from '../../services/agenda.service';
import { AgendaItem, Priority } from '../../models/agenda-item.model';
import { DatePipe } from "@angular/common";
import { NgFor, NgIf } from '@angular/common';

@Component({
    selector: 'app-calendar',
    templateUrl: './calendar.component.html',
    standalone: true,
    imports: [
        DatePipe,
        NgFor,
        NgIf
    ],
    styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {
  @Input() currentDate: Date = new Date();
  @Output() dateSelected = new EventEmitter<Date>();
  
  calendarDays: {
    date: Date;
    isCurrentMonth: boolean;
    isToday: boolean;
    items: AgendaItem[];
  }[] = [];
  
  weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  constructor(private agendaService: AgendaService) { }
  
  ngOnInit(): void {
    this.generateCalendarDays();
  }
  
  generateCalendarDays() {
    const firstDayOfMonth = startOfMonth(this.currentDate);
    const lastDayOfMonth = endOfMonth(this.currentDate);
    const startDate = startOfWeek(firstDayOfMonth);
    const endDate = endOfWeek(lastDayOfMonth);
    
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    
    this.agendaService.getItemsByDateRange(startDate, endDate).subscribe(items => {
      this.calendarDays = days.map(date => {
        const dayItems = items.filter(item => 
          isSameDay(new Date(item.date), date)
        );
        
        return {
          date,
          isCurrentMonth: isSameMonth(date, this.currentDate),
          isToday: isSameDay(date, new Date()),
          items: dayItems
        };
      });
    });
  }
  
  nextMonth() {
    this.currentDate = addMonths(this.currentDate, 1);
    this.generateCalendarDays();
  }
  
  previousMonth() {
    this.currentDate = subMonths(this.currentDate, 1);
    this.generateCalendarDays();
  }
  
  onDateClick(date: Date) {
    this.dateSelected.emit(date);
  }
  
  getFormattedDate() {
    return format(this.currentDate, 'MMMM yyyy');
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
}