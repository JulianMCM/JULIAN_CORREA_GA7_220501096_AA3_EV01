import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-register-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.css'
})
export class RegisterPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected loading = false;
  protected message = '';
  protected isError = false;

  protected readonly form = this.fb.nonNullable.group({
    nombreUsuario: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    pais: ['', [Validators.required]],
    acepto: [false, [Validators.requiredTrue]]
  });

  submit() {
    if (this.form.invalid || this.loading) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.message = '';
    this.isError = false;

    const { acepto, ...payload } = this.form.getRawValue();
    void acepto;

    this.auth.register(payload).subscribe({
      next: (response) => {
        this.loading = false;
        this.message = response.status === 'success' ? 'Registro exitoso. Ya puedes iniciar sesión.' : response.message ?? 'No se pudo completar el registro.';
        this.isError = response.status !== 'success';

        if (!this.isError) {
          setTimeout(() => this.router.navigateByUrl('/login'), 900);
        }
      },
      error: () => {
        this.loading = false;
        this.isError = true;
        this.message = 'Ocurrió un error al registrar la cuenta.';
      }
    });
  }
}
