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

  activeTab: 'status' | 'market' | 'watchlist' = 'market';
  
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

  //watchlist
  watchlistStocks: any[] = [];
  userId!: number;
  wishlistSectorFilter: string = '';
  wishlistExchangeFilter: string = '';
  wishlistSearchQuery: string = '';

  allMarketStocks: any[] = [];  
  tempWishlist: any[] = [];
  isWishlistModalOpen: boolean = false;
  filteredWishlistStocks: any[] = [];

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
          this.userId = this.user.userId;
          this.loadWatchlist();
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

  loadWatchlist(): void {
    this.stockService.getUserWatchlist(this.userId).subscribe({
      next: (res: any) => {
        this.watchlistStocks = res.data;
      },
      error: (err) => {
        console.error("Failed to fetch watchlist", err);
      }
    });
  }

  loadAllMarketStocks(): void {
    this.stockService.getAllStocks().subscribe({
      next: (res) => {
        this.allMarketStocks = res.data;
      },
      error: (err) => {
        this.notyf.error('Failed to load stocks');
        console.error(err);
      }
    });
  }

  addToTempWishlist(stock: any): void {
    if (!this.tempWishlist.find(s => s.id === stock.id)) {
      this.tempWishlist.push(stock);
    }
  }

  removeFromTempWishlist(stock: any): void {
    this.tempWishlist = this.tempWishlist.filter(s => s.id !== stock.id);
  }

  submitWishlist(): void {
    if (this.tempWishlist.length === 0) {
      this.notyf.error('Please add some stocks first');
      return;
    }

    const payload = this.tempWishlist.map(stock => ({
      stockId: stock.id,
      userId: this.userId
    }));

    console.log(this.tempWishlist);
    console.log(payload);

    this.stockService.addStocksToWatchlist(payload).subscribe({
      next: () => {
        this.notyf.success('Stocks added to watchlist');
        this.closeWishlistModal();
        this.loadWatchlist();
      },
      error: (err) => {
        this.notyf.error('Failed to add to watchlist');
        console.error(err);
      }
    });
  }

  removeFromWatchlist(stockId: number): void {
    this.stockService.deleteStockFromWatchlist(this.userId, stockId).subscribe({
      next: () => {
        this.loadWatchlist();
      },
      error: (err) => {
        console.error("Failed to remove from watchlist", err);
      }
    });
  }
  openWishlistModal(): void {
    this.wishlistSearchQuery = '';
    this.wishlistExchangeFilter = '';
    this.wishlistSectorFilter = '';
    this.tempWishlist = [];

    // Step 1: Load user watchlist
    this.stockService.getUserWatchlist(this.userId).subscribe({
      next: (res) => {
        this.watchlistStocks = Array.isArray(res.data) ? res.data : [];

        // Step 2: Load all stocks
        this.stockService.getAllStocks().subscribe({
          next: (stockResponse) => {
            this.allMarketStocks = stockResponse.data || [];

            // Step 3: Exclude already watchlisted stocks
            this.filteredWishlistStocks = this.allMarketStocks.filter(stock =>
              !this.watchlistStocks.some(watchStock => watchStock.id === stock.id)
            );

            this.isWishlistModalOpen = true;
          },
          error: () => {
            this.notyf.error('Failed to load market stocks');
          }
        });
      },
      error: () => {
        this.notyf.error('Failed to load user watchlist');

        // Still attempt to open modal with all stocks if watchlist failed
        this.stockService.getAllStocks().subscribe({
          next: (stockResponse) => {
            this.allMarketStocks = stockResponse.data || [];
            this.filteredWishlistStocks = [...this.allMarketStocks];
            this.isWishlistModalOpen = true;
          },
          error: () => {
            this.notyf.error('Failed to load market stocks');
          }
        });
      }
    });
  }



  closeWishlistModal(): void {
    this.isWishlistModalOpen = false;
    this.tempWishlist = [];
  }

  filterWishlistStocks(): void {
    const query = this.wishlistSearchQuery.toLowerCase();

    this.filteredWishlistStocks = this.allMarketStocks
      .filter(stock =>
        !this.watchlistStocks.some(watchStock => watchStock.id === stock.id) &&  // exclude watchlisted
        (!this.wishlistSectorFilter || stock.sector === this.wishlistSectorFilter) &&
        (!this.wishlistExchangeFilter || stock.exchange === this.wishlistExchangeFilter) &&
        (stock.name.toLowerCase().includes(query) || stock.symbol.toLowerCase().includes(query))
      );
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
