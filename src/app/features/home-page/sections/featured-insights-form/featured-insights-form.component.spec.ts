import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeaturedInsightsFormComponent } from './featured-insights-form.component';

describe('FeaturedInsightsFormComponent', () => {
  let component: FeaturedInsightsFormComponent;
  let fixture: ComponentFixture<FeaturedInsightsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeaturedInsightsFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeaturedInsightsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
