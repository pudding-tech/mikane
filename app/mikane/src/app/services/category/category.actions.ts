import { createActionGroup, props } from '@ngrx/store';
import { Category } from './category.model';

export const CategoryActions = createActionGroup({
	source: 'Categories',
	events: {
		'Create category': props<{ categoryId: number }>(),
		'Delete category': props<{ categoryId: number }>(),
	},
});

export const CategoryApiActions = createActionGroup({
	source: 'Category API',
	events: {
		'Retrieve Categories': props<{ categories: ReadonlyArray<Category> }>(),
	},
});
