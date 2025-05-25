import { Component,OnInit,OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';  // Import AuthService
import { UserService } from '../services/user.service';
import { UserProfile } from '../models/user-profile.model';
import { CommonModule } from '@angular/common';

import { takeUntil, tap, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports:[CommonModule]
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  user: UserProfile | null = null;

  constructor(private authService: AuthService, private router: Router,private userService:UserService) {}

  ngOnInit(): void {
    this.userService.getUserProfile().pipe(
      //Used tap() to update the BehaviorSubject only after receiving the user data.
      tap(response => this.userService.setUser(response.data)),
      //Chained with switchMap() to subscribe to currentUser$ only after the update.
      switchMap(() => this.userService.currentUser$),
      //Included takeUntil() for memory safety when the component is destroyed.
      takeUntil(this.destroy$)
    ).subscribe(user => {
      this.user = user;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.log('Logout failed!', err);
      }
    });
  }
}
