import { Component, ElementRef, ViewChild } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { SplitButtonComponent } from 'src/app/features/split-button/split-button.component';
import { ApiError } from 'src/app/types/apiError.type';
import { MessageService } from 'src/app/services/message/message.service';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
	selector: 'menu',
	templateUrl: './menu.component.html',
	styleUrls: ['./menu.component.scss'],
	standalone: true,
	imports: [NgIf, MatIconModule, SplitButtonComponent],
})
export class MenuComponent {
	@ViewChild('splitButton') private splitButton: SplitButtonComponent;

	constructor(
		private router: Router,
		private messageService: MessageService,
		private authService: AuthService
	) {}

	onDropdownClick = (index: number) => {
		if (index === 1) {
			this.onAccountClick();
		}
		else if (index === 2) {
			this.logout();
		}
	}

	onAccountClick = () => {
		if (this.router.url === '/settings') {
			this.splitButton.toggled = false;
			return;
		}
		this.router.navigate(['/settings']);
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
	}
}