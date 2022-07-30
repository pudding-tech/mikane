import { TestBed } from '@angular/core/testing';

import { EventUserService } from './event-user.service';

describe('EventUserService', () => {
  let service: EventUserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventUserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
