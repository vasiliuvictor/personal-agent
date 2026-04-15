import { Component, inject, signal, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirm  = group.get('confirm')?.value;
  return password && confirm && password !== confirm ? { mismatch: true } : null;
}

type View = 'form' | 'success';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="auth-page">
      <div class="card-orb"></div>

      <div class="auth-card">

        @if (view() === 'form') {
          <div class="auth-header">
            <h1 class="auth-logo">AgentScout</h1>
            <p class="auth-subtitle">Set a new password</p>
          </div>

          <form [formGroup]="resetForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label for="password">New password</label>
              <input id="password" type="password" formControlName="password"
                placeholder="••••••••" autocomplete="new-password" />
              @if (resetForm.get('password')?.invalid && resetForm.get('password')?.touched) {
                <span class="error-msg">Password must be at least 8 characters</span>
              }
            </div>

            <div class="form-group">
              <label for="confirm">Confirm new password</label>
              <input id="confirm" type="password" formControlName="confirm"
                placeholder="••••••••" autocomplete="new-password" />
              @if (resetForm.get('confirm')?.touched && resetForm.hasError('mismatch')) {
                <span class="error-msg">Passwords do not match</span>
              }
            </div>

            @if (errorMessage()) {
              <div class="auth-error">{{ errorMessage() }}</div>
            }

            <button type="submit" class="btn btn-primary auth-submit"
              [disabled]="resetForm.invalid || loading()">
              {{ loading() ? 'Saving…' : 'Set new password' }}
            </button>
          </form>
        }

        @if (view() === 'success') {
          <div class="sent-state">
            <div class="sent-icon">✓</div>
            <h2 class="sent-title">Password updated</h2>
            <p class="sent-body">
              Your password has been changed. You can now sign in with your new password.
            </p>
            <button type="button" class="btn btn-primary auth-submit" style="margin-top: 1.5rem"
              (click)="goToLogin()">
              Go to sign in
            </button>
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

    .sent-state { text-align: center; padding: 0.5rem 0; }

    .sent-icon {
      font-size: 2.5rem;
      font-weight: 700;
      color: #2a9d8f;
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
    }
  `],
})
export class ResetPasswordComponent implements OnInit {
  private readonly auth   = inject(AuthService);
  private readonly router = inject(Router);

  readonly view         = signal<View>('form');
  readonly loading      = signal(false);
  readonly errorMessage = signal('');

  readonly resetForm = new FormGroup(
    {
      password: new FormControl('', [Validators.required, Validators.minLength(8)]),
      confirm:  new FormControl('', [Validators.required]),
    },
    { validators: passwordsMatch }
  );

  ngOnInit(): void {
    // Supabase puts the recovery token in the URL hash; the JS client picks it up
    // automatically via onAuthStateChange (PASSWORD_RECOVERY event). If there is
    // no active session and no hash token, redirect to login.
    if (!this.auth.isAuthenticated() && !window.location.hash.includes('access_token')) {
      this.router.navigate(['/login']);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.resetForm.invalid) return;
    this.loading.set(true);
    this.errorMessage.set('');
    try {
      const { password } = this.resetForm.getRawValue();
      await this.auth.updatePassword(password!);
      this.view.set('success');
    } catch (err: unknown) {
      this.errorMessage.set(err instanceof Error ? err.message : 'Could not update password. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
