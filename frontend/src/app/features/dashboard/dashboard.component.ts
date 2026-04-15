import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { InsightsService } from '../insights/insights.service';
import { InsightCardComponent } from '../insights/insight-card/insight-card.component';
import { Insight } from '../../shared/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, InsightCardComponent],
  template: `
    <div class="page-header">
      <h1>Dashboard</h1>
      @if (total() > 0 || !showAll()) {
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          @if (total() > 0) {
            <span style="font-size: 0.875rem; color: #9db5c0;">
              @if (showAll()) {
                <span style="color: #264653; font-weight: 700;">{{ unreadCount() }}</span> unread
                &nbsp;·&nbsp; {{ total() }} total
              } @else {
                <span style="color: #264653; font-weight: 700;">{{ total() }}</span> new
              }
            </span>
          }
          <button class="toggle-view-btn" [class.active]="showAll()" (click)="toggleView()">
            {{ showAll() ? 'New only' : 'Show all' }}
          </button>
        </div>
      }
    </div>

    @if (loading()) {
      <div class="loading-overlay"><div class="spinner"></div></div>
    } @else if (insights().length === 0) {
      <div class="empty-state">
        @if (showAll()) {
          <h3>No insights yet</h3>
          <p>Create an agent to start receiving AI-powered insights from across the web.</p>
          <a routerLink="/agents/new" class="btn btn-primary" style="margin-top: 1.25rem;">
            Create Your First Agent
          </a>
        } @else {
          <h3>All caught up</h3>
          <p>No new insights to review.</p>
          <button class="btn btn-secondary" style="margin-top: 1.25rem;" (click)="toggleView()">
            View all insights
          </button>
        }
      </div>
    } @else {
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        @for (insight of insights(); track insight.id) {
          <app-insight-card [insight]="insight" (readToggled)="markRead($event)" />
        }
      </div>

      @if (hasMore()) {
        <div style="text-align: center; margin-top: 1.75rem;">
          <button class="btn btn-secondary" (click)="loadMore()" [disabled]="loadingMore()">
            {{ loadingMore() ? 'Loading…' : 'Load more' }}
          </button>
        </div>
      }
    }
  `,
  styles: [`
    .toggle-view-btn {
      font-size: 0.78rem;
      font-weight: 600;
      padding: 0.25rem 0.7rem;
      border-radius: 999px;
      border: 1.5px solid rgba(29, 45, 53, 0.18);
      background: transparent;
      color: #9db5c0;
      cursor: pointer;
      transition: border-color 0.15s, color 0.15s, background 0.15s;
      letter-spacing: 0.02em;

      &:hover {
        border-color: #264653;
        color: #264653;
      }

      &.active {
        background: #264653;
        border-color: #264653;
        color: #fff;
      }
    }
  `],
})
export class DashboardComponent implements OnInit {
  private readonly insightsService = inject(InsightsService);

  readonly insights = signal<Insight[]>([]);
  readonly total = signal(0);
  readonly loading = signal(true);
  readonly loadingMore = signal(false);
  readonly showAll = signal(false);

  readonly unreadCount = () => this.insights().filter(i => !i.is_read).length;
  readonly hasMore = () => this.insights().length < this.total();

  private page = 1;
  private readonly limit = 20;

  async ngOnInit(): Promise<void> {
    await this.loadInsights();
  }

  toggleView(): void {
    this.showAll.update(v => !v);
    this.loadInsights();
  }

  async loadInsights(): Promise<void> {
    this.loading.set(true);
    try {
      const result = await this.insightsService.getInsights(1, this.limit, undefined, !this.showAll());
      this.insights.set(result.data);
      this.total.set(result.total ?? 0);
      this.page = 1;
    } finally {
      this.loading.set(false);
    }
  }

  async loadMore(): Promise<void> {
    this.loadingMore.set(true);
    try {
      const result = await this.insightsService.getInsights(this.page + 1, this.limit, undefined, !this.showAll());
      this.insights.update(list => [...list, ...result.data]);
      this.page++;
    } finally {
      this.loadingMore.set(false);
    }
  }

  async markRead(id: string): Promise<void> {
    await this.insightsService.markRead(id);
    if (!this.showAll()) {
      // In new-only view: remove from list (it's now archived) and decrement total
      this.insights.update(list => list.filter(i => i.id !== id));
      this.total.update(t => Math.max(0, t - 1));
    } else {
      // In all view: update in place
      this.insights.update(list =>
        list.map(i => i.id === id ? { ...i, is_read: true } : i)
      );
    }
  }
}
