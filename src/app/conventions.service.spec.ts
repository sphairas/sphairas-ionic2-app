import { TestBed } from '@angular/core/testing';

import { ConventionsService } from './conventions.service';

describe('ConventionsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ConventionsService = TestBed.get(ConventionsService);
    expect(service).toBeTruthy();
  });
});
