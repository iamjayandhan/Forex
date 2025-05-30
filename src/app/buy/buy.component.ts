import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NotyfService } from '../services/notyf.service';
import { UserProfile } from '../models/user-profile.model';
import { UserService } from '../services/user.service';
import { PortfolioService } from '../services/portfolio.service';

declare var bootstrap: any;

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
  mpinError: string = '';
  balanceError: string = '';

  stock: any;
  quantity: number = 1;

  isPlacingOrder: boolean = false;
  showConfirmModal: boolean = false;

  readonly SELL_LIMIT = 100000;

  constructor(
    public router: Router,
    private notyf: NotyfService,
    private userService: UserService,
    private portfolioService: PortfolioService,
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.stock = navigation?.extras?.state?.['stock'];

    // console.log("stock data for buy:", this.stock);
  }

  ngOnInit(): void {
    this.userService.currentUser$.subscribe((userData) => {
      this.user = userData;
      // console.log("user acc info for purchase:",userData);
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
      this.quantity = 0;
    }
    else if (value > this.stock.ipoQty) {
      this.notyf.error('Quantity exceeds available stock');
      this.quantity = this.stock.ipoQty;
    } 
    else {
      this.quantity = Math.floor(value);
    }
  }

  incrementQty(){
    if(this.quantity < this.stock.ipoQty){
      this.quantity++;
    }
  }
  decrementQty(){
    if(this.quantity > 1){
      this.quantity--;
    }
  }

  handleModalConfirm() {

    this.mpinError = '';
    this.balanceError = '';

    if (this.isQuantityInvalid) {
      this.notyf.error('Invalid quantity');
      return;
    }

    if (this.enteredMPIN !== this.user?.mpin) {
      this.mpinError = 'Invalid MPIN';
      this.notyf.error('Invalid MPIN');
      return;
    }

    if (this.totalCost > (this.user?.balance || 0)) {
      this.balanceError = 'Insufficient balance';
      this.notyf.error('Insufficient balance');
      return;
    }

    this.confirmBuyOrder();
  }

  openConfirmModal() {
    console.log('Modal opened');
    this.showConfirmModal = true;
  }

  closeConfirmModal() {
    console.log('Modal closed');
    this.showConfirmModal = false;
    this.enteredMPIN = '';
    this.mpinError = '';
    this.balanceError = '';
    
    // const backdrop = document.querySelector('.modal-backdrop');
    // if (backdrop) {
    //   backdrop.remove();
    // }
  }

  confirmBuyOrder() {
  this.isPlacingOrder = true;

  const orderPayload = {
    email: this.user?.email,
    stockId: this.stock.id,
    quantity: this.quantity,
    balance: this.user?.balance,
    transactionType: 'BUY',
    pricePerUnit: this.stock.currentPrice,
    subtotal: this.subtotal,
    brokerage: this.brokerage,
    exchangeTxnCharges: this.exchangeTxnCharges,
    stampDuty: this.stampDuty,
    ipft: this.ipft,
    sebiCharges: this.sebiCharges,
    stt: this.stt,
    gst: this.gst,
    totalAmount: this.totalCost,
    avgPrice: this.stock.currentPrice,
  };


  this.portfolioService.placeBuyOrder(orderPayload).subscribe({
    next: (response) => {
      this.isPlacingOrder = false;
      this.closeConfirmModal();
      this.notyf.success(response.message);
      this.router.navigate(['/portfolio']); 
    },
    error: (error) => {
      this.isPlacingOrder = false;
      this.notyf.error('Failed to place order. Please try again.');
      console.error(error);
    }
  });

  console.log("User balance: ",this.user!.balance - this.totalCost);

  const transactionPayload = {
    userId: this.user!.userId,
    amount: this.totalCost,
    transactionType: 'WITHDRAW',
    transactionReason: 'STOCK_PURCHASE',
    balance: this.user!.balance - this.totalCost,
  };

  this.portfolioService.saveWalletTransaction(transactionPayload).subscribe({
    next : (response)=>{
      console.log(response);
    },
    error : (err)=>{
      console.log(err);
    }
  })
}

  get isBuyLimitExceeded(): boolean {
    // Allow if quantity is exactly 1 regardless of subtotal
    if (this.quantity === 1) return false;

    // For quantities > 1, check the subtotal limit
    return this.subtotal > this.SELL_LIMIT;
  }

  //valid qty check
  get isQuantityInvalid(): boolean {
    return this.quantity < 1 || !Number.isInteger(this.quantity);
  }

  //total cost calculation ============

  //1. BROKERAGE:
  //Subtotal = stock price * qty
  get subtotal(): number {
    return this.isQuantityInvalid ? 0 : +((this.stock?.currentPrice || 0) * this.quantity).toFixed(2); //stock price from table * qty
  }

  //Brokerage = 0.25% of subtotal
  get brokerage(): number { 
    const calculated = +(this.subtotal * 0.0025).toFixed(2); //0.25%
    return Math.min(calculated,20);
  }

  //2. External charges:
  //Exchange Txn Charges(ETC)
  //NSE: 0.00325% of the subtotal
  //BSE: 0.0030% of the subtotal
  //etc = subtotal * NSE/BSE rate
  get exchangeTxnCharges(): number {
    if (!this.stock) return 0;

    const rate = this.stock.exchange === 'NSE' ? 0.0000325 : 0.00003;
    return +(this.subtotal * rate).toFixed(2); // round to 2 decimal places
  }

  //Stamp Duty = 0.015% of the subtotal
  get stampDuty(): number { 
    return +(this.subtotal * 0.00015).toFixed(2); //0.015%
  }

  //ipft = 0.0002 ruppee per share
  get ipft(): number {
    return +(this.quantity * 0.0002).toFixed(2); //0.01%
  }

  //SEBI charges = 0.0001% of the subtotal
  get sebiCharges(): number {
    return +(this.subtotal * 0.00001).toFixed(2); //0.01%
  }

  //3. Taxes:
  //Securities Transaction Tax (STT) = 0.025% of the subtotal
  get stt(): number {
    return +(this.subtotal * 0.00025).toFixed(2); //0.025%
  }

  //GST = 18% of the brokerage
  //GST = Etc + SEBI + brokerage
  get gst(): number {
    return +((this.brokerage + this.exchangeTxnCharges + this.sebiCharges) * 0.18).toFixed(2); 
  }

  // FINAL TOTAL COST
  get totalCost(): number {
    return +(
      this.subtotal +
      this.brokerage +
      this.exchangeTxnCharges +
      this.stampDuty +
      this.ipft +
      this.sebiCharges +
      this.stt +
      this.gst
    ).toFixed(2);
  }

  //extras than subtotal
  get extras(): number {
    return +(
      this.brokerage +
      this.exchangeTxnCharges +
      this.stampDuty +
      this.ipft +
      this.sebiCharges +
      this.stt +
      this.gst
    ).toFixed(2);
  }

  stockNotAvailable() {
    return this.stock?.ipoQty === 0;
  }
}
