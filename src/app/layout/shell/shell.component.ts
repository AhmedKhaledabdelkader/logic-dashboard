import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent {
  open = signal(false);

  readonly nav = [
    { label: 'Home Page', path: '/home-page', icon: 'bi-house-door' },
    { label: 'Insights',  path: '/insights',  icon: 'bi-lightbulb' },
    // add the next tabs here
  ];
}