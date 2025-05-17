import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import {  ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AgendaService } from './services/agenda.service';
import { NotificationService } from './services/notification.service';
import { AgendaItem } from './models/agenda-item.model';
import { CalendarComponent } from './components/calendar/calendar.component';
import { DayViewComponent } from './components/day-view/day-view.component';
import { AgendaItemFormComponent } from './components/agenda-item-form/agenda-item-form.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { NavbarComponent } from './components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    HttpClientModule,
    CalendarComponent,
    DayViewComponent,
    AgendaItemFormComponent,
    NavbarComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  selectedDate: Date = new Date();
  selectedItem: AgendaItem | undefined;
  showForm = false;
  
  constructor(
    private agendaService: AgendaService,
    private notificationService: NotificationService
  ) {}
  
  ngOnInit(): void {
    // Initialize services
  }
  
  onDateSelected(date: Date): void {
    this.selectedDate = date;
    this.selectedItem = undefined;
    this.showForm = false;
  }
  
  onAddItem(): void {
    this.selectedItem = undefined;
    this.showForm = true;
  }
  
  onEditItem(item: AgendaItem): void {
    this.selectedItem = item;
    this.showForm = true;
  }
  
  onDeleteItem(id: number): void {
    this.agendaService.deleteItem(id).subscribe(() => {
      this.showForm = false;
      this.selectedItem = undefined;
    });
  }
  
  onSaveItem(item: AgendaItem): void {
    if (item.id) {
      this.agendaService.updateItem(item.id, item).subscribe(() => {
        this.showForm = false;
        this.selectedItem = undefined;
        
        // Update reminder if needed
        if (item.reminder) {
          this.notificationService.createNotification(item, item.reminder).subscribe();
        }
      });
    } else {
      this.agendaService.addItem(item).subscribe(newItem => {
        this.showForm = false;
        this.selectedItem = undefined;
        
        // Create a reminder if needed
        if (newItem.reminder) {
          this.notificationService.createNotification(newItem, newItem.reminder).subscribe();
        }
      });
    }
  }
  
  onCancelForm(): void {
    this.showForm = false;
    this.selectedItem = undefined;
  }
}