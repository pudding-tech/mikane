import { MockBuilder, MockRender, MockedComponentFixture } from 'ng-mocks';

import { fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Params } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from 'src/app/services/auth/auth.service';
import { EventService, Payment } from 'src/app/services/event/event.service';
import { LogService } from 'src/app/services/log/log.service';
import { MessageService } from 'src/app/services/message/message.service';
import { User } from 'src/app/services/user/user.service';
import { ApiError } from 'src/app/types/apiError.type';
import { PaymentExpansionPanelItemComponent } from './payment-expansion-panel-item/payment-expansion-panel-item.component';
import { PaymentStructureComponent } from './payment-structure.component';

describe('PaymentStructureComponent', () => {
	beforeEach(() =>
		MockBuilder(PaymentStructureComponent)
			.provide({
				provide: AuthService,
				useValue: {
					getCurrentUser: jasmine.createSpy().and.returnValue(
						of({
							id: '1',
							name: 'test',
							email: '',
						}),
					),
				},
			})
			.provide({
				provide: ActivatedRoute,
				useValue: {
					parent: {
						parent: {
							params: of({ eventId: '1' } as Params),
						},
					},
				} as ActivatedRoute,
			})
			.provide({
				provide: EventService,
				useValue: {
					loadPayments: jasmine.createSpy().and.returnValue(of([])),
				},
			})
			.provide({
				provide: MessageService,
				useValue: {
					showError: jasmine.createSpy(),
				},
			})
			.mock(LogService),
	);

	it('should create', () => {
		const fixture = MockRender(PaymentStructureComponent);
		const component = fixture.point.componentInstance;
		fixture.detectChanges();

		expect(component).toBeTruthy();
	});

	describe('with payments', () => {
		let fixture: MockedComponentFixture<PaymentStructureComponent>;
		let component: PaymentStructureComponent;
		let eventService: EventService;

		beforeEach(fakeAsync(() => {
			fixture = MockRender(PaymentStructureComponent);
			component = fixture.point.componentInstance;
			eventService = fixture.point.injector.get(EventService);
			(eventService.loadPayments as jasmine.Spy).and.returnValue(
				of([
					{
						sender: {
							id: '1',
							name: 'test',
							email: '',
						},
						receiver: {
							id: '2',
							name: 'test2',
							email: '',
						},
						amount: 1,
					},
					{
						sender: {
							id: '1',
							name: 'test',
							email: '',
						},
						receiver: {
							id: '3',
							name: 'test3',
							email: '',
						},
						amount: 2,
					},
					{
						sender: {
							id: '2',
							name: 'test2',
							email: '',
						},
						receiver: {
							id: '1',
							name: 'test',
							email: '',
						},
						amount: 3,
					},
					{
						sender: {
							id: '2',
							name: 'test2',
							email: '',
						},
						receiver: {
							id: '3',
							name: 'test3',
							email: '',
						},
						amount: 4,
					},
					{
						sender: {
							id: '3',
							name: 'test3',
							email: '',
						},
						receiver: {
							id: '2',
							name: 'test2',
							email: '',
						},
						amount: 6,
					},
				] as Payment[]),
			);
			component.ngOnInit();

			tick();
			fixture.detectChanges();
		}));

		it('should load payments', () => {
			expect(eventService.loadPayments).toHaveBeenCalledWith('1');
			expect(component.senders()).toEqual([
				{
					sender: {
						id: '1',
						name: 'test',
						email: '',
					},
					receivers: [
						{
							receiver: {
								id: '2',
								name: 'test2',
								email: '',
							},
							amount: 1,
						},
						{
							receiver: {
								id: '3',
								name: 'test3',
								email: '',
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
					},
					receivers: [
						{
							receiver: {
								id: '1',
								name: 'test',
								email: '',
							},
							amount: 3,
						},
						{
							receiver: {
								id: '3',
								name: 'test3',
								email: '',
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
					},
					receivers: [
						{
							receiver: {
								id: '2',
								name: 'test2',
								email: '',
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
					},
					receivers: [
						{
							receiver: {
								id: '2',
								name: 'test2',
								email: '',
							},
							amount: 1,
						},
						{
							receiver: {
								id: '3',
								name: 'test3',
								email: '',
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
					},
					receivers: [
						{
							receiver: {
								id: '1',
								name: 'test',
								email: '',
							},
							amount: 3,
						},
						{
							receiver: {
								id: '3',
								name: 'test3',
								email: '',
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
					},
					receivers: [
						{
							receiver: {
								id: '2',
								name: 'test2',
								email: '',
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
				openExpand: jasmine.createSpy(),
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
				openExpand: jasmine.createSpy(),
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
		let fixture: MockedComponentFixture<PaymentStructureComponent>;
		let component: PaymentStructureComponent;
		let eventService: EventService;

		beforeEach(fakeAsync(() => {
			fixture = MockRender(PaymentStructureComponent);
			component = fixture.point.componentInstance;
			eventService = fixture.point.injector.get(EventService);
			(eventService.loadPayments as jasmine.Spy).and.returnValue(
				throwError(() => {
					return {
						error: {
							message: 'error',
						},
					} as ApiError;
				}),
			);
			component.ngOnInit();

			tick();
			fixture.detectChanges();
		}));

		it('should not have any payments', () => {
			expect(component.senders()).toEqual([]);
			expect(component.paymentsSelf()).toEqual([]);
			expect(component.paymentsOthers()).toEqual([]);
		});

		it('should show payment error message', () => {
			expect(fixture.point.injector.get(MessageService).showError).toHaveBeenCalledWith('Error loading payments');
		});
	});

	describe('with user errors', () => {
		let fixture: MockedComponentFixture<PaymentStructureComponent>;
		let component: PaymentStructureComponent;
		let authService: AuthService;

		beforeEach(fakeAsync(() => {
			fixture = MockRender(PaymentStructureComponent);
			component = fixture.point.componentInstance;
			authService = fixture.point.injector.get(AuthService);
			(authService.getCurrentUser as jasmine.Spy).and.returnValue(
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

			tick();
			fixture.detectChanges();
		}));

		it('should not have a user', () => {
			expect(component.currentUser).toBe(null);
		});

		it('should show user error message', () => {
			expect(fixture.point.injector.get(MessageService).showError).toHaveBeenCalledWith('Something went wrong');
		});
	});
});
