import { Component, HostListener, inject } from '@angular/core';
import { AccessibilityService } from '../../../core/services/accessibility.service';

@Component({
  selector: 'app-accessibility-widget',
  templateUrl: './accessibility-widget.component.html',
  styleUrl: './accessibility-widget.component.css'
})
export class AccessibilityWidgetComponent {
  protected readonly accessibility = inject(AccessibilityService);

  @HostListener('document:click')
  closeMenu() {
    this.accessibility.closeMenu();
  }

  stopPropagation(event: MouseEvent) {
    event.stopPropagation();
  }
}
