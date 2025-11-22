import { registerLocaleData } from '@angular/common';
import no from '@angular/common/locales/no';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Params } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from 'src/app/services/auth/auth.service';
import { EventService, Payment } from 'src/app/services/event/event.service';
import { LogService } from 'src/app/services/log/log.service';
import { MessageService } from 'src/app/services/message/message.service';
import { User } from 'src/app/services/user/user.service';
import { ApiError } from 'src/app/types/apiError.type';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { PaymentExpansionPanelItemComponent } from './payment-expansion-panel-item/payment-expansion-panel-item.component';
import { PaymentStructureComponent } from './payment-structure.component';

describe('PaymentStructureComponent', () => {
	beforeAll(() => {
		registerLocaleData(no);
	});

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [PaymentStructureComponent],
			providers: [
				{
					provide: AuthService,
					useValue: {
						getCurrentUser: vi.fn().mockReturnValue(
							of({
								id: '1',
								name: 'test',
								email: '',
								// avatarURL: 'test',
							} as User),
						),
					},
				},
				{
					provide: ActivatedRoute,
					useValue: {
						parent: {
							parent: {
								params: of({ eventId: '1' } as Params),
							},
						},
					} as ActivatedRoute,
				},
				{
					provide: EventService,
					useValue: {
						loadPayments: vi.fn().mockReturnValue(of([])),
					},
				},
				{
					provide: MessageService,
					useValue: {
						showError: vi.fn(),
					},
				},
				{
					provide: LogService,
					useValue: {
						error: vi.fn(),
					},
				},
				provideZonelessChangeDetection(),
			],
		});
	});

	it('should create', () => {
		const fixture = TestBed.createComponent(PaymentStructureComponent);
		const component = fixture.componentInstance;
		fixture.detectChanges();

		expect(component).toBeTruthy();
	});

	describe('with payments', () => {
		let fixture: ComponentFixture<PaymentStructureComponent>;
		let component: PaymentStructureComponent;
		let eventService: EventService;

		beforeEach(() => {
			fixture = TestBed.createComponent(PaymentStructureComponent);
			component = fixture.componentInstance;
			eventService = TestBed.inject(EventService);

			vi.spyOn(eventService, 'loadPayments').mockReturnValue(
				of([
					{
						sender: {
							id: '1',
							name: 'test',
							email: '',
							avatarURL: 'test',
						},
						receiver: {
							id: '2',
							name: 'test2',
							email: '',
							avatarURL: 'test',
						},
						amount: 1,
					},
					{
						sender: {
							id: '1',
							name: 'test',
							email: '',
							avatarURL: 'test',
						},
						receiver: {
							id: '3',
							name: 'test3',
							email: '',
							avatarURL: 'test',
						},
						amount: 2,
					},
					{
						sender: {
							id: '2',
							name: 'test2',
							email: '',
							avatarURL: 'test',
						},
						receiver: {
							id: '1',
							name: 'test',
							email: '',
							avatarURL: 'test',
						},
						amount: 3,
					},
					{
						sender: {
							id: '2',
							name: 'test2',
							email: '',
							avatarURL: 'test',
						},
						receiver: {
							id: '3',
							name: 'test3',
							email: '',
							avatarURL: 'test',
						},
						amount: 4,
					},
					{
						sender: {
							id: '3',
							name: 'test3',
							email: '',
							avatarURL: 'test',
						},
						receiver: {
							id: '2',
							name: 'test2',
							email: '',
							avatarURL: 'test',
						},
						amount: 6,
					},
				] as Payment[]),
			);

			component.ngOnInit();
			fixture.detectChanges();
		});

		it('should load payments', () => {
			expect(eventService.loadPayments).toHaveBeenCalledWith('1');
			expect(component.senders()).toEqual([
				{
					sender: {
						id: '1',
						name: 'test',
						email: '',
						avatarURL: 'test',
					},
					receivers: [
						{
							receiver: {
								id: '2',
								name: 'test2',
								email: '',
								avatarURL: 'test',
							},
							amount: 1,
						},
						{
							receiver: {
								id: '3',
								name: 'test3',
								email: '',
								avatarURL: 'test',
							},
							amount: 2,
						},
					],
				},
				{
					sender: {
						id: '2',
						name: 'test2',
						email: '',
						avatarURL: 'test',
					},
					receivers: [
						{
							receiver: {
								id: '1',
								name: 'test',
								email: '',
								avatarURL: 'test',
							},
							amount: 3,
						},
						{
							receiver: {
								id: '3',
								name: 'test3',
								email: '',
								avatarURL: 'test',
							},
							amount: 4,
						},
					],
				},
				{
					sender: {
						id: '3',
						name: 'test3',
						email: '',
						avatarURL: 'test',
					},
					receivers: [
						{
							receiver: {
								id: '2',
								name: 'test2',
								email: '',
								avatarURL: 'test',
							},
							amount: 6,
						},
					],
				},
			] as {
				sender: User;
				receivers: {
					receiver: User;
					amount: number;
				}[];
			}[]);
		});

		it('should add payments to paymentsSelf', () => {
			expect(component.paymentsSelf()).toEqual([
				{
					sender: {
						id: '1',
						name: 'test',
						email: '',
						avatarURL: 'test',
					},
					receivers: [
						{
							receiver: {
								id: '2',
								name: 'test2',
								email: '',
								avatarURL: 'test',
							},
							amount: 1,
						},
						{
							receiver: {
								id: '3',
								name: 'test3',
								email: '',
								avatarURL: 'test',
							},
							amount: 2,
						},
					],
				},
				{
					sender: {
						id: '2',
						name: 'test2',
						email: '',
						avatarURL: 'test',
					},
					receivers: [
						{
							receiver: {
								id: '1',
								name: 'test',
								email: '',
								avatarURL: 'test',
							},
							amount: 3,
						},
						{
							receiver: {
								id: '3',
								name: 'test3',
								email: '',
								avatarURL: 'test',
							},
							amount: 4,
						},
					],
				},
			] as {
				sender: User;
				receivers: {
					receiver: User;
					amount: number;
				}[];
			}[]);
		});

		it('should add payments to paymentsOthers', () => {
			expect(component.paymentsOthers()).toEqual([
				{
					sender: {
						id: '3',
						name: 'test3',
						email: '',
						avatarURL: 'test',
					},
					receivers: [
						{
							receiver: {
								id: '2',
								name: 'test2',
								email: '',
								avatarURL: 'test',
							},
							amount: 6,
						},
					],
				},
			] as {
				sender: User;
				receivers: {
					receiver: User;
					amount: number;
				}[];
			}[]);
		});

		it('should toggle expand self payments', () => {
			component.paymentsSelfRef = {
				openExpand: vi.fn(),
			} as unknown as PaymentExpansionPanelItemComponent;
			component.toggleExpand(1);

			expect(component.paymentsSelfRef.openExpand).toHaveBeenCalledWith(false);
			expect(component.allExpandedSelf).toBe(false);
			component.toggleExpand(1);

			expect(component.paymentsSelfRef.openExpand).toHaveBeenCalledWith(true);
			expect(component.allExpandedSelf).toBe(true);
		});

		it('should toggle expand others payments', () => {
			component.paymentsOthersRef = {
				openExpand: vi.fn(),
			} as unknown as PaymentExpansionPanelItemComponent;
			component.toggleExpand(2);

			expect(component.paymentsOthersRef.openExpand).toHaveBeenCalledWith(true);
			expect(component.allExpandedOthers).toBe(true);
			component.toggleExpand(2);

			expect(component.paymentsOthersRef.openExpand).toHaveBeenCalledWith(false);
			expect(component.allExpandedOthers).toBe(false);
		});

		it('should toggle expand all payments', () => {
			component.panelToggled(1, true);

			expect(component.allExpandedSelf).toBe(true);
			component.panelToggled(1, false);

			expect(component.allExpandedSelf).toBe(false);
			component.panelToggled(2, true);

			expect(component.allExpandedOthers).toBe(true);
			component.panelToggled(2, false);

			expect(component.allExpandedOthers).toBe(false);
		});
	});

	describe('with payment errors', () => {
		let fixture: ComponentFixture<PaymentStructureComponent>;
		let component: PaymentStructureComponent;
		let eventService: EventService;

		beforeEach(() => {
			fixture = TestBed.createComponent(PaymentStructureComponent);
			component = fixture.componentInstance;
			eventService = TestBed.inject(EventService);

			vi.spyOn(eventService, 'loadPayments').mockReturnValue(
				throwError(() => {
					return {
						error: {
							message: 'error',
						},
					} as ApiError;
				}),
			);

			component.ngOnInit();
		});

		it('should not have any payments', () => {
			expect(component.senders()).toEqual([]);
			expect(component.paymentsSelf()).toEqual([]);
			expect(component.paymentsOthers()).toEqual([]);
		});

		it('should show payment error message', () => {
			expect(TestBed.inject(MessageService).showError).toHaveBeenCalledWith('Error loading payments');
		});
	});

	describe('with user errors', () => {
		let fixture: ComponentFixture<PaymentStructureComponent>;
		let component: PaymentStructureComponent;
		let authService: AuthService;

		beforeEach(() => {
			fixture = TestBed.createComponent(PaymentStructureComponent);
			component = fixture.componentInstance;
			authService = TestBed.inject(AuthService);

			vi.spyOn(authService, 'getCurrentUser').mockReturnValue(
				throwError(() => {
					return {
						error: {
							message: 'error',
						},
					} as ApiError;
				}),
			);
			component.currentUser = null;
			component.ngOnInit();
		});

		it('should not have a user', () => {
			expect(component.currentUser).toBe(null);
		});

		it('should show user error message', () => {
			expect(TestBed.inject(MessageService).showError).toHaveBeenCalledWith('Something went wrong');
		});
	});
});
