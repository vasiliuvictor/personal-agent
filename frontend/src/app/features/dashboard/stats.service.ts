import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StatsResponse } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class StatsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/stats`;

  getStats(): Promise<StatsResponse> {
    return lastValueFrom(this.http.get<StatsResponse>(this.base));
  }
}
