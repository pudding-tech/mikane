import { registerLocaleData } from '@angular/common';
import no from '@angular/common/locales/no';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Params } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { AuthService } from 'src/app/services/auth/auth.service';
import { BreakpointService } from 'src/app/services/breakpoint/breakpoint.service';
import { EventService, Payment } from 'src/app/services/event/event.service';
import { LogService } from 'src/app/services/log/log.service';
import { MessageService } from 'src/app/services/message/message.service';
import { User } from 'src/app/services/user/user.service';
import { ApiError } from 'src/app/types/apiError.type';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
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
						getEvent: vi.fn().mockReturnValue(of({ currency: 'NOK' })),
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
			component.currentUser.set(undefined);
			component.ngOnInit();
		});

		it('should not have a user', () => {
			expect(component.currentUser()).toBeUndefined();
		});

		it('should show user error message', () => {
			expect(TestBed.inject(MessageService).showError).toHaveBeenCalledWith('Something went wrong');
		});
	});

	describe('viewport-flip sync', () => {
		// These tests verify the cheap patch for the dual-state desync between the
		// desktop (ViewChild MatAccordion) and mobile (signal-driven) branches: after
		// the viewport flips, the just-mounted branch should be re-synced from the
		// `allExpanded*` booleans, which both paths keep up to date.

		let fixture: ComponentFixture<PaymentStructureComponent>;
		let component: PaymentStructureComponent;
		let isMobile$: BehaviorSubject<boolean>;
		const payments: Payment[] = [
			// "Self" payment: current user is the sender
			{
				sender: { id: '1', name: 'me', email: '', avatarURL: 'a' },
				receiver: { id: '2', name: 'them', email: '', avatarURL: 'a' },
				amount: 1,
			} as Payment,
			// "Others" payment: current user not involved
			{
				sender: { id: '3', name: 'a', email: '', avatarURL: 'a' },
				receiver: { id: '2', name: 'them', email: '', avatarURL: 'a' },
				amount: 2,
			} as Payment,
		];

		beforeEach(() => {
			TestBed.resetTestingModule();
			isMobile$ = new BehaviorSubject<boolean>(false);

			TestBed.configureTestingModule({
				imports: [PaymentStructureComponent],
				providers: [
					{
						provide: AuthService,
						useValue: {
							getCurrentUser: vi.fn().mockReturnValue(of({ id: '1', name: 'me', email: '' } as User)),
						},
					},
					{
						provide: ActivatedRoute,
						useValue: {
							parent: { parent: { params: of({ eventId: '1' } as Params) } },
						} as ActivatedRoute,
					},
					{
						provide: EventService,
						useValue: { loadPayments: vi.fn().mockReturnValue(of(payments)), getEvent: vi.fn().mockReturnValue(of({ currency: 'NOK' })) },
					},
					{ provide: MessageService, useValue: { showError: vi.fn() } },
					{ provide: LogService, useValue: { error: vi.fn() } },
					{
						provide: BreakpointService,
						useValue: { isMobile: () => isMobile$.asObservable() },
					},
				],
			});

			fixture = TestBed.createComponent(PaymentStructureComponent);
			component = fixture.componentInstance;
			// We intentionally don't initialize the component in beforeEach. Orchestration
			// tests need to install spies BEFORE the isMobile subscription closure is
			// created (in ngOnInit), so each test calls `initComponent()` itself.
		});

		// Drives the component to its post-load steady state. We rely on
		// fixture.detectChanges() to run ngOnInit exactly once — calling ngOnInit
		// manually AND then detectChanges would cause a double-init that registers
		// the isMobile subscription twice and breaks the orchestration spies.
		const initComponent = () => fixture.detectChanges();

		afterEach(() => {
			isMobile$.complete();
		});

		// setTimeout(0) inside syncDesktopFromBooleans is fired by the real event loop,
		// not by vitest's fake timers (NgZone interaction is finicky). Flushing a
		// macrotask here is reliable for the desktop-flip tests.
		const flushMacrotask = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

		it('ignores the initial isMobile emission (no spurious sync on mount)', async () => {
			initComponent();
			// Set state that would be wiped if sync ran on the initial emission.
			component.allExpandedSelf = false;
			component.expandedSelf.set(new Set(['1']));

			// No further emission — only the initial BehaviorSubject value.
			await flushMacrotask();

			expect(component.expandedSelf().has('1')).toBe(true);
		});

		// --- Orchestration: which sync method gets called on each flip direction? ---
		// (We spy on the private methods rather than asserting through ViewChild,
		// because Angular re-runs its @ViewChild queries during the async wait —
		// which would clobber any manually-assigned mock ref before setTimeout fires.)

		it('on flip to mobile: invokes syncMobileFromBooleans synchronously', () => {
			const mobileSpy = vi.spyOn(
				component as unknown as { syncMobileFromBooleans: () => void },
				'syncMobileFromBooleans',
			);
			const desktopSpy = vi.spyOn(
				component as unknown as { syncDesktopFromBooleans: () => void },
				'syncDesktopFromBooleans',
			);
			initComponent();

			isMobile$.next(true);

			expect(mobileSpy).toHaveBeenCalledTimes(1);
			expect(desktopSpy).not.toHaveBeenCalled();
		});

		it('on flip to desktop: defers syncDesktopFromBooleans via a macrotask', async () => {
			const desktopSpy = vi.spyOn(
				component as unknown as { syncDesktopFromBooleans: () => void },
				'syncDesktopFromBooleans',
			);
			initComponent();

			// Initial subject value is `false` (desktop); to simulate a real flip we
			// first go mobile, then back to desktop.
			isMobile$.next(true);
			isMobile$.next(false);
			// Not yet — the desktop sync is deferred.
			expect(desktopSpy).not.toHaveBeenCalled();

			await flushMacrotask();
			expect(desktopSpy).toHaveBeenCalledTimes(1);
		});

		it('stops orchestrating syncs after ngOnDestroy', async () => {
			const mobileSpy = vi.spyOn(
				component as unknown as { syncMobileFromBooleans: () => void },
				'syncMobileFromBooleans',
			);
			const desktopSpy = vi.spyOn(
				component as unknown as { syncDesktopFromBooleans: () => void },
				'syncDesktopFromBooleans',
			);
			initComponent();

			component.ngOnDestroy();

			isMobile$.next(true);
			isMobile$.next(false);
			await flushMacrotask();

			expect(mobileSpy).not.toHaveBeenCalled();
			expect(desktopSpy).not.toHaveBeenCalled();
		});

		// --- Sync method behavior, called directly with mock refs ---

		it('syncMobileFromBooleans: fills expandedSelf with all self sender ids when allExpandedSelf is true', () => {
			initComponent();
			component.allExpandedSelf = true;
			component.expandedSelf.set(new Set());

			(component as unknown as { syncMobileFromBooleans: () => void }).syncMobileFromBooleans();

			expect(component.expandedSelf().has('1')).toBe(true);
			expect(component.expandedSelf().size).toBe(component.paymentsSelf().length);
		});

		it('syncMobileFromBooleans: clears expandedSelf when allExpandedSelf is false (even if stale state lingers)', () => {
			initComponent();
			component.allExpandedSelf = false;
			component.expandedSelf.set(new Set(['1', '99']));

			(component as unknown as { syncMobileFromBooleans: () => void }).syncMobileFromBooleans();

			expect(component.expandedSelf().size).toBe(0);
		});

		it('syncMobileFromBooleans: mirrors allExpandedOthers into expandedOthers', () => {
			initComponent();
			component.allExpandedOthers = true;
			component.expandedOthers.set(new Set());

			(component as unknown as { syncMobileFromBooleans: () => void }).syncMobileFromBooleans();

			expect(component.expandedOthers().has('3')).toBe(true);
			expect(component.expandedOthers().size).toBe(component.paymentsOthers().length);
		});

		it('syncDesktopFromBooleans: forces the accordion open state to match the booleans', () => {
			initComponent();
			const selfRef = { openExpand: vi.fn() } as unknown as PaymentExpansionPanelItemComponent;
			const othersRef = { openExpand: vi.fn() } as unknown as PaymentExpansionPanelItemComponent;
			component.paymentsSelfRef = selfRef;
			component.paymentsOthersRef = othersRef;
			component.allExpandedSelf = false;
			component.allExpandedOthers = true;

			(component as unknown as { syncDesktopFromBooleans: () => void }).syncDesktopFromBooleans();

			expect(selfRef.openExpand).toHaveBeenCalledWith(false);
			expect(othersRef.openExpand).toHaveBeenCalledWith(true);
		});

		it('syncDesktopFromBooleans: skips the call for any section that has no payments', () => {
			initComponent();
			const selfRef = { openExpand: vi.fn() } as unknown as PaymentExpansionPanelItemComponent;
			const othersRef = { openExpand: vi.fn() } as unknown as PaymentExpansionPanelItemComponent;
			component.paymentsSelfRef = selfRef;
			component.paymentsOthersRef = othersRef;
			// Wipe paymentsOthers via senders so paymentsOthers() is empty.
			component.senders.set(component.senders().filter((s) => s.sender.id === '1'));

			(component as unknown as { syncDesktopFromBooleans: () => void }).syncDesktopFromBooleans();

			expect(selfRef.openExpand).toHaveBeenCalled();
			expect(othersRef.openExpand).not.toHaveBeenCalled();
		});

		it('syncDesktopFromBooleans: is a no-op when ViewChild refs are not yet resolved', () => {
			initComponent();
			component.paymentsSelfRef = undefined as unknown as PaymentExpansionPanelItemComponent;
			component.paymentsOthersRef = undefined as unknown as PaymentExpansionPanelItemComponent;

			// Would throw on `.openExpand` if the guard were missing.
			expect(() =>
				(component as unknown as { syncDesktopFromBooleans: () => void }).syncDesktopFromBooleans(),
			).not.toThrow();
		});
	});
});
