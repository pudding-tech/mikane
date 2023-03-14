import { Component, ElementRef, ViewChild } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { animate, style, transition, trigger } from '@angular/animations';
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
  animations: [
		trigger('overlayAnimation', [
			transition(':enter', [style({ opacity: 0, transform: 'scaleY(0.8)' }), animate('{{showTransitionParams}}')]),
			transition(':leave', [animate('{{hideTransitionParams}}', style({ opacity: 0 }))])
		])
	],
	host: {
		'(document:click)': 'onOutsideClick($event)'
	},
	imports: [NgIf, MatIconModule, SplitButtonComponent],
})
export class MenuComponent {
	@ViewChild('dropdown') private dropdown: ElementRef;
	@ViewChild('splitButton', { read: ElementRef }) private splitButton: ElementRef;

  toggled = false;
	showTransitionOptions = '.12s cubic-bezier(0, 0, 0.2, 1)';
	hideTransitionOptions = '.1s linear';

  constructor(
    private router: Router,
    private messageService: MessageService,
    private authService: AuthService
  ) {}

  onAccountClick = () => {
		this.router.navigate(['/settings']);
	};

	toggleDropdown = () => {
		this.toggled = !this.toggled;
	};

	onOutsideClick(e: any) {
		if (!this.toggled) {
			return;
		}
		if (this.dropdown && !this.dropdown.nativeElement.contains(e.target) && !this.splitButton.nativeElement.contains(e.target)) {
			this.toggled = !this.toggled;
		}
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
}
