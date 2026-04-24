import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, of, tap } from 'rxjs';
import { ApiStatusResponse, CartItem } from '../models/app.models';
import { environment } from '../../../environments/environment';
import { parseApiJson } from '../utils/api.utils';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = environment.apiBaseUrl;

  readonly cartCount = signal(0);

  getCart() {
    return this.http
      .get(`${this.apiBase}/obtener-carrito.php`, { withCredentials: true, responseType: 'text' })
      .pipe(map((response) => this.normalizeCart(parseApiJson<unknown>(response))));
  }

  refreshCount() {
    return this.getCart().pipe(
      tap((items) => this.cartCount.set(items.length)),
      catchError(() => {
        this.cartCount.set(0);
        return of([]);
      })
    );
  }

  addToCart(idVideojuego: number) {
    return this.http
      .post(`${this.apiBase}/agregar-carrito.php`, { idVideojuego }, { withCredentials: true, responseType: 'text' })
      .pipe(map((response) => parseApiJson<ApiStatusResponse>(response)))
      .pipe(tap(() => this.refreshCount().subscribe()));
  }

  removeFromCart(idVideojuego: number) {
    return this.http
      .post(`${this.apiBase}/eliminar-carrito.php`, { idVideojuego }, { withCredentials: true, responseType: 'text' })
      .pipe(map((response) => parseApiJson<ApiStatusResponse>(response)))
      .pipe(tap(() => this.refreshCount().subscribe()));
  }

  clearCart() {
    return this.http
      .get(`${this.apiBase}/vaciar-carrito.php`, { withCredentials: true, responseType: 'text' })
      .pipe(map((response) => parseApiJson<ApiStatusResponse>(response)))
      .pipe(tap(() => this.cartCount.set(0)));
  }

  buyCart() {
    return this.http
      .get(`${this.apiBase}/comprar-carrito.php`, { withCredentials: true, responseType: 'text' })
      .pipe(map((response) => parseApiJson<ApiStatusResponse>(response)))
      .pipe(tap(() => this.cartCount.set(0)));
  }

  private normalizeCart(payload: unknown): CartItem[] {
    if (!Array.isArray(payload)) {
      return [];
    }

    const items: CartItem[] = [];

    for (const item of payload) {
      if (!item || typeof item !== 'object') {
        continue;
      }

      const source = item as Record<string, unknown>;
      const idVideojuego = Number(source['IdVideojuego'] ?? source['id'] ?? 0);

      if (!Number.isFinite(idVideojuego) || idVideojuego <= 0) {
        continue;
      }

      items.push({
        IdVideojuego: idVideojuego,
        nombre: typeof source['nombre'] === 'string' ? source['nombre'] : '',
        Precio: Number(source['Precio'] ?? source['precio'] ?? 0)
      });
    }

    return items;
  }
}
