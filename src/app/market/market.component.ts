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
import { MarketStatusChartComponent } from '../market-status-chart/market-status-chart.component';

@Component({
  selector: 'app-market',
  templateUrl: './market.component.html',
  styleUrls: ['./market.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule,MarketStatusChartComponent]
})
export class MarketComponent implements OnInit {
  stocks: any[] = [];
  user: UserProfile | null = null;
  currentWallet: number = 0;

  activeTab: 'status' | 'market' = 'market';
  
  sectorFilter: string = '';
  exchangeFilter: string = '';
  sectors: string[] = []; 
  exchanges: string[] = ['NSE', 'BSE'];

  selectedStock: any = null;

  loading = true;
  error: string | null = null;

  searchQuery: string = '';
  searchChanged = new Subject<string>();

  sortBy: string = 'id';
  sortOrder: string = 'asc';

  pageSize: number = 5;
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
    this.fetchSectors();

    this.searchChanged.pipe(debounceTime(300)).subscribe(() => {
      this.currentPage = 0;
      this.fetchStocks();
      this.fetchSectors();
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
    this.stockService.getPaginatedStocks(
      this.currentPage, 
      this.pageSize, 
      this.searchQuery,
      this.sortBy, 
      this.sortOrder,
      this.sectorFilter,
      this.exchangeFilter
    ).subscribe({
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

  fetchSectors():void{
    this.stockService.getAllSectors().subscribe({
      next: (response)=>{
        this.sectors = response.data;
      },
      error: (err)=> {
          this.notyf.error("Failed to load sectors: "+err);
      },
    })
  }

  openModal(stock: any) {
    this.selectedStock = stock;
  }

  closeModal() {
    this.selectedStock = null;
  }

  resetFilters(): void {
    this.sectorFilter = '';
    this.exchangeFilter = '';
    this.searchQuery = '';
    this.sortBy = 'id';
    this.sortOrder = 'asc';
    this.currentPage = 0;
    this.pageSize = 5;
    this.fetchStocks();
    this.fetchSectors();
  }

  onSort(column: string): void {
    if (this.sortBy === column) {
      // Toggle sorting order
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortOrder = 'asc';
    }
    this.fetchStocks();
  }

  onSearch(): void {
    this.currentPage = 0;

    //instead of calling fetchStocks() directly, we will use debounce
    // setTimeout(()=>{
    //   this.fetchStocks();
    // },1000);

    this.searchChanged.next(this.searchQuery);
  }

  onFilterChange(): void {
    this.currentPage = 0;
    this.fetchStocks();
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
