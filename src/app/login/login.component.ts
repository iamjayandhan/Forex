import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';  // Importing Router to navigate after login
import { AuthService } from '../services/auth.service';  // Import the AuthService

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [CommonModule, FormsModule]
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  showPassword: boolean = false;
  errorMsg: string = '';  // For displaying login errors

  constructor(private authService: AuthService, private router: Router) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.username && this.password) {
      // AuthService to handle the login!
      this.authService.login({ email: this.username, password: this.password }).subscribe({
        next: () => {
          // On success!
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          // error!
          this.errorMsg = err.error.message || 'Login failed, please try again.';
        }
      });
    } else {
      this.errorMsg = 'Username and password are required.';
    }
  }
}
