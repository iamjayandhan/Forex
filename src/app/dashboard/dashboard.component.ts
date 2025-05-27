import { Component,OnInit,OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';  // Import AuthService
import { UserService } from '../services/user.service';
import { UserProfile } from '../models/user-profile.model';
import { CommonModule } from '@angular/common';

import { takeUntil, tap, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';

//for live stock price updates
import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';
import { RealTimeChartComponent } from '../charts/charts.component';
// import { ChartsComponent } from '../charts/charts.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports:[CommonModule,RealTimeChartComponent]
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  user: UserProfile | null = null;

  private stompClient!: Client;
  // liveUpdates: { name: string, symbol: string, price: number }[] = [];
  liveUpdates: {
    name: string;
    symbol: string;
    price: number;
    prevPrice: number;
    changePercent: number;
    isUp: boolean;
  }[] = [];


  constructor(private authService: AuthService, private router: Router,private userService:UserService) {}

  ngOnInit(): void {
    this.userService.getUserProfile().pipe(
      //Used tap() to update the BehaviorSubject only after receiving the user data.
      tap(response => this.userService.setUser(response.data)),
      //Chained with switchMap() to subscribe to currentUser$ only after the update.
      switchMap(() => this.userService.currentUser$),
      //Included takeUntil() for memory safety when the component is destroyed.
      takeUntil(this.destroy$)
    ).subscribe(user => {
      this.user = user;
    });

    this.initializeWebSocketConnection();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if(this.stompClient){
      this.stompClient.deactivate(); // clean disconnect
    }
  }

  initializeWebSocketConnection() {
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws-stock-prices'),

      onConnect: (frame) => {
        console.log('Connected: ', frame);

        this.stompClient.subscribe(
          '/topic/price-updates',
          (message: IMessage) => {
            if (message.body) {
              const data = JSON.parse(message.body);

              // Ensure required fields exist
              if (data.currency_base && data.symbol && typeof data.price === 'number') {
                const existingIndex = this.liveUpdates.findIndex(
                  (u) => u.symbol === data.symbol
                );

                if (existingIndex > -1) {
                  const oldEntry = this.liveUpdates[existingIndex];
                  const oldPrice = oldEntry.price;
                  const newPrice = data.price;
                  const change = newPrice - oldPrice;
                  const changePercent = (change / oldPrice) * 100;

                  this.liveUpdates[existingIndex] = {
                    ...oldEntry,
                    prevPrice: oldPrice,
                    price: newPrice,
                    changePercent: +changePercent.toFixed(2),
                    isUp: change >= 0
                  };
                } else {
                  // Initial entry (no previous price)
                  this.liveUpdates.push({
                    name: data.currency_base,
                    symbol: data.symbol,
                    price: data.price,
                    prevPrice: data.price,
                    changePercent: 0,
                    isUp: true
                  });
                }
              }
            }
          }
        );
      },

      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      }
    });

    this.stompClient.activate();
  }

}
