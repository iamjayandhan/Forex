import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';  // Import AuthService

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
})
export class DashboardComponent {
  
  constructor(private authService: AuthService, private router: Router) {}

  logout() {
    this.authService.logout();  // Call the logout method from AuthService
    this.router.navigate(['/login']);  // Redirect the user to the login page
  }
}
