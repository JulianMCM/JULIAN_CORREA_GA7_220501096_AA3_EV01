import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CartService } from '../../../../core/services/cart.service';
import { GameStateService } from '../../../../core/services/game-state.service';
import { GamesService } from '../../../../core/services/games.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Game } from '../../../../core/models/app.models';

@Component({
  selector: 'app-game-detail-page',
  imports: [RouterLink, DecimalPipe, DatePipe],
  templateUrl: './game-detail-page.component.html',
  styleUrl: './game-detail-page.component.css'
})
export class GameDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cartService = inject(CartService);
  private readonly gameState = inject(GameStateService);
  private readonly gamesService = inject(GamesService);
  private readonly auth = inject(AuthService);

  protected readonly images = ['assests/img/sample1.jpg', 'assests/img/sample2.jpg', 'assests/img/sample3.jpg'];
  protected readonly selectedImage = signal(this.images[0]);
  protected readonly game = signal<Game | null>(null);
  protected readonly inLibrary = signal(false);
  protected readonly loading = signal(true);
  protected readonly busy = signal(false);
  protected readonly genreTags = computed(() => {
    const current = this.game();
    if (!current) {
      return [];
    }

    if (Array.isArray(current.etiqueta)) {
      return current.etiqueta;
    }

    return current.genero ? [current.genero] : [];
  });

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const selected = this.gameState.selectedGame();

    if (selected && selected.id === id) {
      this.game.set(selected);
      this.loading.set(false);
      this.verifyLibrary(id);
      return;
    }

    this.gamesService.getGameById(id).subscribe({
      next: (game) => {
        this.game.set(game);
        this.loading.set(false);
        if (game) {
          this.gameState.setSelectedGame(game);
          this.verifyLibrary(id);
        }
      },
      error: () => this.loading.set(false)
    });
  }

  chooseImage(image: string) {
    this.selectedImage.set(image);
  }

  addToCart() {
    const game = this.game();
    if (!game || this.busy()) {
      return;
    }
    if (this.auth.requireAuthRedirect()) {
      return;
    }

    this.busy.set(true);
    this.cartService.addToCart(game.id).subscribe({
      next: (response) => {
        this.busy.set(false);
        if (response.status === 'success') {
          window.alert('Juego agregado al carrito.');
        } else {
          window.alert(response.message ?? 'No se pudo agregar el juego.');
        }
      },
      error: () => {
        this.busy.set(false);
        window.alert('No se pudo agregar el juego al carrito.');
      }
    });
  }

  buyNow() {
    const game = this.game();
    if (!game || this.busy()) {
      return;
    }
    if (this.auth.requireAuthRedirect()) {
      return;
    }

    this.busy.set(true);
    this.gamesService.buyNow(game.id, game.precio).subscribe({
      next: (response) => {
        this.busy.set(false);
        if (response.status === 'success') {
          window.alert('Compra realizada correctamente.');
          this.router.navigateByUrl('/perfil');
          return;
        }

        window.alert(response.message ?? 'No se pudo completar la compra.');
      },
      error: () => {
        this.busy.set(false);
        window.alert('No se pudo completar la compra.');
      }
    });
  }

  private verifyLibrary(id: number) {
    this.gamesService.verifyLibrary(id).subscribe({
      next: ({ enBiblioteca }) => this.inLibrary.set(enBiblioteca),
      error: () => this.inLibrary.set(false)
    });
  }
}
