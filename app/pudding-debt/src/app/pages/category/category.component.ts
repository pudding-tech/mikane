import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
	Category,
	CategoryService,
} from 'src/app/services/category/category.service';

@Component({
	selector: 'app-category',
	templateUrl: './category.component.html',
	styleUrls: ['./category.component.scss'],
})
export class CategoryComponent implements OnInit {
    private eventId!: number;

	categories: Category[] = [];

	constructor(private categoryService: CategoryService, private route: ActivatedRoute) {}

	ngOnInit(): void {
        this.route.parent?.params.subscribe(params => {
            console.log('route params', params);
            this.eventId = params['eventId'];
            this.loadCategories();
        });
    }
    
    loadCategories() {
        this.categoryService.loadCategories(this.eventId).subscribe((categories) => {
            this.categories = categories;
        });
    }
}
