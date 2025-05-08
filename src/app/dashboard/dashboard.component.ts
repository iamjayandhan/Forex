import { Component,OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';  // Import AuthService
import { UserService } from '../services/user.service';
import { UserProfile } from '../models/user-profile.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports:[CommonModule]
})
export class DashboardComponent implements OnInit{
  user: UserProfile | null = null;

  constructor(private authService: AuthService, private router: Router,private userService:UserService) {}

  ngOnInit(): void {
      this.userService.getUserProfile().subscribe({
        next: (response)=>{
          console.log("user data fetched: ",response.data);
          this.userService.setUser(response.data);
        },
        error: (err) =>{
            console.log("Error fetching user profile!",err);
        },
      })
      this.userService.currentUser$.subscribe(user => {
        this.user = user;
      })
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
