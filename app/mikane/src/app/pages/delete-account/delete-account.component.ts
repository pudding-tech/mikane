import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, switchMap, takeUntil } from 'rxjs';
import { MenuComponent } from 'src/app/features/menu/menu.component';
import { AuthService } from 'src/app/services/auth/auth.service';
import { BreakpointService } from 'src/app/services/breakpoint/breakpoint.service';
import { MessageService } from 'src/app/services/message/message.service';
import { User, UserService } from 'src/app/services/user/user.service';
import { ApiError } from 'src/app/types/apiError.type';

@Component({
	templateUrl: './delete-account.component.html',
	styleUrls: ['./delete-account.component.scss'],
	standalone: true,
	imports: [CommonModule, MatCardModule, MenuComponent, MatToolbarModule, MatIconModule, MatButtonModule, RouterModule],
})
export class DeleteAccountComponent implements OnInit, OnDestroy {
	private userService = inject(UserService);
	private route = inject(ActivatedRoute);
	private router = inject(Router);
	private authService = inject(AuthService);
	private messageService = inject(MessageService);
	protected breakpointService = inject(BreakpointService);

	private destroy$ = new Subject<void>();
	protected loading = false;

	protected key: string;

	ngOnInit(): void {
		this.route.data.pipe(takeUntil(this.destroy$)).subscribe(({ key }) => {
			this.key = key;
		});
	}

	deleteAccount(): void {
		this.loading = true;
		this.authService
			.getCurrentUser()
			.pipe(
				switchMap((user: User) => {
					return this.userService.deleteUser(user?.id, this.key);
				}),
				takeUntil(this.destroy$)
			)
			.subscribe({
				next: () => {
					this.loading = false;
					this.messageService.showSuccess('Account deleted successfully!');
					this.authService.clearCurrentUser();
					this.router.navigate(['/login']);
				},
				error: (err: ApiError) => {
					this.loading = false;
					console.error('something went wrong while trying to delete account', err);
					this.messageService.showError('Failed to delete account!');
				},
			});
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}
}
