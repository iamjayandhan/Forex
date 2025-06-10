import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  private baseUrl = 'http://localhost:8080/api/export';

  constructor(private http: HttpClient) { }

  downloadTransactionsCSV(userId: number) {
    const url = `${this.baseUrl}/transactions/${userId}`;
    return this.http.get(url, {
      responseType: 'blob',
      headers: new HttpHeaders({ 'Accept': 'text/csv' })
    });
  }

  downloadWalletTransactionsCSV(userId: number) {
    const url = `${this.baseUrl}/wallet-transactions/${userId}`;
    return this.http.get(url, {
      responseType: 'blob',
      headers: new HttpHeaders({ 'Accept': 'text/csv' })
    });
  }
}
