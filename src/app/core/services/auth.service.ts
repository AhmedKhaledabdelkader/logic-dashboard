import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import {
  AuthUser,
  LoginPayload,
  LoginResponse,
  LogoutResponse,
  MeResponse,
} from '../models/auth.models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly apiUrl = 'https://desperate-handling-deliver-family.trycloudflare.com/api/auth';

  private readonly TOKEN_KEY = 'dashboard_token';
  private readonly USER_KEY = 'dashboard_user';

  login(credentials: LoginPayload): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap((response) => {
          this.setToken(response.data.token);
          this.setUser(response.data.user);
        })
      );
  }

  logout(): Observable<LogoutResponse> {
    return this.http
      .post<LogoutResponse>(`${this.apiUrl}/logout`, {})
      .pipe(
        tap(() => {
          this.clearAuth();
          this.router.navigate(['/login']);
        })
      );
  }

  me(): Observable<MeResponse> {
    return this.http.get<MeResponse>(`${this.apiUrl}/me`);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUser(): AuthUser | null {
    const user = localStorage.getItem(this.USER_KEY);

    if (!user) {
      return null;
    }

    try {
      return JSON.parse(user) as AuthUser;
    } catch {
      return null;
    }
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  setUser(user: AuthUser): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  clearAuth(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  forceLogout(): void {
    this.clearAuth();
    this.router.navigate(['/login']);
  }
}