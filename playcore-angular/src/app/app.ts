import { Component } from '@angular/core';
import { AppShellComponent } from './shared/components/app-shell/app-shell.component';

@Component({
  selector: 'app-root',
  imports: [AppShellComponent],
  template: '<app-app-shell />'
})
export class App {}
