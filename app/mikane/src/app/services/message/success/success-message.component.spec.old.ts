import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { SuccessMessageComponent } from './success-message.component';

describe('SuccessMessageComponent', () => {
	let component: SuccessMessageComponent;
	let fixture: ComponentFixture<SuccessMessageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [SuccessMessageComponent],
			providers: [{ provide: MAT_SNACK_BAR_DATA, useValue: {} }],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(SuccessMessageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
