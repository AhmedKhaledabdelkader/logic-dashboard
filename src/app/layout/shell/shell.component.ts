import { Component, inject, signal } from '@angular/core';
import {
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-shell',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent {
  private readonly authService = inject(AuthService);

  open = signal(false);

  readonly user = this.authService.getUser();

  readonly nav = [
    {
      label: 'Home Page',
      path: '/home-page',
      icon: 'bi-house-door',
    },
    {
      label: 'About Us Page',
      path: '/about-page',
      icon: 'bi-info-circle',
    },
    {
      label: 'Insights',
      path: '/insights',
      icon: 'bi-lightbulb',
    },
  ];

  logout(): void {
    this.authService.logout().subscribe({
      error: () => {
        // Even if the API request fails,
        // remove the local authentication data.
        this.authService.forceLogout();
      },
    });
  }
}