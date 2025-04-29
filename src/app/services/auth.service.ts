import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
environment
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private BASE_URL = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  login(credentials: { email: string, password: string }): Observable<any> {
    return this.http.post(`${this.BASE_URL}/login`, credentials);
  }

  //helpers!
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
