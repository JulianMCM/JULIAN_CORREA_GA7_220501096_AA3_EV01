import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs';
import { ApiStatusResponse, Game, LibraryCheckResponse } from '../models/app.models';
import { environment } from '../../../environments/environment';
import { parseApiJson } from '../utils/api.utils';

export interface GameFilters {
  busqueda?: string;
  minPrecio?: number;
  maxPrecio?: number;
  idioma?: string[];
  genero?: string[];
  so?: string[];
  orden?: string;
}

@Injectable({ providedIn: 'root' })
export class GamesService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = environment.apiBaseUrl;

  getGames(filters: GameFilters = {}) {
    let params = new HttpParams()
      .set('minPrecio', String(filters.minPrecio ?? 0))
      .set('maxPrecio', String(filters.maxPrecio ?? 100))
      .set('orden', filters.orden ?? 'nombre');

    if (filters.busqueda?.trim()) {
      params = params.set('busqueda', filters.busqueda.trim());
    }
    if (filters.idioma?.length) {
      params = params.set('idioma', filters.idioma.join(','));
    }
    if (filters.genero?.length) {
      params = params.set('genero', filters.genero.join(','));
    }
    if (filters.so?.length) {
      params = params.set('so', filters.so.join(','));
    }

    return this.http
      .get(`${this.apiBase}/games`, {
        params,
        withCredentials: true,
        responseType: 'text'
      })
      .pipe(map((response) => this.normalizeGames(parseApiJson<unknown>(response))));
  }

  getGameById(id: number) {
    return this.getGames({ maxPrecio: 999999, orden: 'nombre' }).pipe(
      map((games) => games.find((game) => game.id === id) ?? null)
    );
  }

  buyNow(idVideojuego: number, precio: number) {
    return this.http
      .post(`${this.apiBase}/games/${idVideojuego}/purchase`, { precio }, { withCredentials: true, responseType: 'text' })
      .pipe(map((response) => parseApiJson<ApiStatusResponse>(response)));
  }

  verifyLibrary(idVideojuego: number) {
    return this.http
      .get(`${this.apiBase}/games/${idVideojuego}/library-status`, {
        withCredentials: true,
        responseType: 'text'
      })
      .pipe(map((response) => parseApiJson<LibraryCheckResponse>(response)));
  }

  private normalizeGames(payload: unknown): Game[] {
    if (!Array.isArray(payload)) {
      return [];
    }

    return payload
      .map((item) => this.normalizeGame(item))
      .filter((game): game is Game => game !== null);
  }

  private normalizeGame(item: unknown): Game | null {
    if (!item || typeof item !== 'object') {
      return null;
    }

    const source = item as Record<string, unknown>;
    const id = Number(source['id'] ?? source['IdVideojuego']);

    if (!Number.isFinite(id) || id <= 0) {
      return null;
    }

    const genero = this.asString(source['genero'] ?? source['etiqueta']);

    return {
      id,
      nombre: this.asString(source['nombre']),
      fecha: this.asString(source['fecha']),
      valoraciones: Number(source['valoraciones'] ?? source['ValoracionPromedio'] ?? 0),
      precio: Number(source['precio'] ?? source['Precio'] ?? 0),
      genero,
      etiqueta: genero ? [genero] : [],
      idioma: this.asStringArray(source['idioma'] ?? source['Idioma']),
      so: this.asStringArray(source['so'] ?? source['SO']),
      descripcion: this.asString(source['descripcion'] ?? source['Descripcion']),
      desarrollador: this.asString(source['desarrollador'] ?? source['Desarrollador']),
      paisDesarrollador: this.asString(source['paisDesarrollador'] ?? source['PaisOrigen'])
    };
  }

  private asString(value: unknown): string {
    return typeof value === 'string' ? value : '';
  }

  private asStringArray(value: unknown): string[] {
    if (Array.isArray(value)) {
      return value.filter((item): item is string => typeof item === 'string');
    }

    if (typeof value === 'string' && value.trim()) {
      return value.split(',').map((item) => item.trim()).filter(Boolean);
    }

    return [];
  }
}
