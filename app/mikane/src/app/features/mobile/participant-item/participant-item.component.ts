import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CurrencyPipe } from '@angular/common';
import { UserBalance } from 'src/app/services/user/user.service';
import { MatListModule } from '@angular/material/list';

@Component({
	selector: 'participant-item',
	templateUrl: 'participant-item.component.html',
	styleUrls: ['./participant-item.component.scss'],
	standalone: true,
	imports: [MatIconModule, CurrencyPipe, MatListModule],
})
export class ParticipantItemComponent {
	@Input('userBalance') userBalance: UserBalance;
}
