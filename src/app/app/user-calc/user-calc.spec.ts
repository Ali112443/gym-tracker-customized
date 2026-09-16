import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserCalc } from './user-calc';

describe('UserCalc', () => {
  let component: UserCalc;
  let fixture: ComponentFixture<UserCalc>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserCalc],
    }).compileComponents();

    fixture = TestBed.createComponent(UserCalc);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
