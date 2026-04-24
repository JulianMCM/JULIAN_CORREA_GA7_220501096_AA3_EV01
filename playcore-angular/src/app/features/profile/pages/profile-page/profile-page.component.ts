import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { GameStateService } from '../../../../core/services/game-state.service';
import { ProfileService } from '../../../../core/services/profile.service';
import { ProfileGame, ProfileResponse } from '../../../../core/models/app.models';

type ProfileTab = 'owned' | 'favorites' | 'followed' | 'ignored';

@Component({
  selector: 'app-profile-page',
  imports: [DatePipe, DecimalPipe, RouterLink],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css'
})
export class ProfilePageComponent implements OnInit {
  private readonly profileService = inject(ProfileService);
  private readonly gameState = inject(GameStateService);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  protected readonly profile = signal<ProfileResponse | null>(null);
  protected readonly activeTab = signal<ProfileTab>('owned');
  protected readonly loading = signal(true);

  ngOnInit() {
    if (this.auth.requireAuthRedirect()) {
      return;
    }

    this.profileService.getProfile().subscribe({
      next: (profile) => {
        if (profile.error) {
          this.router.navigateByUrl('/login');
          return;
        }

        this.profile.set(profile);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.router.navigateByUrl('/login');
      }
    });
  }

  setTab(tab: ProfileTab) {
    this.activeTab.set(tab);
  }

  openGameDetail(game: ProfileGame) {
    this.gameState.setSelectedProfileGame(game);
    this.router.navigate(['/juegos', game.IdVideojuego]);
  }
}
