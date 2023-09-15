import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CategoryIcon } from 'src/app/types/enums';
import { Environment } from 'src/environments/environment.interface';
import { ENV } from 'src/environments/environment.provider';
import { Category, CategoryService } from './category.service';

describe('CategoryService', () => {
	let service: CategoryService;
	let httpTestingController: HttpTestingController;
	let mockCategory: Category;

	beforeEach(() => {
		const env = { apiUrl: 'http://localhost:3002/api/' } as Environment;
		mockCategory = {
			id: 'id',
			name: 'name',
			icon: CategoryIcon.CAR,
			created: new Date(),
			weighted: false,
			users: [],
		} as Category;

		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule],
			providers: [CategoryService, { provide: ENV, useValue: env }],
		});

		service = TestBed.inject(CategoryService);
		httpTestingController = TestBed.inject(HttpTestingController);
	});

	afterEach(() => {
		httpTestingController.verify();
	});

	describe('#loadCategories', () => {
		it('should get categories', () => {
			service.loadCategories('eventId').subscribe({
				next: (result) => {
					expect(result).withContext('should return result').toEqual([mockCategory]);
				},
				error: fail,
			});

			const req = httpTestingController.expectOne('http://localhost:3002/api/categories?eventId=eventId');

			expect(req.request.method).toEqual('GET');

			req.flush([mockCategory]);
		});
	});

	describe('#createCategory', () => {
		it('should create category', () => {
			service.createCategory('name', 'eventId', false, CategoryIcon.CAR).subscribe({
				next: (result) => {
					expect(result).withContext('should return result').toEqual(mockCategory);
				},
				error: fail,
			});

			const req = httpTestingController.expectOne('http://localhost:3002/api/categories');

			expect(req.request.method).toEqual('POST');
			expect(req.request.body).toEqual({
				name: 'name',
				eventId: 'eventId',
				weighted: false,
				icon: CategoryIcon.CAR,
			});

			req.flush(mockCategory);
		});
	});

	describe('#editCategory', () => {
		it('should edit category', () => {
			service.editCategory('categoryId', 'name', CategoryIcon.CAR).subscribe({
				next: (result) => {
					expect(result).withContext('should return result').toEqual(mockCategory);
				},
				error: fail,
			});

			const req = httpTestingController.expectOne('http://localhost:3002/api/categories/categoryId');

			expect(req.request.method).toEqual('PUT');
			expect(req.request.body).toEqual({
				name: 'name',
				icon: CategoryIcon.CAR,
			});

			req.flush(mockCategory);
		});
	});

	describe('#deleteCategory', () => {
		it('should delete category', () => {
			service.deleteCategory('categoryId').subscribe({ error: fail });

			const req = httpTestingController.expectOne('http://localhost:3002/api/categories/categoryId');

			expect(req.request.method).toEqual('DELETE');

			req.flush({});
		});
	});

	describe('#addUser', () => {
		it('should add user', () => {
			service.addUser('categoryId', 'userId', 0).subscribe({ error: fail });

			const req = httpTestingController.expectOne('http://localhost:3002/api/categories/categoryId/user/userId');

			expect(req.request.method).toEqual('POST');
			expect(req.request.body).toEqual({ weight: 0 });

			req.flush({});
		});
	});

	describe('#deleteUser', () => {
		it('should delete user', () => {
			service.deleteUser('categoryId', 'userId').subscribe({ error: fail });

			const req = httpTestingController.expectOne('http://localhost:3002/api/categories/categoryId/user/userId');

			expect(req.request.method).toEqual('DELETE');

			req.flush({});
		});
	});

	describe('#editUser', () => {
		it('should edit user', () => {
			service.editUser('categoryId', 'userId', 0).subscribe({ error: fail });

			const req = httpTestingController.expectOne('http://localhost:3002/api/categories/categoryId/user/userId');

			expect(req.request.method).toEqual('PUT');
			expect(req.request.body).toEqual({ weight: 0 });

			req.flush({});
		});
	});

	describe('#setWeighted', () => {
		it('should set weighted', () => {
			service.setWeighted('categoryId', true).subscribe({ error: fail });

			const req = httpTestingController.expectOne('http://localhost:3002/api/categories/categoryId/weighted');

			expect(req.request.method).toEqual('PUT');
			expect(req.request.body).toEqual({ weighted: true });

			req.flush({});
		});
	});

	describe('#findOrCreate', () => {
		it('should not create category if it exists', () => {
			service.findOrCreate('eventId', 'name').subscribe({
				next: (result) => {
					expect(result).withContext('should return result').toEqual(mockCategory);
				},
				error: fail,
			});

			const req = httpTestingController.expectOne('http://localhost:3002/api/categories?eventId=eventId');

			expect(req.request.method).toEqual('GET');

			httpTestingController.expectNone('http://localhost:3002/api/categories');

			req.flush([mockCategory]);
		});

		it('should create category if it does not exist', () => {
			service.findOrCreate('eventId', 'name').subscribe({
				next: (result) => {
					expect(result).withContext('should return result').toEqual(mockCategory);
				},
				error: fail,
			});

			const req = httpTestingController.expectOne('http://localhost:3002/api/categories?eventId=eventId');

			expect(req.request.method).toEqual('GET');
			req.flush([]);

			const req2 = httpTestingController.expectOne('http://localhost:3002/api/categories');

			expect(req2.request.method).toEqual('POST');
			expect(req2.request.body).toEqual({
				name: 'name',
				eventId: 'eventId',
				weighted: false,
				icon: CategoryIcon.SHOPPING,
			});

			req2.flush(mockCategory);
		});
	});
});
