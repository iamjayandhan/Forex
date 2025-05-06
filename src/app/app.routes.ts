import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './guard/auth.guard';
import { RegisterComponent } from './register/register.component';
import { loggedInGuard } from './guard/loggedIn.guard';
import { OtpComponent } from './otp/otp.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent , canActivate: [loggedInGuard]},
  { path: 'register', component:RegisterComponent, canActivate: [loggedInGuard]},
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard]},
  { path: 'resetPwd',component: OtpComponent}
];
