import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NotyfService } from '../services/notyf.service';
import { Router } from '@angular/router';
import { OtpService } from '../services/otp.service';


@Component({
  selector: 'app-password-reset',
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class OtpComponent implements OnInit, OnDestroy {
  otpForm: FormGroup;
  otpSent: boolean = false;
  otpVerified: boolean = false;
  isCooldown: boolean = false;
  countdown: number = 60;
  showEmailInput: boolean = true;
  private timerInterval: any;

  private fb = inject(FormBuilder);
  private notyf = inject(NotyfService);
  private router = inject(Router);
  private otpService = inject(OtpService);

  constructor() {
    this.otpForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      otp: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {
    const storedEmail = localStorage.getItem('email');
    const otpVerified = localStorage.getItem('otpVerified') == 'true';

    if (storedEmail) {
      this.otpForm.get('email')?.setValue(storedEmail);
      // this.otpSent = true;
      // this.startCooldown();
      this.otpSent = !otpVerified;
      this.otpVerified = otpVerified;
  
      if (!otpVerified) {
        this.startCooldown();
      }
    }
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

 // --- Send OTP ---
 sendOtp() {
  const email = this.otpForm.get('email')?.value;

  if (!email || this.otpForm.get('email')?.invalid) {
    this.notyf.error('Please enter a valid email address.');
    return;
  }

  const data = { email };

  this.otpService.sendOtp(data).subscribe({
    next: () => {
      this.notyf.success('OTP sent successfully!');
      localStorage.setItem('email', email);
      this.otpSent = true;
      this.otpVerified = false;
      this.startCooldown();
    },
    error: (err) => {
      this.notyf.error(err.error?.message || 'Failed to send OTP.');
    }
  });
  }

  // --- Verify OTP ---
  verifyOtp() {
    const otp = this.otpForm.get('otp')?.value;
    const email = localStorage.getItem('email');

    if (!otp || !email) {
      this.notyf.error('Please enter the OTP.');
      return;
    }

    const data = { email, otp };

    this.otpService.verifyOtp(data).subscribe({
      next: () => {
        this.notyf.success('OTP verified successfully!');
        this.otpVerified = true;
        localStorage.setItem('otpVerified', 'true');
        this.otpSent = false;
        this.resetTimer(); // stop timer after successful OTP
      },
      error: (err) => {
        this.notyf.error(err.error?.message || 'Invalid OTP.');
      }
    });
  }

 // --- Reset Password ---
 resetPassword() {
  const email = localStorage.getItem('email');
  const newPassword = this.otpForm.get('newPassword')?.value;

  if (!email || !newPassword || this.otpForm.get('newPassword')?.invalid) {
    this.notyf.error('Please enter a valid password.');
    return;
  }

  const data = { email, newPassword };

  this.otpService.resetPassword(data).subscribe({
    next: () => {
      this.notyf.success('Password reset successfully!');
      localStorage.removeItem('email');
      localStorage.removeItem('otpVerified');
      this.router.navigate(['/login']);
    },
    error: (err) => {
      this.notyf.error(err.error?.message || 'Failed to reset password.');
    }
  });
}

   // --- Timer Logic ---
   startCooldown() {
    this.isCooldown = true;
    this.countdown = 60;
    this.showEmailInput = false;

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    this.timerInterval = setInterval(() => {
      if (this.countdown > 0) {
        this.countdown--;
      } else {
        this.resetTimer();
      }
    }, 1000);
  }

  resetTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    this.isCooldown = false;
    this.countdown = 60;
    this.showEmailInput = true;
  }

  get formattedCountdown(): string {
    const minutes = Math.floor(this.countdown / 60);
    const seconds = this.countdown % 60;
    return `${this.padZero(minutes)}:${this.padZero(seconds)}`;
  }

  private padZero(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }
}
