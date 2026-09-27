import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutPageAdminComponent } from './about-page-admin.component';

describe('AboutPageAdminComponent', () => {
  let component: AboutPageAdminComponent;
  let fixture: ComponentFixture<AboutPageAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutPageAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AboutPageAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
