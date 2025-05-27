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
  imports: [CommonModule, FormsModule],
})
export class TransactionsComponent implements OnInit {

  transactions: any[] = [];
  user: UserProfile | null = null;
  isLoading = true;
  error: string = '';

  currentTime: Date = new Date();
  today: string = ''; // For max date in inputs

  searchQuery: string = '';
  selectedType: string = 'all';
  selectedTransaction: any = null;
  showModal: boolean = false;

  startDate: string = '';
  endDate: string = '';

  totalPages: number = 0;
  currentPage: number = 0;
  pageSize: number = 5;

  constructor(
    private portfolioService: PortfolioService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    this.loadUserAndTransactions();
    setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  }

  openTransactionModal(txn: any) {
    this.selectedTransaction = txn;
    this.showModal = true;
  }

  closeTransactionModal() {
    this.selectedTransaction = null;
    this.showModal = false;
  }

  loadUserAndTransactions(): void {
    this.userService.currentUser$.subscribe((userData) => {
      this.user = userData;
      if (this.user) {
        this.getTransactions(this.user.userId);
      }
    });

    this.userService.getUserProfile().subscribe((res) => {
      this.userService.setUser(res.data);
    });
  }

  getTransactions(userId: number): void {
    this.isLoading = true;
    this.portfolioService.getTransactionsPaginated(
      userId,
      this.currentPage,
      this.pageSize,
      this.selectedType,
      this.startDate,
      this.endDate,
      this.searchQuery
    ).subscribe({
      next: (res) => {
        this.transactions = res.data.transactions;
        this.totalPages = res.data.totalPages;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching transactions:', err);
        this.error = 'Failed to load transactions';
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    this.currentPage = 0;
    if (this.user) {
      this.getTransactions(this.user.userId);
    }
  }

  onDateChange(): void {
  this.error = '';
  // no getTransactions() call here!
  if (this.startDate && this.endDate) {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    const today = new Date();

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      this.error = 'Invalid date format.';
      return;
    }

    if (start > end) {
      this.error = 'Start date cannot be after end date.';
      return;
    }

    if (start > today || end > today) {
      this.error = 'Dates cannot be in the future.';
      return;
    }
  }
}


applyDateFilter(): void {
  this.error = '';

  if (!this.startDate || !this.endDate) {
    this.error = 'Both start and end dates are required.';
    return;
  }

  const start = new Date(this.startDate);
  const end = new Date(this.endDate);
  const today = new Date();

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    this.error = 'Invalid date format.';
    return;
  }

  if (start > end) {
    this.error = 'Start date cannot be after end date.';
    return;
  }

  if (start > today || end > today) {
    this.error = 'Dates cannot be in the future.';
    return;
  }

  this.currentPage = 0;
  if (this.user) {
    this.getTransactions(this.user.userId);
  }
}


  clearDateFilters(): void {
    this.startDate = '';
    this.endDate = '';
    this.error = '';
    this.currentPage = 0;
    if (this.user) {
      this.getTransactions(this.user.userId);
    }
  }

  onPageSizeChange(): void {
    this.currentPage = 0;
    if (this.user) {
      this.getTransactions(this.user.userId);
    }
  }

  onFilterChange(type: string) {
    this.selectedType = type;
    this.currentPage = 0;
    if (this.user) {
      this.getTransactions(this.user.userId);
    }
  }

  toggleDetails(txn: any) {
    this.selectedTransaction = this.selectedTransaction === txn ? null : txn;
  }

  // Pagination controls
  goToPreviousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      if (this.user) {
        this.getTransactions(this.user.userId);
      }
    }
  }

  goToNextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      if (this.user) {
        this.getTransactions(this.user.userId);
      }
    }
  }

}
