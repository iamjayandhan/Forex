import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NotyfService } from '../services/notyf.service';
import { UserProfile } from '../models/user-profile.model';
import { UserService } from '../services/user.service';
import { PortfolioService } from '../services/portfolio.service';

@Component({
  selector: 'app-sell',
  templateUrl: './sell.component.html',
  styleUrls: ['./sell.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})  
export class SellComponent implements OnInit {
  user: UserProfile | null = null;

  userId: number | null = null;
  userEmail: string | '' = '';

  enteredMPIN: string = '';
  mpinError: string = '';
  balanceError: string = '';

  stock: any;
  quantity: number = 1;

  isPlacingSellOrder: boolean = false;
  showConfirmModal: boolean = false;

  readonly SELL_LIMIT = 50000;

  constructor(
    public router: Router,
    private notyf: NotyfService,
    private userService: UserService,
    private portfolioService: PortfolioService,
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.stock = navigation?.extras?.state?.['holding'];
    console.log("stock data for sell:", this.stock);
  }

  ngOnInit(): void {
    if (!this.userService.getUser()) {
      this.userService.getUserProfile().subscribe((res) => {
        this.userService.setUser(res.data);

        // Now subscribe after setting the user
        this.userService.currentUser$.subscribe((userData) => {
          this.user = userData;
          this.userId = this.user?.userId || null;
          this.userEmail = this.user?.email || '';

          console.log("after fetching: email:", this.userEmail);
          console.log("after fetching: stock id", this.stock.stockId);
        });
      });
    } else {
      // If already set, subscribe immediately
      this.userService.currentUser$.subscribe((userData) => {
        this.user = userData;
        this.userId = this.user?.userId || null;
        this.userEmail = this.user?.email || '';

        console.log("already exists:", this.userId, this.userEmail);
      });
    }
  }

  onQuantityChange(value: number) {
    if (value < 1 || !Number.isInteger(value)) {
      this.notyf.error('Quantity must be a positive integer');
      this.quantity = 0;
    } 
    else if(value> this.stock.quantity) {
      this.notyf.error('Quantity exceeds available stock');
      this.quantity = this.stock.quantity;

    }else {
      this.quantity = Math.floor(value);
    }
  }

  incrementQty(){
    if(this.quantity < this.stock.quantity){
      this.quantity++;
    }else{
      this.notyf.error('Quantity exceeds available stock');
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

    if(this.quantity > this.stock.quantity) {
      this.balanceError = 'Insufficient quantity';
      this.notyf.error('Insufficient quantity');
      return;
    }
    this.confirmSellOrder();
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

    //[BUG] Stuck Bootstrap Modal Backdrop
    //Modal backdrop not removed after close
    //Page remains darkened after Bootstrap modal is closed
    //Bootstrap modal leaves .modal-open class and disables page

    // const modalEl = document.getElementById('confirmModal');
    // const modalBackdrop = document.querySelector('.modal-backdrop');

    // if(modalEl){
    //   const modalInstance = bootstrap.Modal.getInstance(modalEl);
    //   modalInstance?.hide();
    // }

    // //remove leftover backdrop if present
    // if(modalBackdrop){
    //   modalBackdrop.remove();
    // }

    // document.body.classList.remove('modal-open');
    // document.body.style.removeProperty();
  }

  confirmSellOrder() {
  this.isPlacingSellOrder = true;

  const orderPayload = {
    email: this.user?.email,
    stockId: this.stock.stockId,
    quantity: this.quantity,
  };

  this.portfolioService.placeSellOrder(orderPayload).subscribe({
    next: (response) => {
      this.isPlacingSellOrder = false;
      this.closeConfirmModal();
      this.notyf.success(response.message);
      this.router.navigate(['/portfolio']); 
    },
    error: (error) => {
      this.isPlacingSellOrder = false;
      this.notyf.error('Failed to place sell order. Please try again.');
      console.error(error);
    }
  });

    const transactionPayload = {
    userId: this.user!.userId,
    amount: this.totalCost,
    transactionType: 'DEPOSIT',
    transactionReason: 'STOCK_SELL',
    balance: this.user!.balance + this.totalCost,
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

  //valid qty check
  get isQuantityInvalid(): boolean {
    return this.quantity < 1 || !Number.isInteger(this.quantity);
  }

  get isSellLimitExceeded(): boolean {
    if(this.quantity == 1){
      return false;
    }
    return this.subtotal > this.SELL_LIMIT;
  }

  //total cost calculation ============

  //1. BROKERAGE:
  //Subtotal = stock price * qty
  get subtotal(): number {
    return this.isQuantityInvalid ? 0 : +((this.stock?.stock?.currentPrice || 0) * this.quantity).toFixed(2); //stock price from table * qty
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

  //Stamp Duty = No stamp duty for selling
  get stampDuty(): number { 
    return 0;
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
      this.subtotal -
      this.brokerage -
      this.exchangeTxnCharges -
      this.stampDuty -
      this.ipft -
      this.sebiCharges -
      this.stt -
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
}
