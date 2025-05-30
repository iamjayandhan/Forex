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
  mpin: string = '';

  errorMsg: string = '';  
  successMsg: string = ''; 

  showPassword: boolean = false;
  showMPIN: boolean = false;
  showModal = false;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private notyf: NotyfService
  ) {}

  passwordValidations = {
    minLength: false,
    upperCase: false,
    lowerCase: false,
    digit: false,
    specialChar: false,
  };

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }
  
  goToHome() : any{
    this.router.navigate(['/home']);
  }

  validatePassword(password: string) {
    this.passwordValidations = {
      minLength: password.length >= 8,
      upperCase: /[A-Z]/.test(password),
      lowerCase: /[a-z]/.test(password),
      digit: /[0-9]/.test(password),
      specialChar: /[^A-Za-z0-9]/.test(password),
    };
  }

  onPasswordInput() {
    this.validatePassword(this.password);
  }


  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleMPIN() {
    this.showMPIN = !this.showMPIN;
  }

  onSubmit() {
     if (!this.dateOfBirth) {
      this.errorMsg = "Date of Birth is required.";
      return;
    }

    if (this.dobInvalid()) {
      this.errorMsg = "You must be at least 13 years old to register.";
      return;
    }

    if (this.username && this.email && this.password && this.fullName && this.mobileNumber && this.dateOfBirth && this.mpin) {
      // Make the API call through AuthService
      this.authService.register({
        username: this.username,
        email: this.email,
        password: this.password,
        fullName: this.fullName,
        mobileNumber: this.mobileNumber,
        dateOfBirth: this.dateOfBirth,
        mpin: this.mpin
      }).subscribe({
        next: (res) => {
          this.successMsg = res.message || 'Registration successful!';
          this.notyf.success("Registration successful!");
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 1500);
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

  dobInvalid() {
    const today = new Date();
    const dob = new Date(this.dateOfBirth);
    const age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    
    return (age < 18 || (age === 18 && monthDiff < 0));
  }
}
