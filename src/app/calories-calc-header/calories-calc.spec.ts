import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaloriesCalc } from './calories-calc-header';

describe('CaloriesCalc', () => {
  let component: CaloriesCalc;
  let fixture: ComponentFixture<CaloriesCalc>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaloriesCalc],
    }).compileComponents();

    fixture = TestBed.createComponent(CaloriesCalc);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
