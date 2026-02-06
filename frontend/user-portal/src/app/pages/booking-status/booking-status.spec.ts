import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingStatus } from './booking-status';

describe('BookingStatus', () => {
  let component: BookingStatus;
  let fixture: ComponentFixture<BookingStatus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingStatus]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingStatus);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
