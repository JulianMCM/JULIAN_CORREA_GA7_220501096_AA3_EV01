import { DatePipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { GamesService } from '../../../../core/services/games.service';
import { GameStateService } from '../../../../core/services/game-state.service';
import { Game } from '../../../../core/models/app.models';

@Component({
  selector: 'app-catalog-page',
  imports: [ReactiveFormsModule, DatePipe, DecimalPipe, TitleCasePipe],
  templateUrl: './catalog-page.component.html',
  styleUrl: './catalog-page.component.css'
})
export class CatalogPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly gamesService = inject(GamesService);
  private readonly gameState = inject(GameStateService);
  private readonly router = inject(Router);

  protected games: Game[] = [];
  protected loading = true;
  protected error = '';

  protected readonly idiomas = ['español', 'ingles', 'portugues'];
  protected readonly etiquetas = ['Acción', 'FPS', 'RPG', 'Aventura', 'Puzzle', 'indie', 'casual'];
  protected readonly sistemas = ['windows', 'macos', 'linux'];

  protected readonly filtersForm = this.fb.nonNullable.group({
    busqueda: [''],
    minPrecio: [0],
    maxPrecio: [100],
    orden: ['nombre'],
    idioma: this.fb.nonNullable.control<string[]>([]),
    genero: this.fb.nonNullable.control<string[]>([]),
    so: this.fb.nonNullable.control<string[]>([])
  });

  ngOnInit() {
    this.filtersForm.valueChanges.pipe(debounceTime(200), distinctUntilChanged()).subscribe(() => this.loadGames());
    this.loadGames();
  }

  trackByGame = (_: number, game: Game) => game.id;

  updateMultiFilter(controlName: 'idioma' | 'genero' | 'so', value: string, checked: boolean) {
    const current = [...this.filtersForm.controls[controlName].value];
    const next = checked ? [...current, value] : current.filter((item) => item !== value);
    this.filtersForm.controls[controlName].setValue(next);
  }

  openDetail(game: Game) {
    this.gameState.setSelectedGame(game);
    this.router.navigate(['/juegos', game.id]);
  }

  private loadGames() {
    this.loading = true;
    this.error = '';

    this.gamesService.getGames(this.filtersForm.getRawValue()).subscribe({
      next: (games) => {
        this.games = games;
        this.loading = false;
      },
      error: () => {
        this.games = [];
        this.loading = false;
        this.error = 'No fue posible cargar el catálogo.';
      }
    });
  }
}
