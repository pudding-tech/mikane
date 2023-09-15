import { CurrencyPipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { UserBalance } from 'src/app/services/user/user.service';

@Component({
	selector: 'app-participant-item',
	templateUrl: 'participant-item.component.html',
	styleUrls: ['./participant-item.component.scss'],
	standalone: true,
	imports: [MatIconModule, CurrencyPipe, MatListModule],
})
export class ParticipantItemComponent {
	@Input() userBalance: UserBalance;
}
