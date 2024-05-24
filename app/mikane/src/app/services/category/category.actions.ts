import { createActionGroup, props } from '@ngrx/store';
import { CategoryIcon } from 'src/app/types/enums';
import { Category } from './category.model';

export const CategoryActions = createActionGroup({
	source: 'Categories',
	events: {
		'Create category': props<{ name: string; icon: CategoryIcon; weighted: boolean; eventId: string }>(),
		'Delete category': props<{ categoryId: string }>(),
		'Add user to category': props<{ categoryId: string; userId: string; weight: number }>(),
		'Remove user from category': props<{ categoryId: string; userId: string }>(),
		'Edit user weight': props<{ categoryId: string; userId: string; weight: number }>(),
		'Toggle category weighted': props<{ categoryId: string; weighted: boolean }>(),
	},
});

export const CategoryApiActions = createActionGroup({
	source: 'Category API',
	events: {
		'Retrieve Categories': props<{ eventId: string }>(),
		'Retrieve Categories Success': props<{ categories: Category[] }>(),
		'Retrieve Categories Failure': props<{ error: string }>(),
		'Edit Category Success': props<{ category: Category }>(),
		'Edit Category Failure': props<{ error: string }>(),
		'Delete Category Success': props<{ success: { success: boolean } }>(),
		'Delete Category Failure': props<{ error: string }>(),
	},
});
