// src/app/services/forex.service.ts

import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ForexService {
  private baseUrl = 'http://localhost:8080/api/forex';

  constructor(private http: HttpClient) {}

  getHistoricalData(symbol: string, interval: string = '1min'): Observable<any> {
    const params = new HttpParams()
      .set('symbol', symbol)
      .set('interval', interval);

    return this.http.get(`${this.baseUrl}/history`, { params });
  }
}
