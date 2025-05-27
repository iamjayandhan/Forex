import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Stock {
  id?: number;
  name: string;
  symbol: string;
  imageUrl?: string;
  currentPrice: number;
  sector?: string;
  description?: string;
  ipoQty?: number;
  exchange?: string;
}

@Injectable({
  providedIn: 'root'
})
export class StockService {

  constructor(private http: HttpClient) { }

  // GET: fetch all stocks
  getAllStocks(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/stocks`,{withCredentials:true}).pipe(catchError(this.handleError));
  }

  // GET: get paginated stocks
  // getPaginatedStocks(page: number, size: number, search: string = '') : Observable<any>{
  //   const params: any = { page, size };
  //   if (search.trim() !== '') {
  //     params.search = search;
  //   }
  //   return this.http.get<any>(`${environment.apiUrl}/stocks/paginated`,{ params});
  // }

  // GET: get paginated ordered stocks
  getPaginatedStocks(page: number, size: number, search: string = '',sortBy: string = 'id', sortOrder: string = 'asc') : Observable<any>{
    const params: any = { page, size,sortBy, sortOrder };
    if (search.trim() !== '') {
      params.search = search;
    }
    return this.http.get<any>(`${environment.apiUrl}/stocks/paginated`,{ params});
  }

  // GET: fetch stock by ID
  getStockById(id: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/stocks/${id}`).pipe(catchError(this.handleError));
  }

  // POST: create a new stock
  createStock(stock: Stock): Observable<any> {
    return this.http.post(`${environment.apiUrl}/stocks`, stock).pipe(catchError(this.handleError));
  }

  // PUT: partial update of stock
  updateStock(id: number, stock: Partial<Stock>): Observable<any> {
    return this.http.put(`${environment.apiUrl}/stocks/${id}`, stock).pipe(catchError(this.handleError));
  }

  // DELETE: remove a stock
  deleteStock(id: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/stocks/${id}`).pipe(catchError(this.handleError));
  }

  // Error handling
  private handleError(error: HttpErrorResponse) {
    let errorMsg = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMsg = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMsg = `Server returned code ${error.status}, error message is: ${error.error?.message || error.message}`;
    }
    return throwError(() => new Error(errorMsg));
  }
}
