import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, map, of, tap } from 'rxjs';
import { ApiStatusResponse, LoginPayload, RegisterPayload, SessionResponse } from '../models/app.models';
import { environment } from '../../../environments/environment';
import { parseApiJson } from '../utils/api.utils';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiBase = environment.apiBaseUrl;

  readonly username = signal<string | null>(null);
  readonly ready = signal(false);
  readonly isAuthenticated = computed(() => !!this.username());

  checkSession() {
    return this.http.get(`${this.apiBase}/session.php`, { withCredentials: true, responseType: 'text' }).pipe(
      map((response) => parseApiJson<SessionResponse>(response)),
      tap((response) => {
        this.username.set(response.status === 'ok' ? response.usuario ?? null : null);
        this.ready.set(true);
      }),
      catchError(() => {
        this.username.set(null);
        this.ready.set(true);
        return of({ status: 'no-session' as const });
      })
    );
  }

  login(payload: LoginPayload) {
    return this.http
      .post(`${this.apiBase}/login.php`, payload, { withCredentials: true, responseType: 'text' })
      .pipe(
        map((response) => parseApiJson<ApiStatusResponse>(response)),
        tap((response) => {
          if (response.status === 'success') {
            this.checkSession().subscribe();
          }
        })
      );
  }

  register(payload: RegisterPayload) {
    return this.http
      .post(`${this.apiBase}/register.php`, payload, { withCredentials: true, responseType: 'text' })
      .pipe(map((response) => parseApiJson<ApiStatusResponse>(response)));
  }

  logout() {
    this.http
      .get(`${this.apiBase}/logout.php`, { withCredentials: true, responseType: 'text' })
      .pipe(map((response) => parseApiJson<ApiStatusResponse>(response)))
      .subscribe({
        next: () => {
          this.username.set(null);
          this.router.navigateByUrl('/login');
        },
        error: () => {
          this.username.set(null);
          this.router.navigateByUrl('/login');
        }
      });
  }

  requireAuthRedirect(targetUrl = '/login') {
    if (!this.isAuthenticated()) {
      this.router.navigateByUrl(targetUrl);
      return true;
    }

    return false;
  }
}
