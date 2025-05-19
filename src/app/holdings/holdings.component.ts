import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { NotyfService } from '../services/notyf.service';
import { PortfolioService } from '../services/portfolio.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserProfile } from '../models/user-profile.model';

interface StockInfo {
  name: string;
  symbol: string;
  imageUrl: string;
  currentPrice: number;
  sector: string;
}

interface Holding {
  id: number;
  userId: number;
  stockId: number;
  quantity: number;
  avgPrice: number;
  stock: StockInfo;
  profitLossAmount?: number;
  profitLossPercent?: number;
}

@Component({
  selector: 'app-holdings',
  templateUrl: './holdings.component.html',
  styleUrls: ['./holdings.component.css'],
  standalone: true,
  imports: [CommonModule,FormsModule]
})
export class HoldingsComponent implements OnInit {

  user: UserProfile | null = null;
  userId: number | null = null;
  holdings: Holding[] = [];

  loading = true;
  error: string | null = null;

  searchQuery: string = '';
  pageSize: number = 5;
  currentPage: number = 0;
  totalRecords: number = 0;

  totalInvested: number = 0;
  totalProfitLoss: number = 0;
  profitLossPercent: number = 0;
  totalValue: number = 0;

  constructor(
    private userService: UserService,
    private notyf: NotyfService,
    private portfolioService: PortfolioService
  ) {}

  ngOnInit(): void {
    this.loadUser();
  }

  loadUser(): void {
    this.userService.currentUser$.subscribe((userData) => {
      this.user = userData;
      if(this.user){
        this.userId = this.user.userId;
        this.loadHoldings(this.user.userId,this.currentPage, this.pageSize);

        console.log("User ID: ", this.userId);
        this.portfolioService.getHoldings(this.userId).subscribe((response) => {
        this.totalInvested = response.data.reduce((sum : number ,h : Holding) => sum + (h.avgPrice * h.quantity),0).toFixed(2);
        this.totalProfitLoss = response.data.reduce((sum : number ,h : Holding) => sum + ((h.stock.currentPrice - h.avgPrice) * h.quantity),0).toFixed(2);
        this.profitLossPercent = this.totalInvested > 0 ? (this.totalProfitLoss / this.totalInvested) * 100 : 0;
        this.totalValue = Math.ceil(
          (Number(this.totalInvested) || 0) + (Number(this.totalProfitLoss) || 0)
        );
      });
      }
    });

    this.userService.getUserProfile().subscribe((res) => {
      this.userService.setUser(res.data);
    });
  }

  loadHoldings(userId: number,page: number, size:number) {
    this.portfolioService.getHoldingsPaginated(userId,page,size).subscribe({
      next: (res) => {
        console.log(res.data.content);
        this.holdings = res.data.content.map((holding: Holding) => {
          const profitLossAmount = (holding.stock.currentPrice - holding.avgPrice) * holding.quantity;
          const profitLossPercent = ((holding.stock.currentPrice - holding.avgPrice) / holding.avgPrice) * 100;
          return {
            ...holding,
            profitLossAmount,
            profitLossPercent
          };
        });
        this.totalRecords = res.data.totalElements;
        this.currentPage = res.data.pageNumber;
        this.pageSize = res.data.pageSize;
        this.loading = false;
      },
      error: (err) => {
        this.notyf.error("Error fetching holdings");
        console.error(err);
      }
    });
  }



  onSearch(): void {
    this.currentPage = 0;

    setTimeout(()=>{
      this.loadHoldings(this.userId!,this.currentPage, this.pageSize);  
    },1000);
  }

  onPageSizeChange(): void {
    this.currentPage = 0;
    this.loadHoldings(this.userId!,this.currentPage, this.pageSize);
  }

  onPageChange(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages) {
      this.currentPage = newPage;
      this.loadHoldings(this.userId!, this.currentPage, this.pageSize);
    }
  }

  get totalPages(): number {
    return Math.ceil(this.totalRecords / this.pageSize);
  }
}
