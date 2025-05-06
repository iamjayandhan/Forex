import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';  // Import UserService
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone:true,
  imports: [FormsModule,CommonModule,RouterLink]
})

export class LoginComponent {
  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  errorMsg: string = '';

  constructor(
    private authService: AuthService, 
    private userService: UserService,  // Inject UserService
    private router: Router
  ) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.email && this.password) {
      this.authService.login({ email: this.email, password: this.password }).subscribe({
        next: (res) => {
          if (res && res.data.token) {
              console.log(res);
              console.log(res.data.token);
              // Fetch the updated user profile after login
              this.userService.getUserProfile().subscribe(response => {
                const userData = response.data;
                this.userService.setUser(userData);  // Store the user data in BehaviorSubject

                console.log("User profile: ", userData);
                console.log("going to dashboard!");
                this.router.navigate(['/dashboard']);
            });
          } else {
            this.errorMsg = 'No token received from server.';
          }
        },
        error: (err) => {
          this.errorMsg = err.error.message || 'Login failed, please try again.';
        }
      });
    } else {
      this.errorMsg = 'Email and password are required.';
    }
  }
}
