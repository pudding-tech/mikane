import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { User } from 'src/app/services/user/user.service';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NgIf, NgFor, AsyncPipe, CurrencyPipe } from '@angular/common';
import { PaymentItemComponent } from 'src/app/features/mobile/payment-item/payment-item.component';

@Component({
	selector: 'payment-expansion-panel-item',
	templateUrl: './payment-expansion-panel-item.component.html',
	styleUrls: ['./payment-expansion-panel-item.component.scss'],
	standalone: true,
	imports: [
		NgIf,
		MatButtonModule,
		MatIconModule,
		MatExpansionModule,
		NgFor,
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
	@Input('senders') senders: {
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
}
