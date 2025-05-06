import { Injectable } from '@angular/core';
import { CanActivate,Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable,of, map } from 'rxjs';
import { catchError } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})

export class loggedInGuard implements CanActivate{
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.auth.isLoggedIn().pipe(
      map(isLoggedIn => {
        if (isLoggedIn) {
          this.router.navigate(['/dashboard']);
          return false; // Block access to login if already logged in
        }
        return true; // Allow access if not logged in
      })      
    );
  }
}
