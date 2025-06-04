import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PortfolioService } from '../services/portfolio.service';
import { NotyfService } from '../services/notyf.service';

@Component({
  selector: 'app-payment-status',
  templateUrl: './payment-status.component.html',
  styleUrls: ['./payment-status.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class PaymentStatusComponent {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private portfolioService: PortfolioService,
    private notyf: NotyfService
  ) {}

  paymentStatus: string = '';
  orderNo: string = '';
  transactionId: string = '';
  countdown: number = 3; 

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.paymentStatus = params['status'];
      this.orderNo =  params['orderNo'];
      this.transactionId = params['transactionId'];

      if (this.paymentStatus === 'success') {
        const orderPayloadString = localStorage.getItem('orderPayload');
        const txnPayloadString = localStorage.getItem('transactionPayload');

        if (orderPayloadString && txnPayloadString) {
          const orderPayload = JSON.parse(orderPayloadString);
          const transactionPayload = JSON.parse(txnPayloadString);

          //add that fpx transaction id to payloads
          orderPayload.transactionId = this.transactionId;
          transactionPayload.transactionId = this.transactionId;

          this.portfolioService.placeBuyOrder(orderPayload).subscribe({
            next: (response) => {
              // this.isPlacingOrder = false;
              // this.closeConfirmModal();
              this.notyf.success(response.message);
            },
            error: (error) => {
              // this.isPlacingOrder = false;
              this.notyf.error('Failed to place order. Please try again.');
              console.error(error);
            }
          });
          this.portfolioService.saveWalletTransaction(transactionPayload).subscribe({
            next : (response)=>{
              console.log(response);
            },
            error : (err)=>{
              console.log(err);
            }
          })
        }
        //cleanup
        localStorage.removeItem('orderPayload');
        localStorage.removeItem('transactionPayload');
      }
    });
  }

  navigateToPortfolio(){
    this.router.navigate(['/portfolio']);
  }
}
