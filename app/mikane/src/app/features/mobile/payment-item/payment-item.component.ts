import { NgOptimizedImage } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	computed,
	effect,
	ElementRef,
	inject,
	input,
	OnDestroy,
	output,
	signal,
	ViewChild,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { Router } from '@angular/router';
import { User } from '../../../services/user/user.service';
import { AppCurrencyPipe } from '../../../shared/currency/app-currency.pipe';

@Component({
	selector: 'app-payment-item',
	templateUrl: 'payment-item.component.html',
	styleUrls: ['./payment-item.component.scss'],
	changeDetection: ChangeDetectionStrategy.Eager,
	imports: [
		MatIconModule,
		AppCurrencyPipe,
		MatListModule,
		MatButtonModule,
		MatFormFieldModule,
		MatInputModule,
		FormsModule,
		ReactiveFormsModule,
		NgOptimizedImage,
	],
})
export class PaymentItemComponent implements OnDestroy {
	private router = inject(Router);

	@ViewChild('lower') lower: ElementRef;
	payment = input.required<{
		sender: User;
		receivers: {
			receiver: User;
			amount: number;
		}[];
	}>();
	self = input.required<boolean>();
	currentUser = input.required<User>();
	expanded = input<boolean>(false);
	dropdownToggled = output<{ senderId: string; expanded: boolean; self: boolean }>();

	dropdownOpen = computed(() => this.expanded());
	lowerHeight = signal<number>(0);
	disableTransition = signal<boolean>(false);
	private initialized = false;
	private expandTimeout: ReturnType<typeof setTimeout> | null = null;
	private transitionResetFrame: number | null = null;

	constructor() {
		effect(() => {
			const suppressAnimation = !this.initialized && this.expanded();
			this.setOpenState(this.expanded(), suppressAnimation);
			this.initialized = true;
		});
	}

	private setOpenState = (expanded: boolean, suppressAnimation = false) => {
		if (!expanded) {
			this.clearPendingTimeout();
			this.clearPendingAnimationFrame();
			this.disableTransition.set(false);
			this.lowerHeight.set(0);
			return;
		}

		this.clearPendingTimeout();
		this.clearPendingAnimationFrame();
		this.disableTransition.set(suppressAnimation);

		this.expandTimeout = setTimeout(() => {
			const el = this.lower?.nativeElement;
			if (el) {
				this.lowerHeight.set(el.scrollHeight);
			}

			if (suppressAnimation) {
				this.transitionResetFrame = requestAnimationFrame(() => {
					this.disableTransition.set(false);
					this.transitionResetFrame = null;
				});
			}

			this.expandTimeout = null;
		});
	};

	private clearPendingTimeout = () => {
		if (this.expandTimeout !== null) {
			clearTimeout(this.expandTimeout);
			this.expandTimeout = null;
			this.disableTransition.set(false);
		}
	};

	private clearPendingAnimationFrame = () => {
		if (this.transitionResetFrame !== null) {
			cancelAnimationFrame(this.transitionResetFrame);
			this.transitionResetFrame = null;
		}
	};

	ngOnDestroy() {
		this.clearPendingTimeout();
		this.clearPendingAnimationFrame();
	}

	toggleDropdown = () => {
		const nextExpanded = !this.expanded();
		this.dropdownToggled.emit({ senderId: this.payment().sender.id, expanded: nextExpanded, self: this.self() });
	};

	gotoUserProfile(user: User) {
		if (!user.guest) {
			this.router.navigate(['u', user.username]);
		}
	}
}
