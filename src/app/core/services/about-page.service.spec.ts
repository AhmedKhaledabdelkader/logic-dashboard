import { TestBed } from '@angular/core/testing';
import { AboutPageService } from './about-page.service';




describe('AboutPageServiceService', () => {
  let service: AboutPageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AboutPageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
