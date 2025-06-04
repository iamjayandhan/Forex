import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FpxPaymentService } from '../services/fpx-payment.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-fpx-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fpx-payment.component.html',
  styleUrls: ['./fpx-payment.component.css']
})
export class FpxPaymentComponent implements OnInit {

  // Bank lists fetched from service
  b2cBanks: any[] = [];
  b2bBanks: any[] = [];

  // Banks displayed in dropdown filtered by bank type and search
  filteredBanks: any[] = [];

  // Search text for filtering bank list
  bankSearch: string = '';

  // Payment & Customer data bindings
  customerName = '';
  customerMobile = '';
  customerEmail = '';

  merchantName: string = 'MOBI ASIA SDN. BHD.';
  reference: string = '';
  amount: number = 5.0;
  sellerOrderNo: string = '';

  // Payment method and bank selection
  paymentMethod: '' | 'card' | 'internetBanking' | 'eWallet' = '';
  selectedBankType: '' | '01' | '02' = '';
  selectedBank: any = null;

  // Controls dropdown visibility
  showDropdown = false;

  // Default bank logo URL if bank has no logo
  defaultLogo = 'https://picsum.photos/200';

  constructor(private fpxService: FpxPaymentService) {}

  ngOnInit(): void {
    this.generateReference();
    this.generateSellerOrderId();
    this.fetchBankList();
  }

  @ViewChild("paymentForm") paymentForm!: ElementRef<HTMLFormElement>; 

  // Generate reference string based on current date: yyyyMMdd
  private generateReference(): void {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    this.reference = `${yyyy}${mm}${dd}`;
  }

  // Create seller order number based on reference
  private generateSellerOrderId(): void {
  this.sellerOrderNo = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    // this.sellerOrderNo = `JD`;
  }

  // Fetch bank lists for B2C and B2B from the service
  private fetchBankList(): void {
    this.fpxService.getBankList().subscribe({
      next: (res) => {
        this.b2cBanks = res.responseDataB2C?.bankList || [];
        this.b2bBanks = res.responseDataB2B?.bankList || [];
        this.updateFilteredBanks();
      },
      error: (err) => {
        console.error('Error fetching bank list:', err);
      }
    });
  }

  // Toggle dropdown visibility and reset bank search
  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
    this.bankSearch = '';
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

  // When a bank is selected from dropdown
  selectBank(bank: any): void {
    this.selectedBank = bank;
    this.showDropdown = false;
  }

  // When bank type changes, reset bank selection and filtered list
  onBankTypeChange(): void {
    this.selectedBank = null;
    this.bankSearch = '';
    this.updateFilteredBanks();
  }

  // Determine if form can be submitted based on validations
  canSubmit(): boolean {
    if (!this.customerName.trim() || !this.customerMobile.trim()) {
      return false;
    }
    if (!this.paymentMethod) {
      return false;
    }
    if (this.paymentMethod === 'internetBanking') {
      if (!this.selectedBankType || !this.selectedBank) {
        return false;
      }
    }
    return true;
  }

  submitForm(){
    this.paymentForm.nativeElement.submit();
  }
}
