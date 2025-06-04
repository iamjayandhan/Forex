import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NseService {

  constructor(private http: HttpClient) { }

  // NSE
  // GET: get market status
  fetchMarketStatus(): Observable<any> {
    return this.http.get(`${environment.nseApiUrl}/getMarketStatus`,{withCredentials: true});
  }

  // GET: get stock info
  fetchEquityDetails(symbol: string): Observable<any>{
    return this.http.get(`${environment.nseApiUrl}/equity-details/${symbol}`,{withCredentials: true});
  }

  // GET: get stock intraday info
  fetchEquityIntradayDetails(symbol: string): Observable<any>{
    return this.http.get(`${environment.nseApiUrl}/equity-details/intraday/${symbol}`,{withCredentials: true});
  }

  // GET: get equity stock info
  fetchEquityChartDetails(symbol: string): Observable<any>{
    return this.http.get(`${environment.nseApiUrl}/getChart/${symbol}`,{withCredentials: true});
  }

  // GET: get equity stock info
  fetchEquityChartWithPODetails(symbol: string): Observable<any>{
    return this.http.get(`${environment.nseApiUrl}/getChartWithPO/${symbol}`,{withCredentials:true});
  }
}
