import { Component, ViewChild, OnInit } from '@angular/core';
import {
  ApexNonAxisChartSeries,
  ApexChart,
  ApexResponsive,
  ApexLegend,
  ChartComponent,
  ApexTitleSubtitle,
  ApexPlotOptions 
} from 'ng-apexcharts';
import { PortfolioService } from '../services/portfolio.service';
import { UserService } from '../services/user.service';
import { UserProfile } from '../models/user-profile.model'; // adjust path as needed
import { NgApexchartsModule } from 'ng-apexcharts';
import { CommonModule } from '@angular/common';

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  responsive: ApexResponsive[];
  legend: ApexLegend;
  title: ApexTitleSubtitle;
  plotOptions: ApexPlotOptions ;
};

@Component({
  selector: 'app-donut-chart',
  templateUrl: './donut-chart.component.html',
  styleUrls: ['./donut-chart.component.css'],
  standalone: true,
  imports: [ChartComponent,NgApexchartsModule,CommonModule]
})
export class DonutChartComponent implements OnInit {
  @ViewChild('chart') chart!: ChartComponent;
  public chartOptions?: Partial<ChartOptions> = {};
  user: UserProfile | null = null;

  constructor(
    private portfolioService: PortfolioService,
    private userService: UserService
  ) {}

  public hasHoldings: boolean = false;

  ngOnInit(): void {
    this.userService.currentUser$.subscribe((userData) => {
      this.user = userData;

      if (this.user) {
        this.loadHoldings(this.user.userId);
      }
    });

    if (!this.userService.getUser()) {
      this.userService.getUserProfile().subscribe((data) => {
        this.userService.setUser(data);
      });
    }
  }

  loadHoldings(userId: number): void {
    this.portfolioService.getHoldings(userId).subscribe((response) => {
      const data = response.data;
      // console.log('Holdings data:', data);

      const sectorMap = new Map<string, number>();

      for (const holding of data) {
        const sector = holding.stock.sector;
        const investment = holding.quantity * holding.avgPrice;

        sectorMap.set(sector, (sectorMap.get(sector) || 0) + investment);
      }

      const labels = Array.from(sectorMap.keys());
      const series = Array.from(sectorMap.values());

      this.hasHoldings = data.length > 0;

      if (!this.hasHoldings) {
        this.chartOptions = undefined;
        return;
      }

      this.chartOptions = {
        series: series,
        chart: {
          type: 'donut',
          width: 350,
          height: 350  
        },
         title: {
          text: 'Investment by Sector',
          align: 'center',
          margin: 10,
          offsetY: 10,
          style: {
            fontSize: '18px',
            color: 'black',
            fontWeight: 'bold'
          }
        },
        labels: labels,
         plotOptions: {
          pie: {
            donut: {
              size: '85%'  // Increase this for a thicker ring (default is ~65%)
            }
          }
        },
        responsive: [
          {
            breakpoint: 480,
            options: {
              chart: {
                width: 150
              },
              legend: {
                position: 'bottom'
              }
            }
          }
        ],
        legend: {
          position: 'right',
        }
      };
    });
  }
}
