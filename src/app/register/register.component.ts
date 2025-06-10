import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service'; // Import the AuthService
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotyfService } from '../services/notyf.service';
import { EmailService } from '../services/email.service';
import { LoaderService } from '../services/loader.service';

declare var bootstrap : any;

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

  isSendingOTP: boolean = false;
  otpCooldown: boolean = false;
  cooldownTimeLeft: number = 60;
  timerInterval: any;

  showModal = false;

  otp: string = '';
  emailVerified = false;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private notyf: NotyfService,
    private emailService : EmailService,
    private loader: LoaderService
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

  sendOTP() {
    if (!this.email) {
      this.errorMsg = 'Email is required to send OTP.';
      return;
    }

    this.isSendingOTP = true;

    const otpRequest = { email: this.email };

    this.emailService.sendEmailVerificationOtp(otpRequest).subscribe({
      next: () => {
        const otpModal = new bootstrap.Modal(document.getElementById('otpModal'));
        otpModal.show();

        this.startCooldownTimer(); 

        this.notyf.success('OTP sent to your email!');
        this.isSendingOTP = false;
      },
      error: (err) => {
        this.errorMsg = err.error?.message || 'Failed to send OTP. Try again.';
        this.notyf.error(this.errorMsg);
        this.isSendingOTP = false;
      }
    });
  }


  verifyOTP() {
    if (!this.email || !this.otp) {
      this.errorMsg = 'Email and OTP are required for verification.';
      return;
    }

    const otpVerification = { email: this.email, otp: this.otp };

    this.emailService.verifyEmailVerificationOtp(otpVerification).subscribe({
      next: (res: any) => {
        if (res.status == 200) {
          this.emailVerified = true;
          const otpModal = bootstrap.Modal.getInstance(document.getElementById('otpModal'));
          otpModal.hide();
          this.notyf.success('Email verified successfully!');
        } else {
          this.errorMsg = 'Invalid OTP. Please try again.';
          this.notyf.error(this.errorMsg);
        }
      },
      error: (err) => {
        this.errorMsg = err.error?.message || 'Verification failed. Try again.';
        this.notyf.error(this.errorMsg);
      }
    });
  }

  startCooldownTimer() {
    this.otpCooldown = true;
    this.cooldownTimeLeft = 60;

    this.timerInterval = setInterval(() => {
      this.cooldownTimeLeft--;

      if (this.cooldownTimeLeft <= 0) {
        clearInterval(this.timerInterval);
        this.otpCooldown = false;
      }
    }, 1000);
  }


  onSubmit() {

    if (!this.emailVerified) {
      this.errorMsg = 'Please verify your email before registering.';
      return;
    }

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
          this.loader.show("Redirecting to login page...please wait.");
          setTimeout(() => {
            this.router.navigate(['/login']);
            this.loader.hide();
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

  dobInvalid() {
    if (!this.dateOfBirth) return true; // or false, depending on how you want to handle empty

    const today = new Date();
    const dob = new Date(this.dateOfBirth);

    // Check if DOB is in the future
    if (dob > today) {
      return true; // invalid if DOB is after today
    }

    const age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    const dayDiff = today.getDate() - dob.getDate();

    if (
      age < 18 || 
      (age === 18 && (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)))
    ) {
      return true; // invalid if user is under 18
    }
    return false; // valid DOB
  }

}
