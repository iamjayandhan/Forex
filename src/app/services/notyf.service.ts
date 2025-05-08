import { Injectable } from '@angular/core';
import { Notyf } from 'notyf'; 
import 'notyf/notyf.min.css'; 

@Injectable({
  providedIn: 'root'
})
export class NotyfService {
  private notyf: Notyf;

  constructor() {
    // Initialize Notyf instance
    this.notyf = new Notyf({
      duration: 4000, 
      ripple: true,   
      position: {
        x: 'right',   
        y: 'top'
      }
    });
  }

  success(message: string): void {
    this.notyf.success(message);
  }

  error(message: string): void {
    this.notyf.error(message);
  }
}
