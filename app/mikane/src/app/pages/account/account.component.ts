import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink } from '@angular/router';
import { BehaviorSubject, Subscription, switchMap } from 'rxjs';
import { MenuComponent } from 'src/app/features/menu/menu.component';
import { AuthService } from 'src/app/services/auth/auth.service';
import { BreakpointService } from 'src/app/services/breakpoint/breakpoint.service';
import { MessageService } from 'src/app/services/message/message.service';
import { User, UserService } from 'src/app/services/user/user.service';
import { ProgressSpinnerComponent } from 'src/app/shared/progress-spinner/progress-spinner.component';
import { ApiError } from 'src/app/types/apiError.type';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { DangerZoneComponent } from './danger-zone/danger-zone.component';
import { UserSettingsComponent } from './user/user-settings.component';
import { PreferencesComponent } from './preferences/preferences.component';

@Component({
	templateUrl: './account.component.html',
	styleUrls: ['./account.component.scss'],
	standalone: true,
	imports: [
		CommonModule,
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
	],
})
export class AccountComponent implements OnInit, OnDestroy {
	private authService = inject(AuthService);
	private userService = inject(UserService);
	breakpointService = inject(BreakpointService);
	private messageService = inject(MessageService);

	protected loading = new BehaviorSubject<boolean>(true);
	protected user: User;

	private subscription: Subscription;

	ngOnInit(): void {
		this.subscription = this.authService
			.getCurrentUser()
			.pipe(
				switchMap((user) => {
					return this.userService.loadUserById(user?.id);
				})
			)
			.subscribe({
				next: (user) => {
					this.user = user;
					this.loading.next(false);
				},
				error: (error: ApiError) => {
					this.messageService.showError('Something went wrong');
					console.error('something went wrong when getting current user on account page', error);
					this.loading.next(false);
				},
			});
	}

	ngOnDestroy(): void {
		this.subscription?.unsubscribe();
	}
}
