import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { CalendarComponent } from './app/components/calendar/calendar.component';
import { DayViewComponent } from './app/components/day-view/day-view.component';
import { AgendaItemFormComponent } from './app/components/agenda-item-form/agenda-item-form.component';
import { NotificationsComponent } from './app/components/notifications/notifications.component';
import { NavbarComponent } from './app/components/navbar/navbar.component';

// Import services
import { AgendaService } from './app/services/agenda.service';
import { NotificationService } from './app/services/notification.service';
import { UserService } from './app/services/user.service';
import { CategoryService } from './app/services/category.service';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    AgendaService,
    NotificationService, 
    UserService,
    CategoryService
  ]
}).catch(err => console.error(err));