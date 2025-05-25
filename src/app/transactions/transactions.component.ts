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

  searchQuery: string = '';
  selectedType: string = 'all';
  selectedTransaction: any = null;

  totalPages: number = 0;
  currentPage: number = 0;
  pageSize: number = 5;

  constructor(
    private portfolioService: PortfolioService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadUserAndTransactions();
    setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
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
    this.portfolioService.getTransactions(userId).subscribe({
      next: (res) => {
        this.transactions = res.data;
        this.isLoading = false;
        this.currentPage = 0; // Reset to first page after data load
        this.updateTotalPages();
      },
      error: (err) => {
        console.error('Error fetching transactions:', err);
        this.error = 'Failed to load transactions';
        this.isLoading = false;
      }
    });
  }

  updateTotalPages() {
    this.totalPages = Math.ceil(this.filteredTransactions.length / this.pageSize);
  }

  // Filtering based on type and search query
  get filteredTransactions() {
    if (!Array.isArray(this.transactions)) return [];

    const filtered = this.transactions.filter(txn => {
      // Filter by type
      if (this.selectedType !== 'all' && txn.transactionType.toLowerCase() !== this.selectedType.toLowerCase()) {
        return false;
      }
      return true;
    }).filter(txn => {
      // Filter by search query
      const query = this.searchQuery.toLowerCase().trim();
      if (!query) return true;
      return (
        txn.stock?.name?.toLowerCase().includes(query) ||
        txn.stock?.symbol?.toLowerCase().includes(query) ||
        txn.transactionType?.toLowerCase().includes(query)
      );
    });

    return filtered;
  }

  // Get the current page's transactions after filtering
  get filteredAndPaginatedTransactions() {
    this.updateTotalPages();

    // Make sure currentPage is within bounds
    if (this.currentPage >= this.totalPages) {
      this.currentPage = this.totalPages - 1 >= 0 ? this.totalPages - 1 : 0;
    }

    const startIndex = this.currentPage * this.pageSize;
    return this.filteredTransactions.slice(startIndex, startIndex + this.pageSize);
  }

  toggleDetails(txn: any) {
    this.selectedTransaction = this.selectedTransaction === txn ? null : txn;
  }

  // Call this whenever searchQuery or selectedType changes to reset page
  onFilterChange() {
    this.currentPage = 0;
    this.updateTotalPages();
  }

  // Pagination controls
  goToPreviousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
    }
  }

  goToNextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
    }
  }

}
