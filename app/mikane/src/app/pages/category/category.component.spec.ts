import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { MockModule } from 'ng-mocks';
import { MessageService } from 'src/app/services/message/message.service';

import { Environment } from 'src/environments/environment.interface';
import { ENV } from 'src/environments/environment.provider';
import { CategoryComponent } from './category.component';

describe('CategoryComponent', () => {
	let component: CategoryComponent;
	let fixture: ComponentFixture<CategoryComponent>;
	let activatedRouteStub: ActivatedRoute;
	let messageServiceStub: MessageService;

	beforeEach(async () => {
		activatedRouteStub = {} as ActivatedRoute;
		messageServiceStub = {} as MessageService;

		await TestBed.configureTestingModule({
			imports: [
				HttpClientTestingModule,
				MockModule(MatDialogModule),
				MockModule(MatIconModule),
				MockModule(MatCardModule),
				CategoryComponent,
			],
			providers: [
				{ provide: ActivatedRoute, useValue: activatedRouteStub },
				{ provide: MessageService, useValue: messageServiceStub },
				{ provide: ENV, useValue: {} as Environment },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(CategoryComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
