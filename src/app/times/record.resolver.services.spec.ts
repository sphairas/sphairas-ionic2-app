import { TestBed } from '@angular/core/testing';
import { TimeResolverService } from './record.resolver.services';

describe('RecordResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TimeResolverService = TestBed.get(TimeResolverService);
    expect(service).toBeTruthy();
  });
});
