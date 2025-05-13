import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service'; // Assuming user service for wallet and profile
import { NotyfService } from '../services/notyf.service'; // Assuming you're using Notyf for notifications
import { UserProfile } from '../models/user-profile.model'; // Assuming UserProfile model
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  constructor(private userService: UserService, private notyf: NotyfService) {}

  ngOnInit(): void {
    this.userService.currentUser$.subscribe((userData) => {
      this.user = userData;
      if (this.user) {
        console.log("User data for wallet:", this.user);
        this.currentWallet = this.user.balance;
      }
    });

    // Fetch from API if user is not set
    if (!this.userService.getUser()) {
      this.userService.getUserProfile().subscribe((response) => {
        console.log("User data fetched from API:", response.data);
        this.userService.setUser(response.data); // This should internally update currentUser$
      });
    }
  }

  // Perform the operation (deposit/withdraw)
  performOperation(): void {
    if (this.amount <= 0 || !this.isAmountValid) {
      this.notyf.error('Please enter a valid amount.');
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
  }

  // Check if the amount is valid
  get isAmountInvalid(): boolean {
    return this.amount <= 0;
  }

  get isAmountValid(): boolean {
    return this.amount > 0;
  }
}
