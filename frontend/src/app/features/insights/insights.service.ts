import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Insight, InsightsResponse } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class InsightsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/insights`;

  getInsights(page = 1, limit = 20, agentId?: string, unreadOnly = false): Promise<InsightsResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (agentId) {
      params = params.set('agent_id', agentId);
    }
    if (unreadOnly) {
      params = params.set('unread_only', 'true');
    }

    return lastValueFrom(
      this.http.get<InsightsResponse>(this.base, { params })
    );
  }

  markRead(id: string): Promise<Insight> {
    return lastValueFrom(
      this.http.patch<Insight>(`${this.base}/${id}/read`, {})
    );
  }
}
