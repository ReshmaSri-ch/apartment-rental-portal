import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAmenities } from './admin-amenities';

describe('AdminAmenities', () => {
  let component: AdminAmenities;
  let fixture: ComponentFixture<AdminAmenities>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAmenities]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminAmenities);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
