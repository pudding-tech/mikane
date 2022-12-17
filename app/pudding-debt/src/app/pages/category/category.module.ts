import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatDialogModule } from "@angular/material/dialog";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatTableModule } from "@angular/material/table";
import { SharedModule } from "src/app/shared/shared.module";
import { DeleteCategoryDialogComponent } from "./category-delete-dialog/category-delete-dialog.component";
import { CategoryDialogComponent } from "./category-dialog/category-dialog.component";
import { CategoryEditDialogComponent } from "./category-edit-dialog/category-edit-dialog.component";
import { CategoryRoutingModule } from "./category-routing.module";
import { CategoryComponent } from "./category.component";

@NgModule({
    declarations: [CategoryComponent, CategoryEditDialogComponent, CategoryDialogComponent, DeleteCategoryDialogComponent],
    imports: [CategoryRoutingModule, SharedModule, FormsModule, ReactiveFormsModule, MatCheckboxModule, MatInputModule, MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatTableModule, MatExpansionModule, MatDialogModule]
})
export class CategoryModule {}