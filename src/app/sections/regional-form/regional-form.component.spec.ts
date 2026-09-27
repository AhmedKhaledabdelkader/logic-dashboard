import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegionalFormComponent } from './regional-form.component';

describe('RegionalFormComponent', () => {
  let component: RegionalFormComponent;
  let fixture: ComponentFixture<RegionalFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegionalFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegionalFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
