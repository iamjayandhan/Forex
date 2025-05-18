import { Component, OnInit} from '@angular/core';
import { StockService } from '../services/stock.service';
import { NotyfService } from '../services/notyf.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../services/user.service';
import { UserProfile } from '../models/user-profile.model';

@Component({
  selector: 'app-admin',
  imports: [CommonModule,FormsModule],
  standalone:true,
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})

export class AdminComponent implements OnInit {

  user: UserProfile | null = null;
  stocks: any[] = [];
  searchQuery: string = '';
  pageSize: number = 10;
  currentPage: number = 0;
  totalRecords: number = 0;

  currentWallet: number = 0;
  
  loading: boolean = true;
  error: string | null = null;
  
  showAddForm : boolean = false; 
  
  newStock = {
    name: '',
    symbol: '',
    imageUrl: '',
    currentPrice: null,
    sector: '',
    description: '',
    ipoQty: null,
    exchange: ''
  };

  constructor(
    private stockService: StockService,
    private userService: UserService,
    private notyf: NotyfService
  ) {}

  ngOnInit(): void {
    this.loadUser();
    this.fetchStocks();
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

  addStock(){
    if(!this.newStock.name || !this.newStock.symbol || !this.newStock.imageUrl || !this.newStock.currentPrice || !this.newStock.sector
      || !this.newStock.description || !this.newStock.ipoQty || !this.newStock.exchange
    ){
      this.notyf.error("Please fill required fields.");
      return;
    }

    let payload = {
      name: this.newStock.name,
      symbol: this.newStock.symbol,
      imageUrl: this.newStock.imageUrl,
      currentPrice: this.newStock.currentPrice,
      sector: this.newStock.sector,
      description: this.newStock.description,
      ipoQty: this.newStock.ipoQty,
      exchange: this.newStock.exchange
    }

    this.stockService.createStock(payload).subscribe({
      next: (response) => {
        this.notyf.success('Stock added successfully');
        this.fetchStocks();
      },
      error: (err) => {
        this.error = 'Failed to add stock';
        this.notyf.error(this.error);
      }
    });

    //do operations

    this.resetNewStock();
    this.showAddForm = false;
  }

  cancelAdd() {
    this.resetNewStock();
    this.showAddForm = false;
  }

  resetNewStock() {
    this.newStock = {
      name: '',
      symbol: '',
      imageUrl: '',
      currentPrice: null,
      sector: '',
      description: '',
      ipoQty: null,
      exchange: ''
    };
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
        this.error = 'Failed to load stocks';
        this.notyf.error(this.error);
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.currentPage = 0;
    setTimeout(() => this.fetchStocks(), 1000);
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
}
