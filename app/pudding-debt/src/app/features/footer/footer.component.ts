import { Component } from '@angular/core';
import packageJson from '../../../../package.json';

@Component({
	selector: 'custom-footer',
	templateUrl: 'footer.component.html',
	styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {
	public version: string = packageJson.version;
}
