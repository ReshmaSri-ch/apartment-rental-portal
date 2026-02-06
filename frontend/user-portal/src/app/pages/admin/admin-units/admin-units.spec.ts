import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminUnits } from './admin-units';

describe('AdminUnits', () => {
  let component: AdminUnits;
  let fixture: ComponentFixture<AdminUnits>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminUnits]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminUnits);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
