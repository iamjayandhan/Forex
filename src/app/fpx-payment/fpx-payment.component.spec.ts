import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FpxPaymentComponent } from './fpx-payment.component';

describe('FpxPaymentComponent', () => {
  let component: FpxPaymentComponent;
  let fixture: ComponentFixture<FpxPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FpxPaymentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FpxPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
