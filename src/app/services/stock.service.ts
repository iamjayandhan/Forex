import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/ApiResponse.model';

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

  constructor(private http: HttpClient) {}

  // GET: fetch all stocks
  getAllStocks(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/stocks`, { withCredentials: true });
  }

  // GET: fetch all sectors
  getAllSectors(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/stocks/sectors`, { withCredentials: true });
  }

  // GET: get paginated ordered stocks
  getPaginatedStocks(
    page: number,
    size: number,
    search: string = '',
    sortBy: string = 'id',
    sortOrder: string = 'asc',
    sector?: string,
    exchange?: string
  ): Observable<any> {
    const params: any = { page, size, sortBy, sortOrder };

    if (search.trim() !== '') {
      params.search = search;
    }
    if (sector?.trim()) {
      params.sector = sector;
    }
    if (exchange?.trim()) {
      params.exchange = exchange;
    }

    return this.http.get<any>(`${environment.apiUrl}/stocks/paginated`, { withCredentials: true, params });
  }

  // GET: fetch stock by ID
  getStockById(id: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/stocks/${id}`, { withCredentials: true });
  }

  // POST: create new stock
  createStock(stock: Stock): Observable<any> {
    return this.http.post(`${environment.apiUrl}/stocks`, stock, { withCredentials: true });
  }

  // PUT: partial update of stock
  updateStock(id: number, stock: Partial<Stock>): Observable<any> {
    return this.http.put(`${environment.apiUrl}/stocks/${id}`, stock, { withCredentials: true });
  }

  // DELETE: remove a stock
  deleteStock(id: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/stocks/${id}`, { withCredentials: true });
  }

  //watch list methods
  getUserWatchlist(userId : number){
    return this.http.get<ApiResponse<Stock[]>>(`${environment.apiUrl}/watchlist/${userId}`,{withCredentials: true});
  }

  addStocksToWatchlist(watchlistItems: { userId: number, stockId: number }[]) {
    return this.http.post(`${environment.apiUrl}/watchlist`, watchlistItems, { withCredentials: true });
  }

  deleteStockFromWatchlist(userId: number, stockId: number){
    const payload = {userId, stockId};
    return this.http.delete(`${environment.apiUrl}/watchlist`,{ body:payload, withCredentials:true});
  }
}
