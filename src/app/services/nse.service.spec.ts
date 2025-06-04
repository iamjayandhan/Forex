import { TestBed } from '@angular/core/testing';

import { NseService } from './nse.service';

describe('NseService', () => {
  let service: NseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
