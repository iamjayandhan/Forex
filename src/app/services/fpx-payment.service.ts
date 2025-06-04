import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

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
}
