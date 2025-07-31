import { CommonModule, CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewChild, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { User } from 'src/app/services/user/user.service';

@Component({
	selector: 'app-payment-expansion-panel-item',
	templateUrl: './payment-expansion-panel-item.component.html',
	styleUrls: ['./payment-expansion-panel-item.component.scss'],
	imports: [
		CommonModule,
		MatButtonModule,
		MatIconModule,
		MatExpansionModule,
		MatTableModule,
		MatCardModule,
		MatListModule,
		CurrencyPipe,
		NgOptimizedImage,
	],
})
export class PaymentExpansionPanelItemComponent {
	private router = inject(Router);

	@ViewChild(MatAccordion) accordion!: MatAccordion;
	@Input() payments: {
		sender: User;
		receivers: {
			receiver: User;
			amount: number;
		}[];
	}[];
	@Input() self: boolean;
	@Input() currentUser: User;
	@Output() allPanelsExpanded = new EventEmitter();

	displayedColumns: string[] = ['name', 'amount'];

	openExpand(open: boolean) {
		if (open) {
			this.accordion.openAll();
		} else {
			this.accordion.closeAll();
		}
	}

	panelToggled() {
		if (this.accordion._headers.toArray().every((panel) => panel._isExpanded())) {
			this.allPanelsExpanded.emit(true);
		} else if (!this.accordion._headers.some((panel) => panel._isExpanded())) {
			this.allPanelsExpanded.emit(false);
		}
	}

	gotoUserProfile(user: User) {
		if (!user.guest) {
			this.router.navigate(['u', user.username]);
		}
	}
}
