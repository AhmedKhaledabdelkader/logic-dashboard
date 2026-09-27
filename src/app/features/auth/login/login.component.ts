import {
  Component,
  inject,
  signal,
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {

  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);

  readonly toast = signal<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  readonly loginForm = this.fb.nonNullable.group({
    username: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
      ],
    ],

    password: [
      '',
      [
        Validators.required,
        Validators.minLength(6),
      ],
    ],
  });

  get username() {
    return this.loginForm.controls.username;
  }

  get password() {
    return this.loginForm.controls.password;
  }

  submit(): void {

    if (this.loginForm.invalid) {

      this.loginForm.markAllAsTouched();

      this.showToast(
        'error',
        'Please correct the errors before continuing.'
      );

      return;
    }

    this.loading.set(true);

    this.authService.login(this.loginForm.getRawValue()).subscribe({
      next: (response) => {

        this.loading.set(false);

        this.showToast(
          'success',
          response.message || 'Login successful.'
        );

        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 500);
      },

      error: (error) => {

        this.loading.set(false);

        let message = 'Unable to login. Please check your credentials.';

        if (error?.status === 422) {

          message =
            error?.error?.message ||
            error?.error?.errors?.username?.[0] ||
            'The username or password is incorrect.';
        }

        if (error?.status === 401) {
          message = 'The username or password is incorrect.';
        }

        if (error?.status === 403) {
          message = 'You are not authorized to access the dashboard.';
        }

        this.showToast('error', message);
      },
    });
  }

  private showToast(
    type: 'success' | 'error',
    message: string
  ): void {

    this.toast.set({
      type,
      message,
    });

    setTimeout(() => {
      this.toast.set(null);
    }, 5000);
  }

  dismissToast(): void {
    this.toast.set(null);
  }
}