import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatsFormComponent } from './stats-form.component';

describe('StatsFormComponent', () => {
  let component: StatsFormComponent;
  let fixture: ComponentFixture<StatsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatsFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
