import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Agent } from '../../shared/models';

type AgentPayload = Omit<Agent, 'id' | 'created_at' | 'last_run_at' | 'next_run_at'>;

@Injectable({ providedIn: 'root' })
export class AgentsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/agents`;

  getAll(): Promise<Agent[]> {
    return lastValueFrom(this.http.get<Agent[]>(this.base));
  }

  create(payload: AgentPayload): Promise<Agent> {
    return lastValueFrom(this.http.post<Agent>(this.base, payload));
  }

  update(id: string, payload: Partial<AgentPayload>): Promise<Agent> {
    return lastValueFrom(this.http.put<Agent>(`${this.base}/${id}`, payload));
  }

  delete(id: string): Promise<void> {
    return lastValueFrom(this.http.delete<void>(`${this.base}/${id}`));
  }
}
