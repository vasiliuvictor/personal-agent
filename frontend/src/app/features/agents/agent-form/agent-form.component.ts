import { Component, inject, signal, OnInit, input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AgentsService } from '../agents.service';
import { SearchFrequency } from '../../../shared/models';

@Component({
  selector: 'app-agent-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div style="max-width: 580px;">
      <div class="page-header">
        <h1>{{ isEditing() ? 'Edit Agent' : 'New Agent' }}</h1>
      </div>

      <div class="card">
        <form [formGroup]="agentForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="name">Agent Name</label>
            <input id="name" type="text" formControlName="name"
              placeholder="e.g. AI News Tracker" />
            @if (agentForm.get('name')?.invalid && agentForm.get('name')?.touched) {
              <span class="error-msg">Name must be at least 2 characters</span>
            }
          </div>

          <div class="form-group">
            <label for="keywords">Keywords</label>
            <input id="keywords" type="text" formControlName="keywordsRaw"
              placeholder="e.g. artificial intelligence, LLM, ChatGPT" />
            <span class="hint">Separate multiple keywords with commas</span>
            @if (agentForm.get('keywordsRaw')?.invalid && agentForm.get('keywordsRaw')?.touched) {
              <span class="error-msg">At least one keyword is required</span>
            }
          </div>

          <div class="form-group">
            <label for="frequency">Search Frequency</label>
            <select id="frequency" formControlName="search_frequency">
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>

          <div class="form-group checkbox-group">
            <input id="notifyEmail" type="checkbox" formControlName="notification_email" />
            <label for="notifyEmail">Send email notification when new insights are found</label>
          </div>

          @if (errorMessage()) {
            <div class="form-error">{{ errorMessage() }}</div>
          }

          <div style="display: flex; gap: 0.75rem; margin-top: 1.75rem;">
            <button type="submit" class="btn btn-primary"
              [disabled]="agentForm.invalid || saving()">
              {{ saving() ? 'Saving…' : (isEditing() ? 'Save Changes' : 'Create Agent') }}
            </button>
            <a routerLink="/agents" class="btn btn-secondary">Cancel</a>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .checkbox-group {
      flex-direction: row !important;
      align-items: center;
      gap: 0.75rem;

      input[type="checkbox"] {
        width: 16px;
        height: 16px;
        cursor: pointer;
        accent-color: #264653;
        flex-shrink: 0;
      }

      label {
        margin: 0;
        cursor: pointer;
        color: #3d5a68;
        font-weight: 500;
      }
    }

    .form-error {
      background: rgba(192, 57, 43, 0.08);
      border: 1px solid rgba(192, 57, 43, 0.28);
      border-radius: 10px;
      padding: 0.65rem 0.9rem;
      font-size: 0.875rem;
      color: #c0392b;
    }
  `],
})
export class AgentFormComponent implements OnInit {
  readonly id = input<string | undefined>(undefined);

  private readonly agentsService = inject(AgentsService);
  private readonly router = inject(Router);

  readonly saving = signal(false);
  readonly errorMessage = signal('');
  readonly isEditing = signal(false);

  readonly agentForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2)]),
    keywordsRaw: new FormControl('', [Validators.required]),
    search_frequency: new FormControl<SearchFrequency>('daily', [Validators.required]),
    notification_email: new FormControl(false),
  });

  async ngOnInit(): Promise<void> {
    const agentId = this.id();
    if (agentId) {
      this.isEditing.set(true);
      const agents = await this.agentsService.getAll();
      const agent = agents.find(a => a.id === agentId);
      if (agent) {
        this.agentForm.patchValue({
          name: agent.name,
          keywordsRaw: agent.keywords.join(', '),
          search_frequency: agent.search_frequency,
          notification_email: agent.notification_email,
        });
      }
    }
  }

  async onSubmit(): Promise<void> {
    if (this.agentForm.invalid) return;
    this.saving.set(true);
    this.errorMessage.set('');
    try {
      const value = this.agentForm.getRawValue();
      const payload = {
        name: value.name!,
        keywords: value.keywordsRaw!.split(',').map(k => k.trim()).filter(Boolean),
        search_frequency: value.search_frequency as SearchFrequency,
        notification_email: value.notification_email ?? false,
      };
      const agentId = this.id();
      if (agentId) {
        await this.agentsService.update(agentId, payload);
      } else {
        await this.agentsService.create(payload);
      }
      await this.router.navigate(['/agents']);
    } catch (err: unknown) {
      this.errorMessage.set(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    } finally {
      this.saving.set(false);
    }
  }
}
