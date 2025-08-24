import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { SuccessMessageComponent } from './success-message.component';

describe('SuccessMessageComponent', () => {
	let component: SuccessMessageComponent;
	let fixture: ComponentFixture<SuccessMessageComponent>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [SuccessMessageComponent],
			providers: [
				{
					provide: MAT_SNACK_BAR_DATA,
					useValue: '',
				},
			],
		});

		fixture = TestBed.createComponent(SuccessMessageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component.data).toEqual('');
	});
});
