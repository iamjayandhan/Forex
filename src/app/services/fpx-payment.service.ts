import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PendingOrderDto } from '../models/PendingOrderDto';

@Injectable({
  providedIn: 'root'
})
export class FpxPaymentService {
  private baseUrl = 'http://localhost:8080/api/fpx';

  constructor(private http: HttpClient) {}

  //we get data directly!
  getBankList(): Observable<any> {
    return this.http.post(`https://services.gomobi.io/api/fpx`,{ service: 'FULL_LIST'});
  }

  createPendingOrder(order: PendingOrderDto): Observable<any> {
    return this.http.post(`${this.baseUrl}/create`, order);
  }

  //get generated checksum
  encryptPayload(amount: number,sellerOrderNo: string,subMid: string, MID: string, TID: string): Observable<string> {
    const body = {
      amount: amount,
      sellerOrderNo: sellerOrderNo,
      subMid: subMid,
      param1: MID,
      param2: TID
    };

    return this.http.post(`${this.baseUrl}/getCheckSum`, body, { responseType: 'text' });
  }

}
