import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Session, User } from '@supabase/supabase-js';
import { SupabaseService } from '../supabase.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly supabase = inject(SupabaseService);
  private readonly router = inject(Router);

  private readonly _session = signal<Session | null>(null);

  readonly user = computed<User | null>(() => this._session()?.user ?? null);
  readonly isAuthenticated = computed(() => !!this._session());
  readonly accessToken = computed(() => this._session()?.access_token ?? null);

  constructor() {
    // Keep session in sync with Supabase auth events (login, logout, token refresh)
    this.supabase.client.auth.onAuthStateChange((_event, session) => {
      this._session.set(session);
    });
  }

  /** Called by APP_INITIALIZER before any route guard runs. */
  async initialize(): Promise<void> {
    const { data } = await this.supabase.client.auth.getSession();
    this._session.set(data.session);
  }

  async signIn(email: string, password: string): Promise<void> {
    const { error } = await this.supabase.client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    await this.router.navigate(['/dashboard']);
  }

  async signUp(email: string, password: string): Promise<{ needsConfirmation: boolean }> {
    const { data, error } = await this.supabase.client.auth.signUp({ email, password });
    if (error) throw error;
    // If email confirmation is required, user will be null until confirmed
    const needsConfirmation = !data.session;
    return { needsConfirmation };
  }

  async signOut(): Promise<void> {
    await this.supabase.client.auth.signOut();
    await this.router.navigate(['/login']);
  }
}
