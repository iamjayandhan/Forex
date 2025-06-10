import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { UserProfile } from '../models/user-profile.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class NavbarComponent implements OnInit {
  user: UserProfile | null = null;
  dropdownOpen = false;

  activeRoute: string = 'dashboard';

  constructor(private userService: UserService, private authService: AuthService, private router: Router) {}

  viewProfile(){
    // this.showProfileModel = true;
    this.router.navigate(['/profile']);
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

    this.activeRoute = route;
        
    if(route === "transactions"){
      this.router.navigate([`transactions/${this.user?.userId}`]);
    }else{
      this.router.navigate([route]);
    }
  }

  // navLinks = used in template
  navLinks = [
    { route: 'dashboard', label: 'Dashboard' },
    { route: 'admin', label: 'Admin', condition: () => this.user?.role === 'ADMIN' },
    { route: 'market', label: 'Market' },
    { route: 'portfolio', label: 'My Portfolio' },
    { route: 'transactions', label: 'Transactions' },
    { route: 'wallet', label: 'Deposit/Withdraw' },
    { route: 'help', label: 'Help' }
  ];

  get visibleNavLinks() {
    if (this.user?.role === 'ADMIN') {
      // Only show Admin route if user is admin
      return this.navLinks.filter(link => link.route === 'admin');
    } else {
      // Show all routes except Admin for non-admins
      return this.navLinks.filter(link => link.route !== 'admin');
    }
  }

}
