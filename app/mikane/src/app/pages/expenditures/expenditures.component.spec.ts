import { MockBuilder, MockRender, MockedComponentFixture } from 'ng-mocks';

import { ActivatedRoute } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from 'src/app/services/auth/auth.service';
import { BreakpointService } from 'src/app/services/breakpoint/breakpoint.service';
import { PuddingEvent } from 'src/app/services/event/event.service';
import { User } from 'src/app/services/user/user.service';
import { ExpendituresComponent } from './expenditures.component';

fdescribe('ExpendituresComponent', () => {
	let component: ExpendituresComponent;
	let fixture: MockedComponentFixture<ExpendituresComponent, { $event: Observable<PuddingEvent> }>;
	let activatedRouteMock: jasmine.SpyObj<ActivatedRoute>;

	beforeEach(async () => {
		activatedRouteMock = jasmine.createSpyObj('ActivatedRoute', ['']);

		return MockBuilder(ExpendituresComponent)
			.provide({ provide: ActivatedRoute, useValue: activatedRouteMock })
			.provide({
				provide: BreakpointService,
				useValue: {
					isMobile: jasmine.createSpy('isMobile').and.returnValue(of(false)) as () => Observable<boolean>,
				} as BreakpointService,
			})
			.provide({
				provide: AuthService,
				useValue: {
					getCurrentUser: jasmine.createSpy('getCurrentUser').and.returnValue(
						of({
							id: '1',
							name: 'test',
							email: '',
						}),
					) as () => Observable<User>,
				} as AuthService,
			});
	});

	function createComponent() {
		fixture = MockRender(ExpendituresComponent, {
			$event: of({
				id: '1',
				active: true,
			} as PuddingEvent),
		});
		component = fixture.point.componentInstance;
		fixture.detectChanges();
	}

	it('should create', () => {
		createComponent();

		expect(component).toBeTruthy();
	});
});
