import { createReducer, on } from '@ngrx/store';
import { CategoryActions, CategoryApiActions } from './category.actions';
import { Category } from './category.model';

export const initialState: ReadonlyArray<Category> = [];

export const categoriesReducer = createReducer(
	initialState,
	on(CategoryApiActions.retrieveCategories, (state) => ({ ...state })),
	on(CategoryActions.createCategory, (state, Category) => ({ ...state, categories: [...state, Category] })),
	on(CategoryActions.deleteCategory, (state, { categoryId }) => ({
		...state,
		categories: state.filter((c) => c.id !== categoryId),
	})),
	on(CategoryActions.addUserToCategory, (state, { categoryId, userId, weight }) => ({
		...state,
		categories: state.map((c) => (c.id === categoryId ? { ...c, users: [...c.users, { id: userId, weight }] } : c)),
	})),
	on(CategoryActions.removeUserFromCategory, (state, { categoryId, userId }) => ({
		...state,
		categories: state.map((c) => (c.id === categoryId ? { ...c, users: c.users.filter((u) => u.id !== userId) } : c)),
	})),
	on(CategoryActions.editUserWeight, (state, { categoryId, userId, weight }) => ({
		...state,
		categories: state.map((c) =>
			c.id === categoryId ? { ...c, users: c.users.map((u) => (u.id === userId ? { ...u, weight } : u)) } : c,
		),
	})),
	on(CategoryActions.toggleCategoryWeighted, (state, { categoryId, weighted }) => ({
		...state,
		categories: state.map((c) => (c.id === categoryId ? { ...c, weighted } : c)),
	})),
);
