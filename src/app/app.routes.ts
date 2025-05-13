import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './guard/auth.guard';
import { RegisterComponent } from './register/register.component';
import { loggedInGuard } from './guard/loggedIn.guard';
import { OtpComponent } from './otp/otp.component';
import { MarketComponent } from './market/market.component';
import { BuyComponent } from './buy/buy.component';
import { WalletComponent } from './wallet/wallet.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent , canActivate: [loggedInGuard]},
  { path: 'register', component:RegisterComponent, canActivate: [loggedInGuard]},
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard]},
  { path: 'resetPwd',component: OtpComponent},
  { path: 'market',  component: MarketComponent, canActivate:[AuthGuard]},
  { path: 'buy/:symbol', component:BuyComponent, canActivate:[AuthGuard]},
  { path: 'wallet',component: WalletComponent, canActivate:[AuthGuard]},
];