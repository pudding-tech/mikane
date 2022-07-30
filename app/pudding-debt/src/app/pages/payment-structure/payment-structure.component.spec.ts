import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentStructureComponent } from './payment-structure.component';

describe('PaymentStructureComponent', () => {
  let component: PaymentStructureComponent;
  let fixture: ComponentFixture<PaymentStructureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaymentStructureComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentStructureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
