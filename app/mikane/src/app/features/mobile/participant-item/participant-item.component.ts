import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { User, UserBalance } from 'src/app/services/user/user.service';

@Component({
	selector: 'app-participant-item',
	templateUrl: 'participant-item.component.html',
	styleUrls: ['./participant-item.component.scss'],
	imports: [MatButtonModule, MatIconModule, CurrencyPipe, MatListModule, NgOptimizedImage],
})
export class ParticipantItemComponent {
	userBalance = input.required<UserBalance>();
	eventActive = input.required<boolean>();
	numberOfParticipants = input.required<number>();
	numberOfAdmins = input.required<number>();
	gotoUser = output<{ user: User }>();
	removeUser = output<{ user: User }>();

	gotoUserProfile() {
		this.gotoUser.emit({ user: this.userBalance().user });
	}

	removeUserFromEvent() {
		this.removeUser.emit({ user: this.userBalance().user });
	}
}
