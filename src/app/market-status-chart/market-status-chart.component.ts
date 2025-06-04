import { Component, OnInit } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexStroke,
  ApexTitleSubtitle,
  ApexGrid,
  ApexYAxis,
  ApexFill
} from 'ng-apexcharts';
import { MarketStateItem } from '../models/MarketStateItem';
import { CommonModule } from '@angular/common';
import { NseService } from '../services/nse.service';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
  grid: ApexGrid;
  yaxis: ApexYAxis;
  fill: ApexFill;
  colors: string[];
};

@Component({
  selector: 'app-market-status-chart',
  templateUrl: './market-status-chart.component.html',
  styleUrls: ['./market-status-chart.component.css'],
  standalone: true,
  imports: [NgApexchartsModule, CommonModule]
})
export class MarketStatusChartComponent implements OnInit {
  public marketCharts: {
    market: string;
    status: string;
    hasData: boolean;
    options: Partial<ChartOptions>;
  }[] = [];

  constructor(private nseService: NseService) {}

  ngOnInit(): void {
    this.fetchMarketStatus();
  }

  fetchMarketStatus() {
    this.nseService.fetchMarketStatus().subscribe((response) => {
      const marketState: MarketStateItem[] = response.marketState;

      this.marketCharts = marketState
        .map((item) => {
          const price = parseFloat(String(item.last ?? '0'));
          const hasValidPrice = !isNaN(price);
          if (!hasValidPrice) return null;

          const isClosed = item.marketStatus?.toLowerCase() === 'close';
          const tradeDate = (item.tradeDate ?? 'N/A').toString();
          const statusColor = isClosed ? '#ff4d4d' : '#28a745';

          const variation = parseFloat(String(item.variation ?? '0'));
          const percentChange = parseFloat(String(item.percentChange ?? '0'));


          const variationText = !isNaN(variation) ? ` | Δ ${variation.toFixed(2)}` : '';
          const percentText = !isNaN(percentChange) ? ` (${percentChange.toFixed(2)}%)` : '';

          return {
            market: item.market,
            status: isClosed ? 'Closed' : 'Open',
            hasData: true,
            options: {
              series: [{ name: 'Last Price', data: [price] }],
              chart: {
                height: 150,
                type: 'bar' as const
              },
              colors: [statusColor],
              title: {
                text: `${item.market} (${isClosed ? 'Closed' : 'Open'})${variationText}${percentText}`,
                align: 'center',
                style: {
                  fontSize: '16px'
                }
              },
              xaxis: {
                categories: [tradeDate],
                labels: {
                  rotate: -45
                }
              },
              yaxis: {
                title: {
                  text: 'Price'
                }
              },
              stroke: {
                curve: 'smooth'
              },
              dataLabels: {
                enabled: true
              },
              grid: {
                row: {
                  colors: ['#f3f3f3', 'transparent'],
                  opacity: 0.5
                }
              },
              fill: {
                type: 'solid'
              }
            } as Partial<ChartOptions> // ✅ Explicitly cast as partial
          };
        })
        .filter((chart): chart is NonNullable<typeof chart> => chart !== null);
    });
  }
}
