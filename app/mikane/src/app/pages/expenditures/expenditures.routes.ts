import { Route } from '@angular/router';
import { ExpendituresComponent } from './expenditures.component';
import { ExpenseComponent } from './expense/expense.component';

export default [
  { path: '', component: ExpendituresComponent },
  { path: ':id', component: ExpenseComponent},
] as Route[];
