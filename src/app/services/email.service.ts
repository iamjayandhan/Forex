import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OTPRequestDTO } from '../models/otp-request.model'; // Optional, if you define an interface
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmailService {

  private BASE_URL = `${environment.apiUrl}/auth`; // Update this with your backend URL

  constructor(private http: HttpClient) {}

  /**
   * Send OTP for email verification
   */
  sendEmailVerificationOtp(data: OTPRequestDTO): Observable<any> {
    return this.http.post(`${this.BASE_URL}/sendEmailVerificationOtp`, data);
  }

  /**
   * Verify OTP for email verification
   */
  verifyEmailVerificationOtp(data: OTPRequestDTO): Observable<any> {
    return this.http.post(`${this.BASE_URL}/verifyEmailVerificationOtp`, data);
  }
}
