import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import {FormulaireComponent} from './formulaire/formulaire.component';

export const routes: Routes = [
  { path: '', component: FormulaireComponent },  // Route par défaut
  { path: 'dashboard', component: UserDashboardComponent }
];
