import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink } from '@angular/router';
import { BehaviorSubject, Subscription, switchMap } from 'rxjs';
import { MenuComponent } from '../../features/menu/menu.component';
import { AuthService } from '../../services/auth/auth.service';
import { BreakpointService } from '../../services/breakpoint/breakpoint.service';
import { LogService } from '../../services/log/log.service';
import { MessageService } from '../../services/message/message.service';
import { User, UserService } from '../../services/user/user.service';
import { ProgressSpinnerComponent } from '../../shared/progress-spinner/progress-spinner.component';
import { ApiError } from '../../types/apiError.type';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { DangerZoneComponent } from './danger-zone/danger-zone.component';
import { PreferencesComponent } from './preferences/preferences.component';
import { UserSettingsComponent } from './user/user-settings.component';

@Component({
	templateUrl: './account.component.html',
	styleUrls: ['./account.component.scss'],
	changeDetection: ChangeDetectionStrategy.Eager,
	imports: [
		MatToolbarModule,
		MatButtonModule,
		MatDialogModule,
		RouterLink,
		MatIconModule,
		UserSettingsComponent,
		PreferencesComponent,
		ChangePasswordComponent,
		DangerZoneComponent,
		MenuComponent,
		ProgressSpinnerComponent,
		MatCardModule,
		AsyncPipe,
	],
})
export class AccountComponent implements OnInit, OnDestroy {
	private authService = inject(AuthService);
	private userService = inject(UserService);
	breakpointService = inject(BreakpointService);
	private messageService = inject(MessageService);
	private logService = inject(LogService);

	protected loading = new BehaviorSubject<boolean>(true);
	protected user = signal<User>(null);

	private subscription: Subscription;

	ngOnInit(): void {
		this.subscription = this.authService
			.getCurrentUser()
			.pipe(
				switchMap((user) => {
					return this.userService.loadUserById(user?.id);
				}),
			)
			.subscribe({
				next: (user) => {
					this.user.set(user);
					this.loading.next(false);
				},
				error: (error: ApiError) => {
					this.messageService.showError('Something went wrong');
					this.logService.error('something went wrong when getting current user on account page: ' + error);
					this.loading.next(false);
				},
			});
	}

	ngOnDestroy(): void {
		this.subscription?.unsubscribe();
	}
}
