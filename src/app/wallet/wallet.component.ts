import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service'; // Assuming user service for wallet and profile
import { NotyfService } from '../services/notyf.service'; // Assuming you're using Notyf for notifications
import { UserProfile } from '../models/user-profile.model'; // Assuming UserProfile model
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PortfolioService } from '../services/portfolio.service';
import { ExportService } from '../services/export.service';

@Component({
  selector: 'app-wallet-management',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.css'],
  standalone: true,
  imports: [CommonModule,FormsModule]
})
export class WalletComponent implements OnInit {
  user: UserProfile | null = null;
  amount: number = 0;
  selectedOperation: string = 'deposit';
  operationMessage: string = '';
  operationSuccess: boolean = false;
  currentWallet: number = 0;

  //pagination state
  transactions : any[] = [];
  currentPage: number = 0;
  pageSize: number = 5;
  pageSizeOptions: number[] = [5, 10, 20];
  totalPages: number = 0;
  totalItems: number = 0;

  constructor(
    private userService: UserService, 
    private notyf: NotyfService,
    private portfolioService: PortfolioService,
    private exportService: ExportService
  ) {}

  activeTab = 'wallet';

  ngOnInit(): void {
    this.userService.currentUser$.subscribe((userData) => {
      this.user = userData;
      if (this.user) {
        this.currentWallet = this.user.balance;
        // this.loadWalletTransactions();
        this.loadWalletTransactionsPaginated(this.currentPage, this.pageSize);
      }
    });

    // Fetch from API if user is not set
    if (!this.userService.getUser()) {
      this.userService.getUserProfile().subscribe((response) => {
        this.userService.setUser(response.data);
      });
    }
  }

  // Perform the operation (deposit/withdraw)
  performOperation(): void {
    if (this.amount <= 0 || !this.isAmountValid) {
      this.notyf.error('Please enter a valid amount.');
      return;
    }

    if(this.amount > 10000) {
      this.notyf.error('Amount exceeds the limit of ₹10,000.');
      return;
    }

    if(this.amount < 100){
      this.notyf.error('Minimum amount for deposit/withdraw is ₹100.');
      return;
    }

    const payload = {
      email: this.user!.email,
      amount: this.amount,
      operation: this.selectedOperation,
    };

    this.userService.updateWallet(payload)
      .subscribe({
        next: (response) => {
          // Update the user's wallet after operation
          this.currentWallet = response.data.balance;
          this.operationSuccess = true;
          this.operationMessage = `${this.selectedOperation.charAt(0).toUpperCase() + this.selectedOperation.slice(1)} successful! Your new wallet balance is ₹${this.currentWallet}`;
          this.amount = 0;
          this.notyf.success(this.operationMessage);
        },
        error: (err) => {
          this.operationSuccess = false;
          this.operationMessage = `Failed to perform operation: ${err.error.message}`;
          this.notyf.error(this.operationMessage);
        }
      });

      const isDeposit = this.selectedOperation.toLowerCase() === 'deposit';

      const transactionPayload = {
        userId: this.user!.userId,
        amount: this.amount,
        transactionType: this.selectedOperation.toUpperCase(),
        transactionReason: 'SELF',
        balance: isDeposit ? 
        this.currentWallet + this.amount :
        this.currentWallet - this.amount,
      };

      // console.log(transactionPayload);

      this.portfolioService.saveWalletTransaction(transactionPayload).subscribe({
        next: (response) => {
          console.log("Transaction saved successfully:", response);
          this.loadWalletTransactionsPaginated(this.currentPage, this.pageSize); // Reload transactions after saving
        },
        error: (err) => {
          console.error("Error saving transaction:", err);
        }
      })
  }

//   loadWalletTransactions(): void {
//   this.portfolioService.getWalletTransactions(this.user!.userId).subscribe({
//     next: (res) => {
//       if (res && res.status === 200 && res.data) {
//         this.transactions = res.data;
//       }
//     },
//     error: (err) => {
//       console.error("Failed to load transactions", err);
//     }
//   });
// }

  downloadWalletTransactions() {
    this.exportService.downloadWalletTransactionsCSV(this.user?.userId!).subscribe(blob => {
      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = 'wallet-transactions.csv';
      a.click();
      URL.revokeObjectURL(objectUrl);
    });
  }

  onPageSizeChange(){
    this.currentPage = 0;
    this.loadWalletTransactionsPaginated(this.currentPage, this.pageSize);
  }

  loadWalletTransactionsPaginated(page: number, pageSize: number): void {
    if(!this.user) return;

    this.portfolioService.getWalletTransactionsPaginated(this.user.userId, page, pageSize).subscribe({
      next: (res) => {
          if (res && res.status === 200 && res.data) {
            this.transactions = res.data.transactions;
            this.currentPage = res.data.currentPage;
            this.totalPages = res.data.totalPages;
            this.totalItems = res.data.totalItems;
          }
        },
        error: (err) => {
          console.error("Failed to load paginated transactions", err);
        }
    })
  }

  goToPreviousPage(): void {
    if(this.currentPage > 0){
      this.loadWalletTransactionsPaginated(this.currentPage - 1, this.pageSize);
      this.currentPage--;
    }
  }

  goToNextPage(): void {
    if(this.currentPage < this.totalPages - 1){
      this.loadWalletTransactionsPaginated(this.currentPage + 1, this.pageSize);
      this.currentPage++;
    }
  }

  // Check if the amount is valid
  get isAmountInvalid(): boolean {
    return this.amount <= 0;
  }

  get isAmountExceedsLimit(): boolean {
    return this.amount > 10000;
  }

  get isAmountValid(): boolean {
    const amt = Number(this.amount);
    return amt >= 100 && amt <= 10000;
  }


}
