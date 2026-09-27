import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell/shell.component';

export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'home-page' },
      {
        path: 'home-page',
        title: 'Home Page | LOGIC Dashboard',
        loadComponent: () => import('./features/home-page/home-page.component').then(m => m.HomePageComponent),
      },
      {
        path: 'insights',
        title: 'Insights | LOGIC Dashboard',
        loadComponent: () => import('./features/insights/insights.component').then(m => m.InsightsComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];