import { Component, OnInit, ViewChild } from '@angular/core';
import {
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexPlotOptions,
  ApexLegend,
  ApexYAxis,
  ApexTooltip,
  ChartComponent,
  ApexTitleSubtitle,
} from 'ng-apexcharts';
import { PortfolioService } from '../services/portfolio.service';
import { UserService } from '../services/user.service';
import { NgApexchartsModule } from 'ng-apexcharts';
import { CommonModule } from '@angular/common';

export type BarChartOptions = {
  chart: ApexChart;
  plotOptions: ApexPlotOptions;
  dataLabels: ApexDataLabels;
  series: { name: string; data: number[] }[];
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  legend: ApexLegend;
  tooltip: ApexTooltip;
  title: ApexTitleSubtitle;
};

interface Holding {
  quantity: number | string;
  avgPrice: number | string;
  stock: {
    currentPrice: number | string;
    name: string;
  };
  investment?: number;
  profit?: number;
  // other fields if needed
}

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.css'],
  standalone: true,
  imports: [NgApexchartsModule, CommonModule],
})
export class BarChartComponent implements OnInit {
  @ViewChild('chart') chart!: ChartComponent;
  public chartOptions?: Partial<BarChartOptions>;
  
  constructor(
    private portfolioService: PortfolioService,
    private userService: UserService
  ) {}

  public hasHoldings: boolean = false;

  ngOnInit(): void {
    this.userService.currentUser$.subscribe(user => {
      if (user) this.loadHoldings(user.userId);
    });
  }

  private formatCurrency(val: number): string {
    return `₹ ${val.toFixed(2)}`;
  }

  loadHoldings(userId: number) {
    this.portfolioService.getHoldings(userId).subscribe(response => {
      const holdings = (response.data as Holding[])
        .map(h => {
          const qty = Number(h.quantity);
          const avg = Number(h.avgPrice);
          const curr = Number(h.stock.currentPrice);
          const investment = qty * avg;
          const profit = qty * (curr - avg);
          return { ...h, investment, profit };
        })
        .sort((a, b) => (b.profit ?? 0) - (a.profit ?? 0))
        .slice(0, 3);

      this.hasHoldings = holdings.length > 0;

      if (!this.hasHoldings) {
        this.chartOptions = undefined;
        return;
      }

      const stockNames = holdings.map(h => h.stock.name);
      const investmentData = holdings.map(h => +(h.investment ?? 0).toFixed(2));
      const profitData = holdings.map(h => +(h.profit ?? 0).toFixed(2));

      this.chartOptions = {
        chart: { type: 'bar', height: 260, width: 600, toolbar: { show: true },stacked:true },
        plotOptions: {
          bar: { horizontal: true, dataLabels: { position: 'top' }, barHeight: '40%' },
        },
        dataLabels: {
          enabled: true,
          formatter: (val: number | string) => {
            if (typeof val === 'number') {
              return this.formatCurrency(val);
            }
            if (typeof val === 'string') {
              // Sometimes Apex may pass string values (rare here)
              const num = Number(val);
              return isNaN(num) ? val : this.formatCurrency(num);
            }
            return '';
          },
          offsetX: -15,
          style: { colors: ['black'], fontWeight: '600', fontSize: '12px' },
        },
        series: [
          { name: 'Invested', data: investmentData },
          { name: 'Profit', data: profitData },
        ],
        xaxis: {
          categories: stockNames,
          title: {
            text: 'Amount (₹)',
            style: { fontWeight: 'bold', fontSize: '14px', color: 'red' },
          },
          labels: {
            formatter: val => {
              const num = Number(val);
              return isNaN(num) ? val.toString() : this.formatCurrency(num);
            },
            style: { fontSize: '12px', colors: '#475569' },
            offsetY: 5,
          },
          axisTicks: { show: true, borderType: 'solid', color: '#cbd5e1', height: 6 },
          axisBorder: { show: true, color: '#cbd5e1' },
        },
        yaxis: {
          labels: { style: { colors: '#334155', fontWeight: '600', fontSize: '13px' }, maxWidth: 120 },
        },
        legend: { position: 'top', horizontalAlign: 'right', labels: { colors: '#334155' } },
        tooltip: {
          y: {
            formatter: (val: number | string | undefined): string => {
              if (typeof val === 'number') {
                return this.formatCurrency(val);
              } else if (typeof val === 'string') {
                return val;
              } else {
                return '';
              }
            }
          },
          
        },
        title: {
          text: 'Top 3 Stocks by Profit',
          style: {
            color: '#1e293b',
            fontSize: '20px',
            fontWeight: '400',
            fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
          },
        },
      };
    });
  }
}
