import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';  // Import UserService
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NotyfService } from '../services/notyf.service';

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
    private router: Router,
    private notyf : NotyfService
  ) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  goToHome() : any{
    this.router.navigate(['/home']);
  }

  onSubmit() {
    if (this.email && this.password) {
      this.authService.login({ email: this.email, password: this.password }).subscribe({
        next: (res) => {
          if (res && res.data.token) {
              // console.log(res);
              // console.log(res.data.token);
              // Fetch the updated user profile after login
              this.userService.getUserProfile().subscribe(response => {
                const userData = response.data;
                this.userService.setUser(userData);  // Store the user data in BehaviorSubject

                // console.log("User profile: ", userData);
                // console.log("going to dashboard!");

                this.notyf.success("Login success!");
                
                //route based on role
                const role  = this.userService.getUser()?.role;
                if(role === 'ADMIN'){
                  this.router.navigate(['/admin']);
                } else {
                  this.router.navigate(['/dashboard']);
                }
            });
          } else {
            this.notyf.error("No token received from server.");
            this.errorMsg = 'No token received from server.';
          }
        },
        error: (err) => {
          this.notyf.error(err.error?.message || "Login failed, please try again.");
          this.errorMsg = err.error?.message || 'Login failed, please try again.';
        }
      });
    } else {
      this.notyf.error("Email and password are required.");
      this.errorMsg = 'Email and password are required.';
    }
  }
}
