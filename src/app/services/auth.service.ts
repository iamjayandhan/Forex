import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap} from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private BASE_URL = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient, private router:Router) {}

  login(payload: { email: string, password: string }): Observable<any> {
    return this.http.post<any>(`${this.BASE_URL}/login`, payload, {
      withCredentials: true,
    });
  }

  register(user: {
    username: string;
    email: string;
    password: string;
    fullName: string;
    mobileNumber: string;
    dateOfBirth: string;
    mpin: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.BASE_URL}/register`, user);
  }

  // Updated isLoggedIn method
  //this is sync method!
  isLoggedIn(): Observable<boolean> {
    // console.log('[AuthService] Calling /me API');
    return this.http.get<any>(`${this.BASE_URL}/me`, { withCredentials: true }).pipe(
      map((response) => {
        // console.log('[AuthService] /me response:', response);
        return !!response?.data?.active;
      }),
      catchError((err) => {
        console.error('[AuthService] /me error:', err);
        return of(false);
      })
    );
  }

  //gets all data(specially for admin, to get role info)
  getUserInfo(): Observable<any> {
    return this.http.get<any>(`${this.BASE_URL}/me`, { withCredentials: true }).pipe(
      map(response => response.data),
      catchError(err => {
        console.error('[AuthService] /me error:', err);
        return of(null);
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.BASE_URL}/logout`, {}, { withCredentials: true }).pipe(
      tap(() => {
        console.log('Logout success!');
      }),
      catchError((err) => {
        console.log('Logout failed!', err);
        return throwError(() => new Error(err)); //again an observable!
      })
    );
  }
}
