import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NotyfService } from '../services/notyf.service';
import { UserProfile } from '../models/user-profile.model';
import { UserService } from '../services/user.service';
import { PortfolioService } from '../services/portfolio.service';
import { NseService } from '../services/nse.service';
import { FpxPaymentService } from '../services/fpx-payment.service';
import { LoaderService } from '../services/loader.service';

@Component({
  selector: 'app-buy',
  templateUrl: './buy.component.html',
  styleUrls: ['./buy.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})  
export class BuyComponent implements OnInit {

  //hidden payment form
  @ViewChild('paymentForm') paymentForm!: ElementRef<HTMLFormElement>;
  //fields
  merchantName = 'MOBI ASIA SDN. BHD.';
  reference = '';
  amount : number = 0;
  sellerOrderNo = '';

  customerName = '';
  customerMobile = '';
  customerEmail = '';

  paymentMethod: '' | 'card' | 'internetBanking' | 'eWallet' = '';
  selectedBankType: string = '01';
  selectedBank: any = null;

  b2cBanks: any[] = [];
  b2bBanks: any[] = [];
  filteredBanks: any[] = [];

  //buy component's variables
  user: UserProfile | null = null;
  userId: number = 0;
  enteredMPIN: string = '';
  mpinError: string = '';
  balanceError: string = '';

  stock: any;
  stockId: number = -1;
  quantity: number = 1;
  checksum: string = '';
  subMid: string = '201100000012450';

  isPlacingOrder: boolean = false;
  showConfirmModal: boolean = false;

  readonly SELL_LIMIT = 100000;
  
  // Controls dropdown visibility
  showDropdown = false;

  // Default bank logo URL if bank has no logo
  defaultLogo = 'https://picsum.photos/200';

  // Search text for filtering bank list
  bankSearch: string = '';

  constructor(
    public router: Router,
    private notyf: NotyfService,
    private userService: UserService,
    private portfolioService: PortfolioService,
    private nseService: NseService,
    private fpxService: FpxPaymentService,
    private loader: LoaderService
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.stock = navigation?.extras?.state?.['stock'];
    this.stockId = this.stock.id;

    console.log("The stock user going to buy is: "+ this.stock.id);
    // console.log("stock data for buy:", this.stock);
  }

  ngOnInit(): void {
  if (!this.userService.getUser()) {
    this.userService.getUserProfile().subscribe((res) => {
      this.userService.setUser(res.data);

      this.userService.currentUser$.subscribe((userData) => {
        this.user = userData;
        this.userId = this.user?.userId!;

        // for hidden form
        this.customerName = this.user?.fullName!;
        this.customerMobile = this.user?.mobileNumber!;
        this.customerEmail = this.user?.email!;
        this.amount = this.totalCost;
      });
    });
  } else {
    this.userService.currentUser$.subscribe((userData) => {
      this.user = userData;

      // for hidden form
      this.customerName = this.user?.fullName!;
      this.customerMobile = this.user?.mobileNumber!;
      this.customerEmail = this.user?.email!;
      this.amount = this.totalCost;
    });
  }

  // Always run these
  this.getNseInfo(this.stock.symbol);
  this.generateReference();
  this.fetchBankList();
}

  // encryptPayload(minifiedString: string, param1: string, param2: string): string {
  //   const CIPHER_KEY_LEN = 256;
  //   const ITERATION_COUNT = 65536;

  //   try {
  //     // 1. Generate random 16-byte IV
  //     const iv = CryptoJS.lib.WordArray.random(16);

  //     // 2. Generate AES key from param1 and param2 using PBKDF2WithHmacSHA256
  //     const key = CryptoJS.PBKDF2(param1, CryptoJS.enc.Utf8.parse(param2), {
  //       keySize: CIPHER_KEY_LEN / 32,
  //       iterations: ITERATION_COUNT,
  //       hasher: CryptoJS.algo.SHA256,
  //     });

  //     // 3. Encrypt with AES/CBC/PKCS7
  //     const encrypted = CryptoJS.AES.encrypt(minifiedString, key, {
  //       iv: iv,
  //       mode: CryptoJS.mode.CBC,
  //       padding: CryptoJS.pad.Pkcs7, // CryptoJS uses PKCS7 which is compatible with PKCS5
  //     });

  //     // 4. Convert to WordArray to manipulate IV + CipherText
  //     const encryptedWords = CryptoJS.enc.Base64.parse(encrypted.toString());
  //     const combined = iv.concat(encryptedWords);

  //     // 5. Encode final result as Base64
  //     return CryptoJS.enc.Base64.stringify(combined);
  //   } catch (error) {
  //     console.error('Encryption error:', error);
  //     return '';
  //   }
  // }


    // Toggle dropdown visibility and reset bank search
  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
    this.bankSearch = '';
    this.updateFilteredBanks();
  }

  //methods for hidden form!
   private generateReference(): void {
    const today = new Date();
    this.reference = `${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2,'0')}${today.getDate().toString().padStart(2,'0')}`;
  }

  // private generateSellerOrderId(): void {
  //   this.sellerOrderNo = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  // }
  private generateSellerOrderId(userId: number, stockId: number,quantity: number, subTotalPrice: number): void {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);

    // Replace dot with 'D' in totalPrice (e.g., 2450.75 → 2450D75)
    const sanitizedTotalPrice = subTotalPrice.toFixed(2).replace('.', 'D');

    this.sellerOrderNo = `ORDX${userId}X${stockId}X${quantity}X${sanitizedTotalPrice}X${random}`;
    console.log(this.sellerOrderNo);
  }


  private fetchBankList(): void {
    this.fpxService.getBankList().subscribe({
      next: (res) => {
        console.log(res);
        this.b2cBanks = res.responseDataB2C?.bankList || [];
        this.b2bBanks = res.responseDataB2B?.bankList || [];
        this.updateFilteredBanks();
      },
      error: (err) => console.error(err)
    });
  }

  onBankTypeChange(): void {
    this.selectedBank = null;
    this.updateFilteredBanks();
  }

  // Update filtered bank list based on selected bank type and search input
  updateFilteredBanks(): void {
    const sourceList =
      this.selectedBankType === '01'
        ? this.b2cBanks
        : this.selectedBankType === '02'
        ? this.b2bBanks
        : [];

    const search = this.bankSearch.trim().toLowerCase();

    this.filteredBanks = sourceList.filter(bank =>
      bank.BankDisplayName.toLowerCase().includes(search)
    );
  }

  // Called when user types in the bank search input
  filterBankList(): void {
    this.updateFilteredBanks();
  }

  selectBank(bank: any): void {
    this.selectedBank = bank;
    this.showDropdown = false;
  }

  canSubmit(): boolean {
    if (!this.customerName.trim() || !this.customerMobile.trim()) return false;
    if (!this.paymentMethod) return false;
    if (this.paymentMethod === 'internetBanking') {
      if (!this.selectedBankType || !this.selectedBank) return false;
    }
    return true;
  }

  submitForm(): void {
    this.paymentForm.nativeElement.submit();
  }
  //end of methods for hidden form!

  getNseInfo(symbol: string){
    // console.log(symbol);
    this.nseService.fetchEquityChartDetails(symbol).subscribe({
      next: (response)=>{
        console.log(response);
      },
      error: (err)=> {
        console.log(err);
      },
    });
  }

  handleProceedToBuy() {
    this.generateSellerOrderId(this.user?.userId!, this.stockId, this.quantity, this.subtotal);

    // const minifiedString = `${this.totalCost}|${this.sellerOrderNo}|${this.subMid}`;
    const MID = "FPX000000054555";
    const TID = "27965678";

    this.fpxService.encryptPayload(this.totalCost,this.sellerOrderNo,this.subMid, MID, TID).subscribe({
      next: (encrypted) => {
        this.checksum = encrypted;
        console.log('Checksum:', this.checksum);
      },
      error: (err) => {
        console.error('Encryption failed:', err);
      }
    });
  }


  onQuantityChange(value: number) {
    if (value < 1 || !Number.isInteger(value)) {
      this.quantity = 0;
    } else if (value > this.stock.ipoQty) {
      this.notyf.error('Quantity exceeds available stock');
      this.quantity = this.stock.ipoQty;
    } else {
      this.quantity = Math.floor(value);
    }
    console.log("Qty:", this.quantity, "Subtotal:", this.subtotal, "Total:", this.totalCost, "Amount:", this.amount);
  }


  incrementQty(){
    if(this.quantity < this.stock.ipoQty){
      this.quantity++;
      this.amount = this.totalCost;
    }
  }
  decrementQty(){
    if(this.quantity > 1){
      this.quantity--;
      this.amount = this.totalCost;
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
  }

  // confirmBuyOrder() {
  //   this.isPlacingOrder = true;

  //   const orderPayload = {
  //     email: this.user?.email,
  //     stockId: this.stock.id,
  //     quantity: this.quantity,
  //     subtotal: this.subtotal,
  //     totalAmount: this.totalCost,
  //     balance: this.user?.balance,
  //   };

  //   // localStorage.setItem('orderPayload', JSON.stringify(orderPayload));

  //   this.portfolioService.placeBuyOrder(orderPayload).subscribe({
  //     next: (response) => {
  //       this.isPlacingOrder = false;
  //       this.closeConfirmModal();
  //       this.notyf.success(response.message);
  //     },
  //     error: (error) => {
  //       this.isPlacingOrder = false;
  //       this.notyf.error('Failed to place order. Please try again.');
  //       console.error(error);
  //     }
  //   });

  //   // console.log("User balance: ",this.user!.balance - this.totalCost);
    
  //   this.isPlacingOrder = false;

  //   const transactionPayload = {
  //     userId: this.user!.userId,
  //     amount: this.totalCost,
  //     transactionType: 'WITHDRAW',
  //     transactionReason: 'STOCK_PURCHASE',
  //     balance: this.user!.balance - this.totalCost,
  //   };

  //   // localStorage.setItem('transactionPayload', JSON.stringify(transactionPayload));
  //   this.submitForm();

  //   this.portfolioService.saveWalletTransaction(transactionPayload).subscribe({
  //     next : (response)=>{
  //       console.log(response);
  //     },
  //     error : (err)=>{
  //       console.log(err);
  //     }
  //   })

  //   setTimeout(()=>{
  //     this.closeConfirmModal();
  //   },2000);
  // }
  
 confirmBuyOrder() {
    this.loader.show("Connecting with FPX payment gateway for smoother process...please wait.");
    this.isPlacingOrder = true;

    const orderPayload = {
      userId: this.user!.userId,
      stockId: this.stock.id,
      quantity: this.quantity,
      subTotalPrice: this.subtotal,
      extraCharges: this.totalCost - this.subtotal,
      transactionType: "BUY"
    };

    const orderPayload2 = {
      email: this.user?.email,
      stockId: this.stock.id,
      quantity: this.quantity,
      subtotal: this.subtotal,
      totalAmount: this.totalCost,
      balance: this.user?.balance,
    };

    console.log('Order Payload:', orderPayload);

    // Step 1: Create pending order
    this.fpxService.createPendingOrder(orderPayload).subscribe({
      next: (response) => {
        console.log('Pending order created:', response);
        
        // Step 2: Only if pending order creation succeeds
        this.portfolioService.placeBuyOrder(orderPayload2).subscribe({
          next: () => {
            this.isPlacingOrder = false;
            this.closeConfirmModal();
            this.submitForm();  // move this here to be sure everything is placed
          },
          error: (buyError) => {
            this.isPlacingOrder = false;
            this.notyf.error('Failed to place buy order. Please try again.');
            console.error(buyError);
          }
        });
      },
      error: (error) => {
        this.isPlacingOrder = false;
        this.notyf.error('Failed to place order. Please try again.');
        console.error('Error creating pending order:', error);
      }
    });
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
