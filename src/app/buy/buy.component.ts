import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NotyfService } from '../services/notyf.service';
import { UserProfile } from '../models/user-profile.model';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-buy',
  templateUrl: './buy.component.html',
  styleUrls: ['./buy.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class BuyComponent implements OnInit {
  user: UserProfile | null = null;
  enteredMPIN: string = '';

  stock: any;
  quantity: number = 1;

  constructor(
    public router: Router,
    private notyf: NotyfService,
    private userService: UserService
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.stock = navigation?.extras?.state?.['stock'];
  }

  ngOnInit(): void {

    //listen to user data changes
    this.userService.currentUser$.subscribe((userData) => {
      this.user = userData;
      console.log("user acc info for purchase:",userData);
    });

    // Fetch user data if not already set
    if (!this.userService.getUser()) {
      this.userService.getUserProfile().subscribe((data) => {
        this.userService.setUser(data);
      });
    }
  }

  onQuantityChange(value: number) {
    if (value < 1 || !Number.isInteger(value)) {
      this.notyf.error('Quantity must be a positive integer');
      this.quantity = 1;
    } else {
      this.quantity = Math.floor(value);
    }
  }

  handleModalConfirm() {
    if (this.isQuantityInvalid) {
      this.notyf.error('Invalid quantity');
      return;
    }

    if (this.enteredMPIN !== this.user?.mpin) {
      this.notyf.error('Invalid MPIN');
      return;
    }

    if (this.totalCost > (this.user?.balance || 0)) {
      this.notyf.error('Insufficient balance');
      return;
    }

    const payload = {
      email: this.user?.email,
      amount: this.totalCost,
      operation: 'withdraw',
    };

    this.userService.updateWallet(payload).subscribe({
      next: (response) =>{
        console.log("response for wallet update:",response.data.balance);
        this.notyf.success(`✅ You bought ${this.quantity} units of ${this.stock.name} for ₹${this.totalCost}`);    
        this.router.navigate(['/market']);
      },
      error: (err) => {
        this.notyf.error('Failed to update balance. please try again');
        console.error(err);
      }
    })

  }

  //valid qty check
  get isQuantityInvalid(): boolean {
    return this.quantity < 1 || !Number.isInteger(this.quantity);
  }

  //total cost calculation
  get subtotal(): number {
    return this.isQuantityInvalid ? 0 : (this.stock?.currentPrice || 0) * this.quantity; //stock price from table * qty
  }

  //transaction fee and tax calculation
  get transactionFee(): number {
    return this.isQuantityInvalid ? 0 : this.subtotal * 0.01; //1% of subtotal
  }

  get tax(): number {
    return this.isQuantityInvalid ? 0 : this.subtotal * 0.15; //15% of subtotal
  }

  get totalCost(): number {
    return this.subtotal + this.transactionFee + this.tax; // subtotal + transaction fee + tax
  }
}
