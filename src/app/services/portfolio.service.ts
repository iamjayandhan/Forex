import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment'; // Adjust path if needed

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {

  constructor(private http: HttpClient) { }

  placeBuyOrder(orderPayload: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/portfolio/buy`,orderPayload,{ withCredentials: true})
    .pipe(
      catchError((error) => {
        console.error('Buy order failed', error);
        throw error;
      })
    );
  }

  getTransactions(userId : number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/portfolio/transactions/${userId}`,{withCredentials:true})
    .pipe(
      catchError((error) => {
        console.error('Error fetching transactions', error);
        throw error;
      })
    )
  }

  getHoldings(userId : number): Observable<any>{
    return this.http.get(`${environment.apiUrl}/portfolio/holdings/${userId}`,{withCredentials:true})
    .pipe(
      catchError((error) => {
        console.error("Error fetching holdings",error);
        throw error;
      })
    )
  }

  getHoldingsPaginated(userId: number, page: number, pageSize: number): Observable<any> {
    console.log(`Fetching paginated holdings for userId: ${userId}, page: ${page}, pageSize: ${pageSize}`);
    return this.http.get(`${environment.apiUrl}/portfolio/holdings/paginated?page=${page}&size=${pageSize}&userId=${userId}`, {
      withCredentials: true,
    }).pipe(
      catchError((error) => {
        console.error("Error fetching paginated holdings", error);
        throw error;
      })
    );
  }

}
