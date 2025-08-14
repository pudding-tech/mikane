import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { BehaviorSubject, Subscription, combineLatest, filter, switchMap } from 'rxjs';
import { AuthService } from 'src/app/services/auth/auth.service';
import { BreakpointService } from 'src/app/services/breakpoint/breakpoint.service';
import { EventStatusType, PuddingEvent } from 'src/app/services/event/event.service';
import { MessageService } from 'src/app/services/message/message.service';
import { User, UserService } from 'src/app/services/user/user.service';
import { ApiError } from 'src/app/types/apiError.type';
import { ProgressSpinnerComponent } from '../../shared/progress-spinner/progress-spinner.component';

@Component({
	templateUrl: 'event-info.component.html',
	styleUrls: ['./event-info.component.scss'],
	imports: [
		CommonModule,
		MatButtonModule,
		MatCardModule,
		MatIconModule,
		MatListModule,
		MatInputModule,
		MatSelectModule,
		MatFormFieldModule,
		FormsModule,
		ReactiveFormsModule,
		ProgressSpinnerComponent,
		NgOptimizedImage,
	],
})
export class EventInfoComponent implements OnInit, OnDestroy {
	private router = inject(Router);
	private userService = inject(UserService);
	private authService = inject(AuthService);
	breakpointService = inject(BreakpointService);
	private messageService = inject(MessageService);

	@Input() $event: BehaviorSubject<PuddingEvent>;
	event: PuddingEvent;
	loading = new BehaviorSubject<boolean>(false);
	adminsInEvent: User[];
	currentUser: User;

	private eventSubscription: Subscription;
	readonly EventStatusType = EventStatusType;

	ngOnInit(): void {
		this.loading.next(true);
		this.eventSubscription = this.$event
			?.pipe(
				filter((event) => event?.id !== undefined),
				switchMap((event) => {
					this.event = event;
					return combineLatest([this.userService.loadUsersByEvent(event.id, true), this.authService.getCurrentUser()]);
				}),
			)
			.subscribe({
				next: ([users, currentUser]) => {
					this.adminsInEvent = users.filter((user) => user.eventInfo?.isAdmin);
					this.currentUser = currentUser;
					this.loading.next(false);
				},
				error: (err: ApiError) => {
					this.loading.next(false);
					this.messageService.showError('Error loading event settings');
					console.error('Something went wrong while loading event settings data', err?.error?.message);
				},
			});
	}

	gotoUserProfile(user: User) {
		if (!user.guest) {
			this.router.navigate(['u', user.username]);
		}
	}

	ngOnDestroy(): void {
		this.eventSubscription?.unsubscribe();
	}
}
