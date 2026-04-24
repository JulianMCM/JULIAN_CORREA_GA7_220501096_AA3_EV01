import { Injectable, signal } from '@angular/core';
import { Game, ProfileGame } from '../models/app.models';

@Injectable({ providedIn: 'root' })
export class GameStateService {
  private readonly storageKey = 'playcore.selected-game';
  readonly selectedGame = signal<Game | null>(this.readStorage());

  setSelectedGame(game: Game) {
    this.selectedGame.set(game);
    localStorage.setItem(this.storageKey, JSON.stringify(game));
  }

  setSelectedProfileGame(game: ProfileGame) {
    this.setSelectedGame({
      id: game.IdVideojuego,
      nombre: game.nombre,
      fecha: game.FechaLanzamiento ?? '',
      valoraciones: Number(game.ValoracionPromedio ?? 0),
      precio: Number(game.Precio ?? 0),
      genero: game.Genero,
      etiqueta: game.Genero ? [game.Genero] : [],
      idioma: [],
      so: [],
      descripcion: game.Descripcion ?? ''
    });
  }

  clear() {
    this.selectedGame.set(null);
    localStorage.removeItem(this.storageKey);
  }

  private readStorage(): Game | null {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as Game;
    } catch {
      return null;
    }
  }
}
