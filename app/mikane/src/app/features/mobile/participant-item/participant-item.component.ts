import { CurrencyPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { UserBalance } from 'src/app/services/user/user.service';

@Component({
	selector: 'app-participant-item',
	templateUrl: 'participant-item.component.html',
	styleUrls: ['./participant-item.component.scss'],
	standalone: true,
	imports: [MatButtonModule, MatIconModule, CurrencyPipe, MatListModule],
})
export class ParticipantItemComponent {
	@Input() userBalance: UserBalance;
	@Input() eventActive: boolean;
	@Output() removeUser = new EventEmitter<{ userId: string }>();

	removeUserFromEvent() {
		this.removeUser.emit({ userId: this.userBalance.user.id });
	}
}
