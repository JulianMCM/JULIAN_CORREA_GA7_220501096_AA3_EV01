import { Routes } from '@angular/router';
import { LoginPageComponent } from './features/auth/pages/login-page/login-page.component';
import { RegisterPageComponent } from './features/auth/pages/register-page/register-page.component';
import { CatalogPageComponent } from './features/catalog/pages/catalog-page/catalog-page.component';
import { GameDetailPageComponent } from './features/catalog/pages/game-detail-page/game-detail-page.component';
import { CartPageComponent } from './features/cart/pages/cart-page/cart-page.component';
import { ProfilePageComponent } from './features/profile/pages/profile-page/profile-page.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginPageComponent },
  { path: 'registro', component: RegisterPageComponent },
  { path: 'catalogo', component: CatalogPageComponent },
  { path: 'juegos/:id', component: GameDetailPageComponent },
  { path: 'carrito', component: CartPageComponent },
  { path: 'perfil', component: ProfilePageComponent },
  { path: '**', redirectTo: 'login' }
];
