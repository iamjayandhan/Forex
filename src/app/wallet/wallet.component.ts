import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service'; // Assuming user service for wallet and profile
import { NotyfService } from '../services/notyf.service'; // Assuming you're using Notyf for notifications
import { UserProfile } from '../models/user-profile.model'; // Assuming UserProfile model
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PortfolioService } from '../services/portfolio.service';

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

  transactions : any[] = [];

  constructor(
    private userService: UserService, 
    private notyf: NotyfService,
    private portfolioService: PortfolioService,
  ) {}

  ngOnInit(): void {
    this.userService.currentUser$.subscribe((userData) => {
      this.user = userData;
      if (this.user) {
        this.currentWallet = this.user.balance;
        this.loadWalletTransactions();
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
        balance: isDeposit ? 
        this.currentWallet + this.amount :
        this.currentWallet - this.amount,
      };

      // console.log(transactionPayload);

      this.portfolioService.saveWalletTransaction(transactionPayload).subscribe({
        next: (response) => {
          console.log("Transaction saved successfully:", response);
          this.loadWalletTransactions(); // Reload transactions after saving
        },
        error: (err) => {
          console.error("Error saving transaction:", err);
        }
      })
  }

  loadWalletTransactions(): void {
  this.portfolioService.getWalletTransactions(this.user!.userId).subscribe({
    next: (res) => {
      if (res && res.status === 200 && res.data) {
        this.transactions = res.data;
        console.log("Transactions loaded successfully:", this.transactions);
      }
    },
    error: (err) => {
      console.error("Failed to load transactions", err);
    }
  });
}


  // Check if the amount is valid
  get isAmountInvalid(): boolean {
    return this.amount <= 0;
  }

  get isAmountExceedsLimit(): boolean {
    return this.amount > 10000;
  }

  get isAmountValid(): boolean {
    return this.amount > 0;
  }
}
