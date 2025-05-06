import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable} from 'rxjs';
import { tap } from   'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.auth.isLoggedIn().pipe(
      tap(isLoggedIn =>{
        if(!isLoggedIn){
          this.router.navigate(['/login']);
        }
      })
    )
  }
}
