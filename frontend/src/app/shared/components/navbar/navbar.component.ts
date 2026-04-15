import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav>
      <div class="container" style="display: flex; align-items: center; height: 60px; gap: 1.5rem;">
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

      &:hover {
        background: rgba(255, 255, 255, 0.15);
        color: #fff;
      }
    }
  `],
})
export class NavbarComponent {
  readonly auth = inject(AuthService);
}
