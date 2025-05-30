import { Component, OnInit} from '@angular/core';
import { StockService } from '../services/stock.service';
import { NotyfService } from '../services/notyf.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../services/user.service';
import { UserProfile } from '../models/user-profile.model';
import { Stock } from '../models/stock.model';

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

  //for the pagination
  searchQuery: string = '';
  pageSize: number = 10;
  currentPage: number = 0;
  totalRecords: number = 0;

  //wallet information
  currentWallet: number = 0;
  
  loading: boolean = true;
  error: string | null = null;
  
  showForm : boolean = false; 
  editMode: boolean = false;
  editedStockId: number | null = null;
  
  newStock = {
    name: '',
    symbol: '',
    imageUrl: '',
    currentPrice: 0,
    sector: '',
    description: '',
    ipoQty: 0,
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

    if(this.newStock.ipoQty <= 0){
      this.notyf.error("IPO quantity must be greater than 0");
      return;
    }
    if(this.newStock.currentPrice <= 0){
      this.notyf.error("Current price must be greater than 0");
      return;
    }
    if(this.newStock.symbol.length < 3){
      this.notyf.error("Symbol must be at least 3 characters long");
      return;
    }
    if(this.newStock.name.length < 3){
      this.notyf.error("Name must be at least 3 characters long");
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
      next: () => {
        this.notyf.success('Stock added successfully');
        this.fetchStocks();
      },
      error: (err) => {
        // console.error(err);

        if (err?.message?.includes('Duplicate entry') && err?.message?.includes('unique_symbol')) {
          this.notyf.error('A stock with this symbol already exists. Please choose a unique symbol.');
        } else {
          this.notyf.error('Failed to add stock. Please try again later.');
        }

        // this.error = 'An error occurred while adding the stock.';
      }

    });
  
    this.resetStockInfo();
    this.showForm = false;
  }
  
  updateStock(): void {
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

    console.log("PAYLOAD",payload);
    console.log("EDITED STOCK ID",this.editedStockId)

    if (this.editedStockId) {
      this.stockService.updateStock(this.editedStockId, payload).subscribe({
        next: () => {
          this.notyf.success('Stock updated successfully');
          this.fetchStocks();
        },
        error: () => {
          this.error = 'Failed to update stock';
          this.notyf.error(this.error);
        }
      });
    }

    this.resetStockInfo();
    this.showForm = false;
  }

  onSubmit(): void {
    if (this.editMode) {
      this.updateStock();
    } else {
      this.addStock();
    }
  }


  cancelAdd() {
    this.resetStockInfo();
    this.showForm = false;
  }

  cancelEdit(): void {
    this.resetStockInfo();
    this.showForm = false;
    this.editMode = false;
    this.editedStockId = null;
  }
  
  resetStockInfo() {
    this.newStock = {
      name: '',
      symbol: '',
      imageUrl: '',
      currentPrice: 0,
      sector: '',
      description: '',
      ipoQty: 0,
      exchange: ''
    };
  }

  fetchStocks(): void {
    this.loading = true;
    this.stockService.getPaginatedStocks(this.currentPage, this.pageSize, this.searchQuery).subscribe({
      next: (response) => {
        // console.log(response.data.content);
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

  editStock(stock: Stock): void {
    this.editMode = true;
    this.editedStockId = stock.id ?? null;
    this.newStock = {
      name: stock.name || '',
      symbol: stock.symbol || '',
      imageUrl: stock.imageUrl || '',
      currentPrice: stock.currentPrice ?? 0,
      sector: stock.sector || '',
      description: stock.description || '',
      ipoQty: stock.ipoQty ?? 0,
      exchange: stock.exchange || ''
    };
    this.showForm = true;
  }

  deleteStock(stockId: number): void {
    this.stockService.deleteStock(stockId).subscribe({
      next: () => {
        this.notyf.success('Stock deleted successfully');
        this.fetchStocks();
      },
      error: (err) => {
        // this.error = 'Failed to delete stock';
        // this.error = err.message;
        this.notyf.error("Some Investors hold that stock currently. Cannot perform deletion operation.");
        this.fetchStocks();
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

  isAdmin(): boolean {
    return this.user?.role === 'ADMIN';
  }
}
