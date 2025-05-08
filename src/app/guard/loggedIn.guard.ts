import { Injectable } from '@angular/core';
import { CanActivate,Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable,of, map } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotyfService } from '../services/notyf.service';


@Injectable({
  providedIn: 'root'
})

export class loggedInGuard implements CanActivate{
  constructor(
    private auth: AuthService, 
    private router: Router,
    private notyf: NotyfService
  ) {}

  canActivate(): Observable<boolean> {
    return this.auth.isLoggedIn().pipe(
      map(isLoggedIn => {
        if (isLoggedIn) {
          this.notyf.success("You already have valid token. No need to login.");
          this.router.navigate(['/dashboard']);
          return false; // Block access to login!
        }
        return true; // Allow access if not logged in!
      })      
    );
  }
}
