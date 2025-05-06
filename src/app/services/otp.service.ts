import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OTPRequestDTO } from '../models/otp-request.model';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OtpService {

    constructor(private http: HttpClient) {}

    sendOtp(data: OTPRequestDTO): Observable<any> {
        return this.http.post(`${environment.apiUrl}/auth/sendOtp`, data);
    }

    verifyOtp(data: OTPRequestDTO): Observable<any> {
        return this.http.post(`${environment.apiUrl}/auth/verifyOtp`, data);
    }

    resetPassword(data: OTPRequestDTO): Observable<any> {
        return this.http.post(`${environment.apiUrl}/auth/resetPwd`, data);
    }
}
