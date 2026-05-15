import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { ProfileGame, ProfileResponse } from '../models/app.models';
import { environment } from '../../../environments/environment';
import { parseApiJson } from '../utils/api.utils';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = environment.apiBaseUrl;

  getProfile() {
    return this.http
      .get(`${this.apiBase}/profile`, { withCredentials: true, responseType: 'text' })
      .pipe(map((response) => this.normalizeProfile(parseApiJson<unknown>(response))));
  }

  private normalizeProfile(payload: unknown): ProfileResponse {
    const source = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {};
    const usuario = source['usuario'] && typeof source['usuario'] === 'object'
      ? (source['usuario'] as Record<string, unknown>)
      : {};

    return {
      usuario: {
        NombreUsuario: typeof usuario['NombreUsuario'] === 'string' ? usuario['NombreUsuario'] : '',
        Correo: typeof usuario['Correo'] === 'string' ? usuario['Correo'] : '',
        Pais: typeof usuario['Pais'] === 'string' ? usuario['Pais'] : ''
      },
      videojuegosAdquiridos: this.normalizeGames(source['videojuegosAdquiridos']),
      deseados: this.normalizeGames(source['deseados']),
      seguidos: this.normalizeGames(source['seguidos']),
      ignorados: this.normalizeGames(source['ignorados']),
      error: typeof source['error'] === 'string' ? source['error'] : undefined
    };
  }

  private normalizeGames(value: unknown): ProfileGame[] {
    if (!Array.isArray(value)) {
      return [];
    }

    const games: ProfileGame[] = [];

    for (const item of value) {
      if (!item || typeof item !== 'object') {
        continue;
      }

      const source = item as Record<string, unknown>;
      const idVideojuego = Number(source['IdVideojuego'] ?? source['id'] ?? 0);

      if (!Number.isFinite(idVideojuego) || idVideojuego <= 0) {
        continue;
      }

      games.push({
        IdVideojuego: idVideojuego,
        nombre: typeof source['nombre'] === 'string' ? source['nombre'] : '',
        Precio: Number(source['Precio'] ?? source['precio'] ?? 0),
        Genero: typeof source['Genero'] === 'string' ? source['Genero'] : '',
        FechaLanzamiento: typeof source['FechaLanzamiento'] === 'string' ? source['FechaLanzamiento'] : '',
        ValoracionPromedio: Number(source['ValoracionPromedio'] ?? 0),
        Descripcion: typeof source['Descripcion'] === 'string' ? source['Descripcion'] : '',
        FechaAdicion: typeof source['FechaAdicion'] === 'string' ? source['FechaAdicion'] : '',
        FechaAgregado: typeof source['FechaAgregado'] === 'string' ? source['FechaAgregado'] : ''
      });
    }

    return games;
  }
}
