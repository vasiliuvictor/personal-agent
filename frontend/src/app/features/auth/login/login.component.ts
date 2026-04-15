import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

type View = 'login' | 'forgot' | 'sent';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="card-orb"></div>

      <div class="auth-card">

        <!-- ── Login form ─────────────────────── -->
        @if (view() === 'login') {
          <div class="auth-header">
            <h1 class="auth-logo">AgentScout</h1>
            <p class="auth-subtitle">Sign in to your account</p>
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label for="email">Email</label>
              <input id="email" type="email" formControlName="email"
                placeholder="you@example.com" autocomplete="email" />
              @if (loginForm.get('email')?.invalid && loginForm.get('email')?.touched) {
                <span class="error-msg">Enter a valid email address</span>
              }
            </div>

            <div class="form-group">
              <label for="password">Password</label>
              <input id="password" type="password" formControlName="password"
                placeholder="••••••••" autocomplete="current-password" />
              @if (loginForm.get('password')?.invalid && loginForm.get('password')?.touched) {
                <span class="error-msg">Password is required</span>
              }
            </div>

            <div class="forgot-row">
              <button type="button" class="forgot-link" (click)="view.set('forgot')">
                Forgot password?
              </button>
            </div>

            @if (errorMessage()) {
              <div class="auth-error">{{ errorMessage() }}</div>
            }

            <button type="submit" class="btn btn-primary auth-submit"
              [disabled]="loginForm.invalid || loading()">
              {{ loading() ? 'Signing in…' : 'Sign In' }}
            </button>
          </form>

          <p class="auth-footer">
            Don't have an account? <a routerLink="/register">Create one</a>
          </p>
        }

        <!-- ── Forgot password form ───────────── -->
        @if (view() === 'forgot') {
          <div class="auth-header">
            <h1 class="auth-logo">AgentScout</h1>
            <p class="auth-subtitle">Reset your password</p>
          </div>

          <p class="reset-hint">
            Enter your account email and we'll send you a link to set a new password.
          </p>

          <form [formGroup]="resetForm" (ngSubmit)="onSendReset()">
            <div class="form-group">
              <label for="reset-email">Email</label>
              <input id="reset-email" type="email" formControlName="email"
                placeholder="you@example.com" autocomplete="email" />
              @if (resetForm.get('email')?.invalid && resetForm.get('email')?.touched) {
                <span class="error-msg">Enter a valid email address</span>
              }
            </div>

            @if (errorMessage()) {
              <div class="auth-error">{{ errorMessage() }}</div>
            }

            <button type="submit" class="btn btn-primary auth-submit"
              [disabled]="resetForm.invalid || loading()">
              {{ loading() ? 'Sending…' : 'Send reset link' }}
            </button>
          </form>

          <p class="auth-footer">
            <button type="button" class="back-link" (click)="backToLogin()">← Back to sign in</button>
          </p>
        }

        <!-- ── Sent confirmation ──────────────── -->
        @if (view() === 'sent') {
          <div class="sent-state">
            <div class="sent-icon">✉</div>
            <h2 class="sent-title">Check your inbox</h2>
            <p class="sent-body">
              We sent a password reset link to
              <strong>{{ resetForm.get('email')?.value }}</strong>.
              The link expires in 24 hours.
            </p>
            <p class="auth-footer" style="margin-top: 1.5rem;">
              <button type="button" class="back-link" (click)="backToLogin()">← Back to sign in</button>
            </p>
          </div>
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
      background: radial-gradient(circle, rgba(38, 70, 83, 0.15) 0%, transparent 70%);
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

    .auth-subtitle {
      margin: 0;
      color: #6d8f9e;
      font-size: 0.9rem;
    }

    .forgot-row {
      display: flex;
      justify-content: flex-end;
      margin: -0.4rem 0 1rem;
    }

    .forgot-link {
      background: none;
      border: none;
      padding: 0;
      font-size: 0.8rem;
      color: #6d8f9e;
      cursor: pointer;
      text-decoration: underline;
      text-underline-offset: 2px;
      &:hover { color: #264653; }
    }

    .reset-hint {
      font-size: 0.875rem;
      color: #6d8f9e;
      line-height: 1.6;
      margin: 0 0 1.5rem;
    }

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

    .back-link {
      background: none;
      border: none;
      padding: 0;
      font-size: 0.875rem;
      color: #6d8f9e;
      cursor: pointer;
      &:hover { color: #264653; }
    }

    /* Sent state */
    .sent-state { text-align: center; padding: 0.5rem 0; }

    .sent-icon {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      line-height: 1;
    }

    .sent-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #264653;
      margin: 0 0 0.75rem;
    }

    .sent-body {
      font-size: 0.9rem;
      color: #6d8f9e;
      line-height: 1.65;
      margin: 0;
      strong { color: #264653; }
    }
  `],
})
export class LoginComponent {
  private readonly auth = inject(AuthService);

  readonly view    = signal<View>('login');
  readonly loading = signal(false);
  readonly errorMessage = signal('');

  readonly loginForm = new FormGroup({
    email:    new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  readonly resetForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) return;
    this.loading.set(true);
    this.errorMessage.set('');
    try {
      const { email, password } = this.loginForm.getRawValue();
      await this.auth.signIn(email!, password!);
    } catch (err: unknown) {
      this.errorMessage.set(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  async onSendReset(): Promise<void> {
    if (this.resetForm.invalid) return;
    this.loading.set(true);
    this.errorMessage.set('');
    try {
      await this.auth.sendPasswordReset(this.resetForm.getRawValue().email!);
      this.view.set('sent');
    } catch (err: unknown) {
      this.errorMessage.set(err instanceof Error ? err.message : 'Could not send reset email. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  backToLogin(): void {
    this.errorMessage.set('');
    this.view.set('login');
  }
}
