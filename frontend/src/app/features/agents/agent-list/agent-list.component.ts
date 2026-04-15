import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AgentsService } from '../agents.service';
import { Agent } from '../../../shared/models';

@Component({
  selector: 'app-agent-list',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    <div class="page-header">
      <h1>My Agents</h1>
      <a routerLink="/agents/new" class="btn btn-primary">+ New Agent</a>
    </div>

    @if (loading()) {
      <div class="loading-overlay"><div class="spinner"></div></div>
    } @else if (agents().length === 0) {
      <div class="empty-state">
        <h3>No agents yet</h3>
        <p>Create your first agent to start monitoring keywords and receiving AI-powered insights.</p>
        <a routerLink="/agents/new" class="btn btn-primary" style="margin-top: 1.25rem;">Create Agent</a>
      </div>
    } @else {
      <div style="display: grid; gap: 1rem;">
        @for (agent of agents(); track agent.id) {
          <div class="card agent-row">
            <div style="flex: 1; min-width: 0;">
              <div style="display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; margin-bottom: 0.55rem;">
                <h3 class="agent-name">{{ agent.name }}</h3>
                <span class="badge badge-new" style="text-transform: capitalize;">
                  {{ agent.search_frequency }}
                </span>
                @if (agent.notification_email) {
                  <span class="badge teal-badge">Email</span>
                }
              </div>
              <p class="agent-keywords">
                Keywords:
                <span class="keywords-value">{{ agent.keywords.join(', ') }}</span>
              </p>
              <p class="agent-meta">
                @if (agent.last_run_at) {
                  Last run: {{ agent.last_run_at | date:'medium' }}
                } @else {
                  Not run yet — will run on next trigger
                }
              </p>
            </div>
            <div class="agent-actions">
              <a [routerLink]="['/agents', agent.id, 'edit']" class="btn btn-secondary btn-sm">Edit</a>
              <button class="btn btn-danger btn-sm" (click)="deleteAgent(agent.id)">Delete</button>
            </div>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .agent-row {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      transition: transform 0.2s, box-shadow 0.2s;

      &:hover {
        transform: translateY(-2px);
        box-shadow:
          0 12px 36px rgba(29, 45, 53, 0.1),
          0 4px 12px rgba(29, 45, 53, 0.06),
          inset 0 1px 0 rgba(255, 255, 255, 0.98);
      }
    }

    .agent-actions {
      display: flex;
      gap: 0.5rem;
      flex-shrink: 0;
    }

    @media (max-width: 540px) {
      .agent-row { flex-direction: column; }
      .agent-actions { align-self: flex-start; }
    }

    .agent-name {
      margin: 0;
      font-size: 1rem;
      font-weight: 700;
      color: #264653;
    }

    .teal-badge {
      background: rgba(38, 70, 83, 0.1);
      border: 1px solid rgba(38, 70, 83, 0.25);
      color: #264653;
    }

    .agent-keywords {
      margin: 0;
      font-size: 0.875rem;
      color: #6d8f9e;
    }

    .keywords-value {
      color: #264653;
      font-weight: 600;
    }

    .agent-meta {
      margin: 0.35rem 0 0;
      font-size: 0.8rem;
      color: #9db5c0;
    }
  `],
})
export class AgentListComponent implements OnInit {
  private readonly agentsService = inject(AgentsService);

  readonly agents = signal<Agent[]>([]);
  readonly loading = signal(true);

  async ngOnInit(): Promise<void> {
    await this.loadAgents();
  }

  async loadAgents(): Promise<void> {
    this.loading.set(true);
    try {
      const data = await this.agentsService.getAll();
      this.agents.set(data);
    } finally {
      this.loading.set(false);
    }
  }

  async deleteAgent(id: string): Promise<void> {
    if (!confirm('Are you sure you want to delete this agent? All its insights will also be deleted.')) return;
    await this.agentsService.delete(id);
    this.agents.update(list => list.filter(a => a.id !== id));
  }
}
