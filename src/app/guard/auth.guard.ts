import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    // Check if user has a token (you stored JWT token during login)
    const token = this.getToken();

    if (token) {
      return true; // Token exists, allow access
    } else {
      // No token, redirect to login page
      this.router.navigate(['/login']);
      return false;
    }
  }

  // Helper to get token from cookies
  getToken(): string | null {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [key, value] = cookie.trim().split('=');
      if (key === 'auth_token') {
        return value;
      }
    }
    return null;
  }
}
