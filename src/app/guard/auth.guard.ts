import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable} from 'rxjs';
import { tap } from   'rxjs/operators';
import { NotyfService } from '../services/notyf.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router,private notyf: NotyfService) {}

  canActivate(): Observable<boolean> {
    return this.auth.isLoggedIn().pipe(
      tap(isLoggedIn =>{
        if(!isLoggedIn){
          this.notyf.error("Please do login before accessing the dashboard!");
          this.router.navigate(['/login']);
        }
      })
    )
  }
}
