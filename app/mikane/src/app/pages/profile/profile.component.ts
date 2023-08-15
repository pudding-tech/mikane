import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription, catchError, map, of, switchMap } from 'rxjs';
import { MenuComponent } from 'src/app/features/menu/menu.component';
import { AuthService } from 'src/app/services/auth/auth.service';
import { BreakpointService } from 'src/app/services/breakpoint/breakpoint.service';
import { MessageService } from 'src/app/services/message/message.service';
import { User, UserService } from 'src/app/services/user/user.service';
import { ProgressSpinnerComponent } from 'src/app/shared/progress-spinner/progress-spinner.component';
import { ApiError } from 'src/app/types/apiError.type';

@Component({
	templateUrl: 'profile.component.html',
	styleUrls: ['./profile.component.scss'],
	standalone: true,
	imports: [
		CommonModule,
		MatCardModule,
		ProgressSpinnerComponent,
		MenuComponent,
		MatIconModule,
		RouterLink,
		MatButtonModule,
		MatToolbarModule,
	],
})
export class ProfileComponent implements OnInit, OnDestroy {
	protected loading: boolean = true;
	protected user: User;

	private subscription: Subscription;

	constructor(
		public breakpointService: BreakpointService,
		private authService: AuthService,
		private userService: UserService,
		private messageService: MessageService,
		private route: ActivatedRoute,
		private router: Router
	) {}

	ngOnInit() {
		this.subscription = this.route.paramMap
			.pipe(
				map((params) => {
					console.log(params.keys);
					return params.get('id');
				}),
				switchMap((id) => {
					if (id) {
						return this.userService.loadUserById(id);
					} else {
						// User id not in URL, showing logged in user profile page
						return this.authService.getCurrentUser().pipe(switchMap((user) => this.userService.loadUserById(user.id)));
					}
				}),
				catchError((err: ApiError) => {
					this.messageService.showError('Something went wrong');
					console.error('something went wrong while getting user on profile page', err);
					return of(undefined);
				})
			)
			.subscribe({
				next: (user) => {
					if (user) {
						this.user = user;
						this.loading = false;
					} else {
						this.messageService.showError('User not found');
						console.error('user not found on profile page');
					}
				},
				error: (error: ApiError) => {
					this.messageService.showError('Something went wrong');
					console.error('something went wrong when getting user on profile page', error);
					this.router.navigate(['/events']);
				},
			});
	}

	ngOnDestroy(): void {
		this.subscription.unsubscribe();
	}
}
