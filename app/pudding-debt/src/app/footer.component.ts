import { Component } from '@angular/core';
import { VERSION } from "../constants";

@Component({
	selector: 'custom-footer',
	templateUrl: 'footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  VERSION = VERSION;
}