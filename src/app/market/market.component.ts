import { Component, OnInit } from '@angular/core';
import { StockService } from '../services/stock.service';
import { CommonModule } from '@angular/common';
import { NotyfService } from '../services/notyf.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { UserProfile } from '../models/user-profile.model';

import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-market',
  templateUrl: './market.component.html',
  styleUrls: ['./market.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class MarketComponent implements OnInit {
  stocks: any[] = [];
  user: UserProfile | null = null;
  currentWallet: number = 0;

  loading = true;
  error: string | null = null;

  searchQuery: string = '';
  searchChanged = new Subject<string>();

  pageSize: number = 10;
  currentPage: number = 0;
  totalRecords: number = 0;

  constructor(private stockService: StockService, 
    private notyf: NotyfService,
    private router:Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadUser();
    this.fetchStocks();

    this.searchChanged.pipe(debounceTime(300)).subscribe(() => {
      this.currentPage = 0;
      this.fetchStocks();
    })
  }

  loadUser(): void {
    this.userService.currentUser$.subscribe((userData) => {
      this.user = userData;
      if (this.user) {
        this.currentWallet = this.user.balance;
      }
    });

    this.userService.getUserProfile().subscribe((res) => {
      this.userService.setUser(res.data);
    });
  }

  fetchStocks(): void {
    this.loading = true;
    this.stockService.getPaginatedStocks(this.currentPage, this.pageSize, this.searchQuery).subscribe({
      next: (response) => {
        const result = response.data;
        this.stocks = result.content;
        this.totalRecords = result.totalElements;
        this.loading = false;
      },
      error: (err) => {
        this.notyf.error("Failed to load stocks");
        this.error = 'Failed to load stocks';
        this.loading = false;
        console.error(err);
      }
    });
  }

  onSearch(): void {
    this.currentPage = 0;

    //instead of calling fetchStocks() directly, we will use debounce
    // setTimeout(()=>{
    //   this.fetchStocks();
    // },1000);

    this.searchChanged.next(this.searchQuery);
  }

  onPageSizeChange(): void {
    this.currentPage = 0;
    this.fetchStocks();
  }

  onPageChange(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages) {
      this.currentPage = newPage;
      this.fetchStocks();
    }
  }

  get totalPages(): number {
    return Math.ceil(this.totalRecords / this.pageSize);
  }

  goToBuy(stock: any) {
    this.router.navigate(['/buy', stock.symbol], { state: { stock } });
  }

}
