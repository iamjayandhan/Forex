import { TestBed } from '@angular/core/testing';

import { FpxPaymentService } from './fpx-payment.service';

describe('FpxPaymentService', () => {
  let service: FpxPaymentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FpxPaymentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
