import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { UserProfile } from '../models/user-profile.model';
import { CommonModule } from '@angular/common';
import { ProfileComponent } from '../profile/profile.component';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  standalone: true,
  imports: [CommonModule,ProfileComponent]
})
export class NavbarComponent implements OnInit {
  user: UserProfile | null = null;
  dropdownOpen = false;
  showProfileModel = false;

  constructor(private userService: UserService, private authService: AuthService, private router: Router) {}

  viewProfile(){
    this.showProfileModel = true;
  }

  closeProfile(){
    this.showProfileModel = false;
  }

  ngOnInit(): void {
    this.userService.currentUser$.subscribe(user => {
      this.user = user;
    });
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Logout failed', err);
      }
    });
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
