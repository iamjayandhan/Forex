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
import { TransactionsComponent } from './transactions/transactions.component';
import { AdminComponent } from './admin/admin.component';
import { HoldingsComponent } from './holdings/holdings.component';
import { GuideComponent } from './guide/guide.component';
import { SellComponent } from './sell/sell.component';
import { ProfileComponent } from './profile/profile.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent , canActivate: [loggedInGuard]},
  { path: 'register', component:RegisterComponent, canActivate: [loggedInGuard]},
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard]},
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard]},
  { path: 'resetPwd',component: OtpComponent},
  { path: 'market',  component: MarketComponent, canActivate:[AuthGuard]},
  { path: 'buy/:symbol', component:BuyComponent, canActivate:[AuthGuard]},
  { path: 'sell/:stockId', component:SellComponent, canActivate:[AuthGuard]},
  { path: 'wallet',component: WalletComponent, canActivate:[AuthGuard]},
  { path: 'transactions/:userid',component:TransactionsComponent, canActivate:[AuthGuard]},
  { path: 'admin', component:AdminComponent, canActivate:[AuthGuard]},
  { path: 'portfolio', component: HoldingsComponent, canActivate:[AuthGuard]},
  { path: 'help', component: GuideComponent,canActivate:[AuthGuard]},
];