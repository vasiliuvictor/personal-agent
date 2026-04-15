import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav>
      <div class="container nav-inner">
        <a routerLink="/dashboard" class="brand">AgentScout</a>

        <div class="nav-links">
          <a routerLink="/dashboard" routerLinkActive="nav-active"
            [routerLinkActiveOptions]="{exact: true}" class="nav-link">
            Dashboard
          </a>
          <a routerLink="/agents" routerLinkActive="nav-active" class="nav-link">
            My Agents
          </a>
        </div>

        <div class="user-area">
          <span class="user-email">{{ auth.user()?.email }}</span>
          <button class="signout-btn" (click)="auth.signOut()">Sign out</button>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    nav {
      background: rgba(38, 70, 83, 0.92);
      backdrop-filter: blur(24px) saturate(180%);
      -webkit-backdrop-filter: blur(24px) saturate(180%);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 4px 24px rgba(29, 45, 53, 0.2);
    }

    /* Inner row — CSS class so media queries can override it */
    .nav-inner {
      display: flex;
      align-items: center;
      height: 60px;
      gap: 1.5rem;
    }

    .brand {
      font-weight: 800;
      font-size: 1.15rem;
      color: #E9C46A;
      text-decoration: none;
      letter-spacing: -0.01em;
      flex-shrink: 0;
    }

    .nav-links {
      display: flex;
      gap: 0.25rem;
    }

    .nav-link {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: rgba(255, 255, 255, 0.65);
      font-size: 0.875rem;
      font-weight: 500;
      text-decoration: none;
      padding: 0.35rem 0.8rem;
      border-radius: 8px;
      border: 1px solid transparent;
      transition: all 0.2s;

      &:hover {
        color: rgba(255, 255, 255, 0.92);
        background: rgba(255, 255, 255, 0.08);
        text-decoration: none;
      }
    }

    :host ::ng-deep .nav-active {
      color: #1D2D35 !important;
      background: rgba(233, 196, 106, 0.9) !important;
      border-color: rgba(233, 196, 106, 0.6) !important;
    }

    .user-area {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-left: auto;
      border-left: 1px solid rgba(255, 255, 255, 0.1);
      padding-left: 1rem;
      min-width: 0;
      flex-shrink: 0;
    }

    .user-email {
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.5);
      max-width: 180px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .signout-btn {
      background: rgba(255, 255, 255, 0.08);
      color: rgba(255, 255, 255, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.14);
      padding: 0.3rem 0.8rem;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.8rem;
      font-weight: 500;
      transition: all 0.2s;
      white-space: nowrap;
      flex-shrink: 0;

      &:hover {
        background: rgba(255, 255, 255, 0.15);
        color: #fff;
      }
    }

    /* ── Tablet: hide email ───────────────────── */
    @media (max-width: 600px) {
      .user-email { display: none; }
      .nav-link { padding: 0.35rem 0.6rem; font-size: 0.82rem; }
    }

    /* ── Mobile (≤ 480px): two-row layout ──────
       Row 1: Brand  ·  Sign out
       Row 2: Dashboard  ·  My Agents           */
    @media (max-width: 480px) {
      .nav-inner {
        height: auto;
        flex-wrap: wrap;
        gap: 0;
        padding-top: 0.45rem;
        padding-bottom: 0;
      }

      .brand {
        flex: 1;
        font-size: 1.05rem;
      }

      /* user-area sits on row 1 beside brand */
      .user-area {
        border-left: none;
        padding-left: 0;
        margin-left: 0;
        gap: 0;
      }

      /* nav-links drop to row 2, full width */
      .nav-links {
        order: 3;
        width: 100%;
        gap: 0.15rem;
        padding: 0.35rem 0 0.4rem;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        margin-top: 0.4rem;
      }

      .nav-link {
        flex: 1;
        font-size: 0.82rem;
        padding: 0.38rem 0.5rem;
        text-align: center;
      }

      .signout-btn {
        font-size: 0.78rem;
        padding: 0.28rem 0.65rem;
      }
    }
  `],
})
export class NavbarComponent {
  readonly auth = inject(AuthService);
}
