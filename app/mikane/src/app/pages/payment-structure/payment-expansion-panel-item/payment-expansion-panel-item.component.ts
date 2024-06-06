import { AsyncPipe, CommonModule, CurrencyPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { PaymentItemComponent } from 'src/app/features/mobile/payment-item/payment-item.component';
import { User } from 'src/app/services/user/user.service';

@Component({
	selector: 'app-payment-expansion-panel-item',
	templateUrl: './payment-expansion-panel-item.component.html',
	styleUrls: ['./payment-expansion-panel-item.component.scss'],
	standalone: true,
	imports: [
		CommonModule,
		MatButtonModule,
		MatIconModule,
		MatExpansionModule,
		MatTableModule,
		MatCardModule,
		MatListModule,
		AsyncPipe,
		CurrencyPipe,
		PaymentItemComponent,
	],
})
export class PaymentExpansionPanelItemComponent {
	@ViewChild(MatAccordion) accordion!: MatAccordion;
	@Input() payments: Array<{
		sender: User;
		receivers: Array<{
			receiver: User;
			amount: number;
		}>;
	}>;
	@Input() self: boolean;
	@Input() currentUser: User;
	@Output() allPanelsExpanded = new EventEmitter();

	displayedColumns: string[] = ['name', 'amount'];

	constructor(
		private router: Router,
	) {}

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
			this.router.navigate(['u', user.id]);
		}
	}
}
