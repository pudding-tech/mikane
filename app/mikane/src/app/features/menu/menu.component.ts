import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { SplitButtonComponent } from 'src/app/features/split-button/split-button.component';
import { AuthService } from 'src/app/services/auth/auth.service';
import { BreakpointService } from 'src/app/services/breakpoint/breakpoint.service';
import { MessageService } from 'src/app/services/message/message.service';
import { ApiError } from 'src/app/types/apiError.type';
import { SplitButtonItemComponent } from '../split-button/split-button-item/split-button-item.component';
import { SplitButtonItemDirective } from '../split-button/split-button-item/split-button-item.directive';

@Component({
	selector: 'menu',
	templateUrl: './menu.component.html',
	styleUrls: ['./menu.component.scss'],
	standalone: true,
	imports: [CommonModule, MatIconModule, SplitButtonComponent, SplitButtonItemComponent, SplitButtonItemDirective],
})
export class MenuComponent {
	@ViewChild('splitButton') private splitButton: SplitButtonComponent;
	username: string;
	avatarURL: string;

	constructor(
		private router: Router,
		private messageService: MessageService,
		private authService: AuthService,
		public breakpointService: BreakpointService
	) {}

	ngOnInit() {
		this.authService.getCurrentUser().subscribe({
			next: (user) => {
				this.username = user.username;
				this.avatarURL = user.avatarURL;
			},
			error: (err: ApiError) => {
				this.messageService.showError('Failed to get user');
				console.error('Something went wrong getting user in header component: ' + err?.error?.message);
			},
		});
	}

	onAccountClick = () => {
		if (this.router.url === '/account') {
			this.splitButton.toggled = false;
			return;
		}
		this.router.navigate(['/account']);
	};

	logout = () => {
		this.authService.logout().subscribe({
			next: () => {
				this.router.navigate(['/login']);
			},
			error: (err: ApiError) => {
				this.messageService.showError('Failed to log out');
				console.error('something went wrong while trying to log out', err?.error?.message);
			},
		});
	};
}
