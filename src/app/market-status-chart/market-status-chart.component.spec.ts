import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketStatusChartComponent } from './market-status-chart.component';

describe('MarketStatusChartComponent', () => {
  let component: MarketStatusChartComponent;
  let fixture: ComponentFixture<MarketStatusChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarketStatusChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarketStatusChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
