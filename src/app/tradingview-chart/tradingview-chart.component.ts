declare var TradingView: any;

import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-tradingview-chart',
  templateUrl: './tradingview-chart.component.html',
  standalone: true,
  styleUrls: [],
  imports: []
})
export class TradingviewChartComponent implements OnInit {
  ngOnInit(): void {
    new TradingView.widget({
      container_id: "tradingview_widget",
      width: "100%",
      height: 500,
      symbol: "NASDAQ:AAPL",
      interval: "D",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      toolbar_bg: "#f1f3f6",
      enable_publishing: false,
      allow_symbol_change: true,
      hide_top_toolbar: false,
      withdateranges: true,
      studies: [],
      details: true
    });
  }
}
