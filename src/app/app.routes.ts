import { Routes } from '@angular/router';

import { ShellComponent } from './layout/shell/shell.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [

  // ==============================
  // Authentication
  // ==============================
  {
    path: 'login',
    title: 'Login | LOGIC Dashboard',
    loadComponent: () =>
      import('./features/auth/login/login.component')
        .then(m => m.LoginComponent),
  },

  // ==============================
  // Protected Dashboard
  // ==============================
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],

    children: [

      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'home-page',
      },

      {
        path: 'home-page',
        title: 'Home Page | LOGIC Dashboard',
        loadComponent: () =>
          import('./features/home-page/home-page.component')
            .then(m => m.HomePageComponent),
      },

      {
        path: 'about-page',
        title: 'About Us Page | LOGIC Dashboard',
        loadComponent: () =>
          import('./features/about-page-admin/about-page-admin.component')
            .then(m => m.AboutPageAdminComponent),
      },

      {
        path: 'insights',
        title: 'Insights | LOGIC Dashboard',
        loadComponent: () =>
          import('./features/insights/insights.component')
            .then(m => m.InsightsComponent),
      },

      {
        path: 'services',
        title: 'Services | LOGIC Dashboard',
        loadComponent: () =>
          import('./features/services/services.component')
            .then(m => m.ServicesComponent),
      },

      {
        path: 'how-we-work',
        title: 'How We Work | LOGIC Dashboard',
        loadComponent: () =>
          import('./features/how-we-work/how-we-work.component')
            .then(m => m.HowWeWorkComponent),
      },

      // Add future dashboard pages here

    ],
  },

  // ==============================
  // Unknown routes
  // ==============================
  {
    path: '**',
    redirectTo: '',
  },
];