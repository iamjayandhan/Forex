import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment'; // Adjust path if needed

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {

  constructor(private http: HttpClient) { }

  // GET: Buy a stock
  placeBuyOrder(orderPayload: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/portfolio/buy`,orderPayload,{ withCredentials: true})
    .pipe(
      catchError((error) => {
        console.error('Buy order failed', error);
        throw error;
      })
    );
  }

  // GET: Sell a stock
  placeSellOrder(orderPayload: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/portfolio/sell`,orderPayload,{ withCredentials: true})
    .pipe(
      catchError((error) => {
        console.error('Sell order failed', error);
        throw error;
      })
    );
  }

  // GET: Fetch all transactions
  getTransactions(userId : number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/portfolio/transactions/${userId}`,{withCredentials:true})
    .pipe(
      catchError((error) => {
        console.error('Error fetching transactions', error);
        throw error;
      })
    )
  }

  // GET: Fetch paginated transactions
  getTransactionsPaginated(userId: number, page: number, pageSize: number, selectedType:string,startDate?: string,endDate?: string, searchQuery?: string): Observable<any> {

    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', pageSize.toString())
      .set('userId', userId.toString())
      .set('transactionType', selectedType);    

    if(startDate) params = params.set('startDate', startDate);
    if(endDate) params = params.set('endDate', endDate);
    if(searchQuery) params = params.set('searchQuery', searchQuery);
    
    return this.http.get(`${environment.apiUrl}/portfolio/transactions/paginated`, { params, withCredentials: true },
      ).pipe(
      catchError((error) => {
        console.error("Error fetching paginated transactions", error);
        throw error;
      })
    );
  }

  // GET: Fetch all holdings
  getHoldings(userId : number): Observable<any>{
    return this.http.get(`${environment.apiUrl}/portfolio/holdings/${userId}`,{withCredentials:true})
    .pipe(
      catchError((error) => {
        console.error("Error fetching holdings",error);
        throw error;
      })
    )
  }

  // GET: Fetch paginated holdings
  getHoldingsPaginated(userId: number, page: number, pageSize: number,sortBy: string, sortOrder: string): Observable<any> {
    // console.log(`Fetching paginated holdings for userId: ${userId}, page: ${page}, pageSize: ${pageSize}`);
    return this.http.get(`${environment.apiUrl}/portfolio/holdings/paginated?page=${page}&size=${pageSize}&userId=${userId}&sortBy=${sortBy}&sortOrder=${sortOrder}`, {
      withCredentials: true,
    }).pipe(
      catchError((error) => {
        console.error("Error fetching paginated holdings", error);
        throw error;
      })
    );
  }

  // POST: Save wallet transaction
  saveWalletTransaction(transactionPayload: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/portfolio/wallet`, transactionPayload, { withCredentials: true })
      .pipe(
        catchError((error) => {
          console.error('Wallet transaction failed', error);
          throw error;
        })
      );
  }

  // GET: Fetch wallet transactions
  getWalletTransactions(userId: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/portfolio/wallet/${userId}`, { withCredentials: true })
      .pipe(
        catchError((error) => {
          console.error('Error fetching wallet transactions', error);
          throw error;
        })
      );
  }

  getWalletTransactionsPaginated(userId: number, page: number, pageSize: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/portfolio/wallet/paginated?page=${page}&size=${pageSize}&userId=${userId}`, {
      withCredentials: true,
    }).pipe(
      catchError((error) => {
        console.error("Error fetching paginated wallet transactions", error);
        throw error;
      })
    );
  }

}
