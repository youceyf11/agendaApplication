import { Component } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { NotificationsComponent } from "../notifications/notifications.component";
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    standalone: true,
    imports: [
        NotificationsComponent,
        NgIf
    ],
    styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  currentUser: User | null = null;
  
  constructor(private userService: UserService) {
    this.userService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    });
  }
  
  getUserInitials(): string {
    if (!this.currentUser) return '?';
    
    if (this.currentUser.firstName && this.currentUser.lastName) {
      return `${this.currentUser.firstName.charAt(0)}${this.currentUser.lastName.charAt(0)}`;
    }
    
    return this.currentUser.username.substring(0, 2).toUpperCase();
  }
}