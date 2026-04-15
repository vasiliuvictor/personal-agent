import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StatsService } from './stats.service';
import { StatsResponse, AgentStat } from '../../shared/models';

interface TimelineDay {
  date:  string;
  count: number;
  pct:   number;
  label: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page-header">
      <h1>Dashboard</h1>
      <a routerLink="/insights" class="btn btn-secondary btn-sm">View insights →</a>
    </div>

    @if (loading()) {
      <div class="loading-overlay"><div class="spinner"></div></div>
    } @else if (error()) {
      <div class="error-banner">Could not load stats. Please refresh.</div>
    } @else {

      <!-- ── Summary cards ────────────────────────────── -->
      <div class="stat-row">
        <div class="stat-card">
          <div class="stat-value">{{ stats()!.totalAgents }}</div>
          <div class="stat-label">Active Agents</div>
          <a routerLink="/agents" class="stat-link">Manage →</a>
        </div>
        <div class="stat-card stat-card--amber">
          <div class="stat-value">{{ stats()!.totalInsights }}</div>
          <div class="stat-label">Total Insights</div>
          <a routerLink="/insights" class="stat-link">View all →</a>
        </div>
        <div class="stat-card" [class.stat-card--alert]="stats()!.unreadInsights > 0">
          <div class="stat-value">{{ stats()!.unreadInsights }}</div>
          <div class="stat-label">Unread</div>
          <a routerLink="/insights" class="stat-link">Read now →</a>
        </div>
      </div>

      <!-- ── Insights timeline ────────────────────────── -->
      <div class="section-card card">
        <div class="section-header">
          <h2 class="section-title">Activity — last 14 days</h2>
          @if (timelineTotal() > 0) {
            <span class="section-meta">{{ timelineTotal() }} insights</span>
          }
        </div>

        @if (timelineTotal() === 0) {
          <p class="empty-chart">No activity in the last 14 days.</p>
        } @else {
          <div class="timeline-chart">
            @for (day of timelineData(); track day.date) {
              <div class="t-col">
                <div class="t-bar-wrap">
                  <div class="t-bar" [style.height.%]="day.pct"
                    [title]="day.count + ' insights on ' + day.date"></div>
                </div>
                <div class="t-label">{{ day.label }}</div>
              </div>
            }
          </div>
        }
      </div>

      <!-- ── Agent activity ──────────────────────────── -->
      <div class="section-card card">
        <div class="section-header">
          <h2 class="section-title">Activity by Agent</h2>
          <a routerLink="/agents" class="section-meta section-link">+ New agent</a>
        </div>

        @if (stats()!.insightsPerAgent.length === 0) {
          <div class="empty-state" style="border: none; padding: 1.5rem 0;">
            <h3>No agents yet</h3>
            <p>Create your first agent to start collecting insights.</p>
            <a routerLink="/agents/new" class="btn btn-primary" style="margin-top: 1rem;">
              Create Agent
            </a>
          </div>
        } @else {
          <div class="agent-activity">
            @for (row of stats()!.insightsPerAgent; track row.agentId) {
              <div class="aa-row">
                <div class="aa-meta">
                  <a routerLink="/insights" [queryParams]="{ agent_id: row.agentId }"
                    class="aa-name">{{ row.agentName }}</a>
                  <span class="aa-sub">
                    {{ row.lastRunAt ? timeAgo(row.lastRunAt) : 'never run' }}
                  </span>
                </div>

                <div class="aa-bar-wrap">
                  <div class="aa-bar-track">
                    <div class="aa-bar-fill" [style.width.%]="barPct(row.total)"
                      [title]="row.total + ' total insights'"></div>
                    @if (row.unread > 0) {
                      <div class="aa-bar-unread" [style.width.%]="barPct(row.unread)"
                        [title]="row.unread + ' unread'"></div>
                    }
                  </div>
                </div>

                <div class="aa-counts">
                  <span class="aa-total">{{ row.total }}</span>
                  @if (row.unread > 0) {
                    <span class="aa-unread">{{ row.unread }} new</span>
                  }
                </div>
              </div>
            }
          </div>
        }
      </div>

    }
  `,
  styles: [`
    /* ── Stat cards ──────────────────────────────── */
    .stat-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;

      @media (max-width: 540px) {
        grid-template-columns: 1fr;
      }
    }

    .stat-card {
      background: rgba(255, 255, 255, 0.72);
      backdrop-filter: blur(24px) saturate(180%);
      -webkit-backdrop-filter: blur(24px) saturate(180%);
      border: 1px solid rgba(255, 255, 255, 0.9);
      border-radius: 16px;
      padding: 1.4rem 1.5rem 1.2rem;
      box-shadow:
        0 4px 24px rgba(180, 130, 100, 0.14),
        inset 0 1px 0 rgba(255, 255, 255, 1);
      display: flex;
      flex-direction: column;
      gap: 0.2rem;

      &.stat-card--amber {
        border-top: 3px solid rgba(233, 196, 106, 0.7);
      }

      &.stat-card--alert {
        border-top: 3px solid rgba(42, 157, 143, 0.7);
      }
    }

    .stat-value {
      font-size: 2.6rem;
      font-weight: 800;
      color: #264653;
      line-height: 1;
      letter-spacing: -0.03em;
    }

    .stat-label {
      font-size: 0.8rem;
      font-weight: 600;
      color: #9db5c0;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-top: 0.15rem;
    }

    .stat-link {
      margin-top: auto;
      padding-top: 0.9rem;
      font-size: 0.8rem;
      font-weight: 600;
      color: #6d8f9e;
      text-decoration: none;
      &:hover { color: #264653; text-decoration: none; }
    }

    /* ── Section card ────────────────────────────── */
    .section-card {
      margin-bottom: 1.5rem;
    }

    .section-header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      margin-bottom: 1.25rem;
      gap: 1rem;
    }

    .section-title {
      font-size: 1rem;
      font-weight: 700;
      color: #264653;
      margin: 0;
    }

    .section-meta {
      font-size: 0.8rem;
      color: #9db5c0;
    }

    .section-link {
      font-weight: 600;
      color: #6d8f9e;
      text-decoration: none;
      &:hover { color: #264653; text-decoration: none; }
    }

    /* ── Timeline chart ──────────────────────────── */
    .timeline-chart {
      display: flex;
      align-items: flex-end;
      gap: 3px;
      height: 90px;
    }

    .t-col {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 100%;
    }

    .t-bar-wrap {
      flex: 1;
      width: 100%;
      display: flex;
      align-items: flex-end;
    }

    .t-bar {
      width: 100%;
      background: linear-gradient(180deg, #E9C46A 0%, #d4a843 100%);
      border-radius: 3px 3px 0 0;
      min-height: 0;
      transition: height 0.4s ease;
    }

    .t-label {
      margin-top: 5px;
      font-size: 0.6rem;
      color: #9db5c0;
      white-space: nowrap;
    }

    .empty-chart {
      font-size: 0.875rem;
      color: #9db5c0;
      margin: 0;
      padding: 1rem 0;
    }

    /* ── Agent activity ──────────────────────────── */
    .agent-activity {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .aa-row {
      display: grid;
      grid-template-columns: 200px 1fr 80px;
      align-items: center;
      gap: 1rem;

      @media (max-width: 600px) {
        grid-template-columns: 1fr auto;
        grid-template-rows: auto auto;
      }
    }

    .aa-meta {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      min-width: 0;
    }

    .aa-name {
      font-size: 0.875rem;
      font-weight: 600;
      color: #264653;
      text-decoration: none;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      &:hover { text-decoration: underline; }
    }

    .aa-sub {
      font-size: 0.72rem;
      color: #9db5c0;
    }

    .aa-bar-wrap {
      @media (max-width: 600px) {
        grid-column: 1 / -1;
        order: 3;
      }
    }

    .aa-bar-track {
      height: 8px;
      background: rgba(29, 45, 53, 0.06);
      border-radius: 999px;
      position: relative;
      overflow: hidden;
    }

    .aa-bar-fill {
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      background: linear-gradient(90deg, #264653, #2d5f72);
      border-radius: 999px;
      transition: width 0.5s ease;
    }

    .aa-bar-unread {
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      background: rgba(233, 196, 106, 0.75);
      border-radius: 999px;
      transition: width 0.5s ease;
    }

    .aa-counts {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      justify-content: flex-end;
    }

    .aa-total {
      font-size: 0.95rem;
      font-weight: 700;
      color: #264653;
    }

    .aa-unread {
      font-size: 0.7rem;
      font-weight: 600;
      padding: 0.1rem 0.45rem;
      border-radius: 999px;
      background: rgba(233, 196, 106, 0.22);
      border: 1px solid rgba(233, 196, 106, 0.5);
      color: #8a6200;
      white-space: nowrap;
    }

    /* ── Error ───────────────────────────────────── */
    .error-banner {
      background: rgba(192, 57, 43, 0.08);
      border: 1px solid rgba(192, 57, 43, 0.28);
      border-radius: 10px;
      padding: 0.8rem 1rem;
      font-size: 0.875rem;
      color: #c0392b;
    }
  `],
})
export class DashboardComponent implements OnInit {
  private readonly statsService = inject(StatsService);

  readonly stats   = signal<StatsResponse | null>(null);
  readonly loading = signal(true);
  readonly error   = signal(false);

  readonly timelineData = computed<TimelineDay[]>(() => {
    const s = this.stats();
    if (!s) return [];

    const dayMap = new Map(s.insightsByDay.map(d => [d.date, d.count]));
    const today  = new Date();
    const days: TimelineDay[] = [];

    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key   = d.toISOString().slice(0, 10);
      const count = dayMap.get(key) ?? 0;
      const label = i === 0 ? 'Today' : String(d.getDate());
      days.push({ date: key, count, pct: 0, label });
    }

    const max = Math.max(...days.map(d => d.count), 1);
    return days.map(d => ({
      ...d,
      pct: d.count > 0 ? Math.max((d.count / max) * 100, 5) : 0,
    }));
  });

  readonly timelineTotal = computed(() =>
    this.timelineData().reduce((s, d) => s + d.count, 0)
  );

  private readonly maxAgentTotal = computed(() =>
    Math.max(...(this.stats()?.insightsPerAgent.map(a => a.total) ?? [0]), 1)
  );

  barPct(total: number): number {
    return (total / this.maxAgentTotal()) * 100;
  }

  timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins  = Math.floor(diff / 60_000);
    const hours = Math.floor(diff / 3_600_000);
    const days  = Math.floor(diff / 86_400_000);

    if (mins  <  2) return 'just now';
    if (mins  < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days  <  7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString('en', { month: 'short', day: 'numeric' });
  }

  async ngOnInit(): Promise<void> {
    try {
      const result = await this.statsService.getStats();
      this.stats.set(result);
    } catch {
      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }
}
