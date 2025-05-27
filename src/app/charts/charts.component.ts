import { Component, Input, OnInit, OnDestroy,ViewChild  } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexTitleSubtitle,
  ApexDataLabels,
  ApexFill,
  ApexMarkers,
  ApexYAxis,
  ApexXAxis,
  ApexTooltip, ChartComponent
} from 'ng-apexcharts';

import { ForexService } from '../services/web-socket-service.service';

@Component({
  selector: 'app-real-time-chart',
  templateUrl: './charts.component.html',
  imports: [ChartComponent],
  standalone: true,
  styleUrls: ['./charts.component.css']
})
export class RealTimeChartComponent implements OnInit, OnDestroy {
  @Input() symbol: string = 'BTC/USD';
  @Input() maxPoints: number = 50;
  @Input() interval: string = '1min';  // forex interval like '1min', not RxJS interval
  @ViewChild('chartRef') chartComponent!: ChartComponent;

  public series: ApexAxisChartSeries = [{ name: this.symbol, data: [] }];
  public chart!: ApexChart;
  public dataLabels!: ApexDataLabels;
  public markers!: ApexMarkers;
  public title!: ApexTitleSubtitle;
  public fill!: ApexFill;
  public yaxis!: ApexYAxis;
  public xaxis!: ApexXAxis;
  public tooltip!: ApexTooltip;

  private priceData: [number, number][] = [];
  private pollingSub!: Subscription;

  constructor(private forexService: ForexService) {}

  ngOnInit(): void {
    this.chart = {
      type: 'area',
      height: 400,
      zoom: {
        enabled: true,
        type: 'x',
        autoScaleYaxis: true
      },
      toolbar: { autoSelected: 'zoom'},
      foreColor: '#ffffff'
    };

    this.dataLabels = { enabled: false };
    this.markers = { size: 0 };
    this.title = { text: `Live Price Chart: ${this.symbol}`, align: 'left' };

    this.fill = {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        inverseColors: false,
        opacityFrom: 0.5,
        opacityTo: 0,
        stops: [0, 90, 100]
      }
    };

    this.yaxis = {
      labels: {
        formatter: (val) => val.toFixed(2)
      },
      title: { text: 'Price (USD)' }
    };

    this.xaxis = { type: 'datetime' };

    this.tooltip = {
      theme: 'dark',
      shared: false,
      x: { format: 'dd MMM yyyy HH:mm:ss' },
      y: {
        formatter: (val) => val.toFixed(2)
      }
    };

    this.loadInitialData();
    this.startPolling();
  }

  ngOnDestroy(): void {
    if (this.pollingSub) {
      this.pollingSub.unsubscribe(); // clean up when component is destroyed
    }
  }

  private loadInitialData() {
    this.forexService.getHistoricalData(this.symbol, this.interval).subscribe({
      next: (response) => {
        const values = response?.values;
        if (values && Array.isArray(values)) {
          const data = values
            .map((entry: any): [number, number] => {
              const timestamp = new Date(entry.datetime).getTime();
              const price = parseFloat(entry.close);
              return [timestamp, price];
            })
            .reverse();

          this.priceData = data.slice(-this.maxPoints);
          this.series = [{ name: this.symbol, data: [...this.priceData] }];
        }
      },
      error: (err) => console.error('Error loading forex data:', err)
    });
  }

  private startPolling() {
    this.pollingSub = interval(10000) // fetch every 10 seconds
      .pipe(
        switchMap(() => this.forexService.getHistoricalData(this.symbol, this.interval))
      )
      .subscribe({
        next: (response) => {
          const latest = response?.values?.[0];
          if (latest) {
            const timestamp = new Date(latest.datetime).getTime();
            const price = parseFloat(latest.close);
            this.addPricePoint(price, timestamp);
          }
        },
        error: (err) => console.error('Polling error:', err)
      });
  }

  private addPricePoint(price: number, timestamp: number) {
    const point: [number, number] = [timestamp, price];
    this.priceData.push(point);
    if (this.priceData.length > this.maxPoints) this.priceData.shift();

    if (this.chartComponent) {
      this.chartComponent.updateSeries([{ name: this.symbol, data: [...this.priceData] }], true);
    }
  }

}
