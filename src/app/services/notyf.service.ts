import { Injectable } from '@angular/core';
import { Notyf } from 'notyf'; // Import Notyf
import 'notyf/notyf.min.css'; // Import Notyf CSS

@Injectable({
  providedIn: 'root'
})
export class NotyfService {
  private notyf: Notyf;

  constructor() {
    // Initialize Notyf instance
    this.notyf = new Notyf({
      duration: 4000, // Notification duration
      ripple: true,   // Enable ripple effect
      position: {
        x: 'right',   // Position on the right
        y: 'top'      // Position on the top
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
