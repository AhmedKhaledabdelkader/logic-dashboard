import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeroSlidesFormComponent } from './hero-slides-form.component';

describe('HeroSlidesFormComponent', () => {
  let component: HeroSlidesFormComponent;
  let fixture: ComponentFixture<HeroSlidesFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroSlidesFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeroSlidesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
