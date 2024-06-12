import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { SplitButtonComponent } from 'src/app/features/split-button/split-button.component';
import { AuthService } from 'src/app/services/auth/auth.service';
import { BreakpointService } from 'src/app/services/breakpoint/breakpoint.service';
import { MessageService } from 'src/app/services/message/message.service';
import { User } from 'src/app/services/user/user.service';
import { ApiError } from 'src/app/types/apiError.type';
import { SplitButtonItemComponent } from '../split-button/split-button-item/split-button-item.component';
import { SplitButtonItemDirective } from '../split-button/split-button-item/split-button-item.directive';

@Component({
	selector: 'app-menu',
	templateUrl: './menu.component.html',
	styleUrls: ['./menu.component.scss'],
	standalone: true,
	imports: [CommonModule, MatIconModule, SplitButtonComponent, SplitButtonItemComponent, SplitButtonItemDirective],
})
export class MenuComponent implements OnInit {
	@ViewChild('splitButton') private splitButton: SplitButtonComponent;
	user: User;

	constructor(
		private router: Router,
		private messageService: MessageService,
		private authService: AuthService,
		public breakpointService: BreakpointService
	) {}

	ngOnInit() {
		this.authService.getCurrentUser()?.subscribe({
			next: (user) => {
				this.user = user;
			},
			error: (err: ApiError) => {
				this.messageService.showError('Failed to get user');
				console.error('Something went wrong getting user in header component: ' + err?.error?.message);
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
				console.error('something went wrong while trying to log out', err?.error?.message);
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
