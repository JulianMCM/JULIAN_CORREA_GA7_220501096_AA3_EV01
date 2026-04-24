import { DecimalPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { CartService } from '../../../../core/services/cart.service';
import { CartItem } from '../../../../core/models/app.models';

@Component({
  selector: 'app-cart-page',
  imports: [RouterLink, DecimalPipe],
  templateUrl: './cart-page.component.html',
  styleUrl: './cart-page.component.css'
})
export class CartPageComponent implements OnInit {
  private readonly cartService = inject(CartService);
  private readonly auth = inject(AuthService);

  protected readonly items = signal<CartItem[]>([]);
  protected readonly loading = signal(true);

  protected readonly subtotal = computed(() =>
    this.items().reduce((total, item) => total + Number(item.Precio), 0)
  );
  protected readonly taxes = computed(() => this.subtotal() * 0.05);
  protected readonly total = computed(() => this.subtotal() + this.taxes());

  ngOnInit() {
    if (this.auth.requireAuthRedirect()) {
      return;
    }
    this.loadCart();
  }

  remove(idVideojuego: number) {
    this.cartService.removeFromCart(idVideojuego).subscribe(() => this.loadCart());
  }

  clear() {
    this.cartService.clearCart().subscribe(() => this.loadCart());
  }

  buyAll() {
    if (!window.confirm('¿Deseas confirmar la compra de todos los juegos?')) {
      return;
    }

    this.cartService.buyCart().subscribe((response) => {
      if (response.status === 'success') {
        window.alert('Compra realizada con éxito.');
        this.loadCart();
        return;
      }

      window.alert(response.message ?? 'No se pudo completar la compra.');
    });
  }

  private loadCart() {
    this.loading.set(true);
    this.cartService.getCart().subscribe({
      next: (items) => {
        this.items.set(items);
        this.loading.set(false);
        this.cartService.refreshCount().subscribe();
      },
      error: () => {
        this.items.set([]);
        this.loading.set(false);
      }
    });
  }
}
