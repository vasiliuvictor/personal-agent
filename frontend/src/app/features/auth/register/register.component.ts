import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="card-orb"></div>

      <div class="auth-card">
        <div class="auth-header">
          <h1 class="auth-logo">AgentScout</h1>
          <p class="auth-subtitle">Create your account</p>
        </div>

        @if (confirmed()) {
          <div class="confirm-banner">
            <p class="confirm-title">Check your email!</p>
            <p class="confirm-body">
              Click the confirmation link to activate your account,
              then <a routerLink="/login">sign in here</a>.
            </p>
          </div>
        } @else {
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label for="email">Email</label>
              <input id="email" type="email" formControlName="email"
                placeholder="you@example.com" autocomplete="email" />
              @if (registerForm.get('email')?.invalid && registerForm.get('email')?.touched) {
                <span class="error-msg">Enter a valid email address</span>
              }
            </div>

            <div class="form-group">
              <label for="password">Password</label>
              <input id="password" type="password" formControlName="password"
                placeholder="••••••••" autocomplete="new-password" />
              @if (registerForm.get('password')?.invalid && registerForm.get('password')?.touched) {
                <span class="error-msg">Password must be at least 6 characters</span>
              }
            </div>

            @if (errorMessage()) {
              <div class="auth-error">{{ errorMessage() }}</div>
            }

            <button type="submit" class="btn btn-primary auth-submit"
              [disabled]="registerForm.invalid || loading()">
              {{ loading() ? 'Creating account…' : 'Create Account' }}
            </button>
          </form>

          <p class="auth-footer">
            Already have an account? <a routerLink="/login">Sign in</a>
          </p>
        }
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      position: relative;
    }

    .card-orb {
      position: absolute;
      width: 380px;
      height: 380px;
      background: radial-gradient(circle, rgba(181, 131, 141, 0.18) 0%, transparent 70%);
      border-radius: 50%;
      pointer-events: none;
      z-index: 0;
    }

    .auth-card {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 420px;
      background: rgba(255, 255, 255, 0.82);
      backdrop-filter: blur(28px) saturate(200%);
      -webkit-backdrop-filter: blur(28px) saturate(200%);
      border: 1px solid rgba(255, 255, 255, 0.95);
      border-radius: 20px;
      padding: 2.5rem;
      box-shadow:
        0 16px 56px rgba(29, 45, 53, 0.2),
        0 4px 16px rgba(29, 45, 53, 0.12),
        inset 0 1px 0 rgba(255, 255, 255, 1);
    }

    .auth-header { text-align: center; margin-bottom: 2rem; }

    .auth-logo {
      font-size: 2rem;
      font-weight: 800;
      margin: 0 0 0.4rem;
      color: #264653;
      letter-spacing: -0.03em;
    }

    .auth-subtitle { margin: 0; color: #6d8f9e; font-size: 0.9rem; }

    .confirm-banner {
      background: rgba(38, 70, 83, 0.07);
      border: 1px solid rgba(38, 70, 83, 0.2);
      border-radius: 12px;
      padding: 1.25rem;
      text-align: center;
    }

    .confirm-title { margin: 0 0 0.4rem; font-weight: 700; color: #264653; }
    .confirm-body  { margin: 0; font-size: 0.875rem; color: #6d8f9e; }

    .auth-error {
      background: rgba(192, 57, 43, 0.08);
      border: 1px solid rgba(192, 57, 43, 0.28);
      border-radius: 10px;
      padding: 0.65rem 0.9rem;
      font-size: 0.875rem;
      color: #c0392b;
      margin-bottom: 1rem;
    }

    .auth-submit {
      width: 100%;
      justify-content: center;
      padding: 0.72rem;
      font-size: 0.95rem;
      margin-top: 0.5rem;
    }

    .auth-footer {
      text-align: center;
      margin-top: 1.5rem;
      margin-bottom: 0;
      font-size: 0.875rem;
      color: #6d8f9e;
    }
  `],
})
export class RegisterComponent {
  private readonly auth = inject(AuthService);

  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly confirmed = signal(false);

  readonly registerForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  async onSubmit(): Promise<void> {
    if (this.registerForm.invalid) return;
    this.loading.set(true);
    this.errorMessage.set('');
    try {
      const { email, password } = this.registerForm.getRawValue();
      const { needsConfirmation } = await this.auth.signUp(email!, password!);
      if (needsConfirmation) this.confirmed.set(true);
    } catch (err: unknown) {
      this.errorMessage.set(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }
}
