import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { InsightsService } from '../insights.service';
import { AgentsService } from '../../agents/agents.service';
import { InsightCardComponent } from '../insight-card/insight-card.component';
import { Insight, Agent } from '../../../shared/models';

@Component({
  selector: 'app-insights-list',
  standalone: true,
  imports: [RouterLink, InsightCardComponent],
  template: `
    <div class="page-header">
      <div>
        <h1>Insights</h1>
        @if (filterAgent()) {
          <p class="filter-hint">
            Filtered by: <strong>{{ filterAgent()!.name }}</strong>
            <button class="clear-btn" (click)="clearFilter()">× Clear</button>
          </p>
        }
      </div>

      @if (total() > 0 || !showAll()) {
        <div class="header-controls">
          @if (total() > 0) {
            <span class="count-label">
              @if (showAll()) {
                <span class="count-hi">{{ unreadCount() }}</span> unread
                &nbsp;·&nbsp; {{ total() }} total
              } @else {
                <span class="count-hi">{{ total() }}</span> new
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
      <div class="insights-stack">
        @for (insight of insights(); track insight.id) {
          <app-insight-card [insight]="insight" (readToggled)="markRead($event)" />
        }
      </div>

      @if (hasMore()) {
        <div class="load-more-row">
          <button class="btn btn-secondary" (click)="loadMore()" [disabled]="loadingMore()">
            {{ loadingMore() ? 'Loading…' : 'Load more' }}
          </button>
        </div>
      }
    }
  `,
  styles: [`
    .filter-hint {
      margin: 0.25rem 0 0;
      font-size: 0.85rem;
      color: var(--text-3, #6d8f9e);
    }

    .clear-btn {
      background: none;
      border: none;
      padding: 0 0.25rem;
      font-size: 0.85rem;
      color: var(--text-3, #6d8f9e);
      cursor: pointer;
      margin-left: 0.4rem;
      &:hover { color: #264653; }
    }

    .header-controls {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .count-label {
      font-size: 0.875rem;
      color: #9db5c0;
    }

    .count-hi {
      color: #264653;
      font-weight: 700;
    }

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

      &:hover { border-color: #264653; color: #264653; }

      &.active {
        background: #264653;
        border-color: #264653;
        color: #fff;
      }
    }

    .insights-stack { display: flex; flex-direction: column; gap: 1rem; }

    .load-more-row { text-align: center; margin-top: 1.75rem; }
  `],
})
export class InsightsListComponent implements OnInit, OnDestroy {
  private readonly insightsService = inject(InsightsService);
  private readonly agentsService   = inject(AgentsService);
  private readonly route           = inject(ActivatedRoute);
  private routeSub?: Subscription;

  readonly insights     = signal<Insight[]>([]);
  readonly total        = signal(0);
  readonly loading      = signal(true);
  readonly loadingMore  = signal(false);
  readonly showAll      = signal(false);
  readonly agentId      = signal<string | undefined>(undefined);
  readonly filterAgent  = signal<Agent | null>(null);

  readonly unreadCount = () => this.insights().filter(i => !i.is_read).length;
  readonly hasMore     = () => this.insights().length < this.total();

  private page = 1;
  private readonly limit = 20;

  async ngOnInit(): Promise<void> {
    // Resolve initial agent filter from query params
    const initId = this.route.snapshot.queryParamMap.get('agent_id') ?? undefined;
    if (initId) {
      this.agentId.set(initId);
      this.resolveAgentName(initId);
    }
    await this.loadInsights();

    // Watch for subsequent query param changes (e.g. navigating from dashboard)
    this.routeSub = this.route.queryParamMap.subscribe(async params => {
      const newId = params.get('agent_id') ?? undefined;
      if (newId !== this.agentId()) {
        this.agentId.set(newId);
        this.filterAgent.set(null);
        if (newId) this.resolveAgentName(newId);
        await this.loadInsights();
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  private async resolveAgentName(agentId: string): Promise<void> {
    const agents = await this.agentsService.getAll();
    const agent = agents.find(a => a.id === agentId) ?? null;
    this.filterAgent.set(agent);
  }

  clearFilter(): void {
    this.agentId.set(undefined);
    this.filterAgent.set(null);
    this.loadInsights();
  }

  toggleView(): void {
    this.showAll.update(v => !v);
    this.loadInsights();
  }

  async loadInsights(): Promise<void> {
    this.loading.set(true);
    try {
      const result = await this.insightsService.getInsights(
        1, this.limit, this.agentId(), !this.showAll()
      );
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
      const result = await this.insightsService.getInsights(
        this.page + 1, this.limit, this.agentId(), !this.showAll()
      );
      this.insights.update(list => [...list, ...result.data]);
      this.page++;
    } finally {
      this.loadingMore.set(false);
    }
  }

  async markRead(id: string): Promise<void> {
    await this.insightsService.markRead(id);
    if (!this.showAll()) {
      this.insights.update(list => list.filter(i => i.id !== id));
      this.total.update(t => Math.max(0, t - 1));
    } else {
      this.insights.update(list =>
        list.map(i => i.id === id ? { ...i, is_read: true } : i)
      );
    }
  }
}
