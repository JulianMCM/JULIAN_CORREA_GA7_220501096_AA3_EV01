import { DOCUMENT } from '@angular/common';
import { Injectable, effect, inject, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AccessibilityService {
  private readonly document = inject(DOCUMENT);

  readonly menuOpen = signal(false);
  readonly darkMode = signal(false);
  readonly fontScale = signal(100);

  constructor() {
    effect(() => {
      const body = this.document.body;
      body.classList.toggle('dark-mode', this.darkMode());
      body.style.fontSize = `${this.fontScale()}%`;
    });
  }

  toggleMenu() {
    this.menuOpen.update((value) => !value);
  }

  closeMenu() {
    this.menuOpen.set(false);
  }

  toggleContrast() {
    this.darkMode.update((value) => !value);
  }

  increaseFont() {
    this.fontScale.update((value) => Math.min(value + 10, 150));
  }

  decreaseFont() {
    this.fontScale.update((value) => Math.max(value - 10, 80));
  }
}
