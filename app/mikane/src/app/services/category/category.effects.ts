import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, of } from 'rxjs';
import { MessageService } from '../message/message.service';
import { CategoryActions, CategoryApiActions } from './category.actions';
import { CategoryService } from './category.service';

@Injectable()
export class CategoryEffects {
	loadCategories$ = createEffect(() =>
		this.$actions.pipe(
			ofType(CategoryApiActions.retrieveCategories),
			exhaustMap((action) =>
				this.categoryService.loadCategories(action.eventId).pipe(
					map((categories) => CategoryApiActions.retrieveCategoriesSuccess({ categories })),
					catchError((error) => of(CategoryApiActions.retrieveCategoriesFailure({ error }))),
				),
			),
		),
	);
	createCategory$ = createEffect(() =>
		this.$actions.pipe(
			ofType(CategoryActions.createCategory),
			exhaustMap((action) =>
				this.categoryService.createCategory(action.name, action.eventId, action.weighted, action.icon).pipe(
					map((category) => CategoryApiActions.editCategorySuccess({ category })),
					catchError((error) => of(CategoryApiActions.editCategoryFailure({ error }))),
				),
			),
		),
	);
	deleteCategory$ = createEffect(() =>
		this.$actions.pipe(
			ofType(CategoryActions.deleteCategory),
			exhaustMap((action) =>
				this.categoryService.deleteCategory(action.categoryId).pipe(
					map((success) => CategoryApiActions.deleteCategorySuccess({ success })),
					catchError((error) => of(CategoryApiActions.deleteCategoryFailure({ error }))),
				),
			),
		),
	);
	addUserToCategory$ = createEffect(() =>
		this.$actions.pipe(
			ofType(CategoryActions.addUserToCategory),
			exhaustMap((action) =>
				this.categoryService.addUser(action.categoryId, action.userId, action.weight).pipe(
					map((category) => CategoryApiActions.editCategorySuccess({ category })),
					catchError((error) => of(CategoryApiActions.editCategoryFailure({ error }))),
				),
			),
		),
	);
	removeUserFromCategory$ = createEffect(() =>
		this.$actions.pipe(
			ofType(CategoryActions.removeUserFromCategory),
			exhaustMap((action) =>
				this.categoryService.deleteUser(action.categoryId, action.userId).pipe(
					map((category) => CategoryApiActions.editCategorySuccess({ category })),
					catchError((error) => of(CategoryApiActions.editCategoryFailure({ error }))),
				),
			),
		),
	);
	editUserWeight$ = createEffect(() =>
		this.$actions.pipe(
			ofType(CategoryActions.editUserWeight),
			exhaustMap((action) =>
				this.categoryService.editUser(action.categoryId, action.userId, action.weight).pipe(
					map((category) => CategoryApiActions.editCategorySuccess({ category })),
					catchError((error) => of(CategoryApiActions.editCategoryFailure({ error }))),
				),
			),
		),
	);
	toggleCategoryWeighted$ = createEffect(() =>
		this.$actions.pipe(
			ofType(CategoryActions.toggleCategoryWeighted),
			exhaustMap((action) =>
				this.categoryService.setWeighted(action.categoryId, action.weighted).pipe(
					map((category) => CategoryApiActions.editCategorySuccess({ category })),
					catchError((error) => {
						this.messageService.showError('Failed to toggle weighted status');
						return of(CategoryApiActions.editCategoryFailure({ error }));
					}),
				),
			),
		),
	);

	constructor(
		private $actions: Actions,
		private categoryService: CategoryService,
		private messageService: MessageService,
	) {}
}
