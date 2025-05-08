import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service'; // Import the AuthService
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotyfService } from '../services/notyf.service';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [CommonModule, FormsModule,RouterLink] 
})
export class RegisterComponent {
  username: string = '';
  email: string = '';
  password: string = '';
  fullName: string = '';
  mobileNumber: string = '';
  dateOfBirth: string = '';
  errorMsg: string = '';  
  successMsg: string = '';  
  showPassword: boolean = false;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private notyf: NotyfService
  ) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.username && this.email && this.password && this.fullName && this.mobileNumber && this.dateOfBirth) {
      // Make the API call through AuthService
      this.authService.register({
        username: this.username,
        email: this.email,
        password: this.password,
        fullName: this.fullName,
        mobileNumber: this.mobileNumber,
        dateOfBirth: this.dateOfBirth
      }).subscribe({
        next: (res) => {
          this.successMsg = res.message || 'Registration successful!';
          this.notyf.success("Registration successful!");
          setTimeout(() => {
            this.router.navigate(['/login']);
            this.notyf.success("Navigating to login page.");
          }, 2000);
        },
        error: (err) => {
          this.notyf.error(err.error?.message || "Registration failed. Please try again.");
          this.errorMsg = err.error?.message || 'Registration failed. Please try again.';
        }
      });
    } else {
      this.notyf.error("All fields are required.");
      this.errorMsg = 'All fields are required.';
    }
  }
}
