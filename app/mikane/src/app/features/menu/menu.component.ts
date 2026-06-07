import { AsyncPipe, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, ViewChild, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { BreakpointService } from '../../services/breakpoint/breakpoint.service';
import { LogService } from '../../services/log/log.service';
import { MessageService } from '../../services/message/message.service';
import { User } from '../../services/user/user.service';
import { ApiError } from '../../types/apiError.type';
import { SplitButtonItemComponent } from '../split-button/split-button-item/split-button-item.component';
import { SplitButtonItemDirective } from '../split-button/split-button-item/split-button-item.directive';
import { SplitButtonComponent } from '../split-button/split-button.component';

@Component({
	selector: 'app-menu',
	templateUrl: './menu.component.html',
	styleUrls: ['./menu.component.scss'],
	changeDetection: ChangeDetectionStrategy.Eager,
	imports: [MatIconModule, SplitButtonComponent, SplitButtonItemComponent, SplitButtonItemDirective, NgOptimizedImage, AsyncPipe],
})
export class MenuComponent implements OnInit {
	private router = inject(Router);
	private messageService = inject(MessageService);
	private authService = inject(AuthService);
	private logService = inject(LogService);
	breakpointService = inject(BreakpointService);

	@ViewChild('splitButton') private splitButton: SplitButtonComponent;
	user: User;

	ngOnInit() {
		this.authService.getCurrentUser()?.subscribe({
			next: (user) => {
				this.user = user;
			},
			error: (err: ApiError) => {
				this.messageService.showError('Failed to get user');
				this.logService.error('Something went wrong getting user in header component: ' + err?.error?.message);
			},
		});
	}

	onAccountClick() {
		if (this.router.url === '/account') {
			this.splitButton.toggled = false;
			return;
		}
		this.router.navigate(['/account']);
	}

	onProfileClick() {
		if (this.router.url === '/u/' + this.user.username) {
			this.splitButton.toggled = false;
			return;
		}
		this.router.navigate(['/u', this.user.username]);
	}

	logout() {
		this.authService.logout().subscribe({
			next: () => {
				this.router.navigate(['/login']);
			},
			error: (err: ApiError) => {
				this.messageService.showError('Failed to log out');
				this.logService.error('something went wrong while trying to log out: ' + err?.error?.message);
			},
		});
	}

	onGuestsClick() {
		if (this.router.url === '/guests') {
			this.splitButton.toggled = false;
			return;
		}
		this.router.navigate(['/guests']);
	}

	inviteUser() {
		if (this.router.url === '/invite') {
			this.splitButton.toggled = false;
			return;
		}
		this.router.navigate(['/invite']);
	}
}
