import { createFeatureSelector } from '@ngrx/store';
import { Category } from './category.model';

export const selectCategories = createFeatureSelector<ReadonlyArray<Category>>('categories');
