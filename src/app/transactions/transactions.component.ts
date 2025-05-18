import { Component, OnInit } from '@angular/core';
import { PortfolioService } from '../services/portfolio.service';
import { UserService } from '../services/user.service';
import { UserProfile } from '../models/user-profile.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-transactions',
  standalone: true,
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css'],
  imports: [CommonModule,FormsModule],
})
export class TransactionsComponent implements OnInit {

  transactions: any[] = [];
  user: UserProfile | null = null;
  isLoading = true;
  error: string = '';

  currentTime : Date = new Date();
  selectedTransaction: any = null;

  constructor(
    private portfolioService: PortfolioService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadUserAndTransactions();
    setInterval(() => {
      this.currentTime = new Date();
    },1000)
  }

  loadUserAndTransactions(): void {
    this.userService.currentUser$.subscribe((userData) => {
      this.user = userData;
      if (this.user) {
        this.getTransactions(this.user.userId);
      }
    });

    // Optional: Refresh user profile
    this.userService.getUserProfile().subscribe((res) => {
      this.userService.setUser(res.data);
    });
  }

  getTransactions(userId: number): void {
    this.isLoading = true;
    this.portfolioService.getTransactions(userId).subscribe({
      next: (res) => {
        this.transactions = res.data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching transactions:', err);
        this.error = 'Failed to load transactions';
        this.isLoading = false;
      }
    });
  }

  toggleDetails(txn: any) {
    if (this.selectedTransaction === txn) {
      this.selectedTransaction = null; 
    } else {
      this.selectedTransaction = txn;
    }
  }
}
