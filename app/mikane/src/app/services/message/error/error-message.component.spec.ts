import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { ErrorMessageComponent } from './error-message.component';

describe('ErrorMessageComponent', () => {
	let component: ErrorMessageComponent;
	let fixture: ComponentFixture<ErrorMessageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [ErrorMessageComponent],
			providers: [{ provide: MAT_SNACK_BAR_DATA, useValue: {} }],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ErrorMessageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
