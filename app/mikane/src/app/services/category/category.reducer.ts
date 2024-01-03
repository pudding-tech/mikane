import { createReducer, on } from '@ngrx/store';
import { CategoryApiActions } from './category.actions';
import { Category } from './category.model';

export const initialState: ReadonlyArray<Category> = [];

export const categoriesReducer = createReducer(
	initialState,
	on(CategoryApiActions.retrieveCategories, (_state, { categories }) => categories)
	/* on(CategoryActions.deleteCategory, (state, { categoryId }) => state.filter((id) => id !== categoryId)),
	on(CategoryActions.createCategory, (state, { categoryId }) => {
		if (state.indexOf(categoryId) > -1) return state;

		return [...state, categoryId];
	}) */
);
