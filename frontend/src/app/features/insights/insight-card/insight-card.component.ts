import { Component, input, output, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Insight } from '../../../shared/models';

@Component({
  selector: 'app-insight-card',
  standalone: true,
  template: `
    <div class="card insight-card" [class.unread]="!insight().is_read">
      <div class="insight-meta">
        <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
          @if (!insight().is_read) {
            <span class="badge badge-new">New</span>
          }
          <span class="meta-date">{{ formatDate(insight().created_at) }}</span>
          <span class="meta-query">"{{ insight().search_query }}"</span>
        </div>

        @if (!insight().is_read) {
          <button class="btn btn-secondary btn-sm mark-read-btn"
            (click)="readToggled.emit(insight().id)">
            Mark as read
          </button>
        }
      </div>

      <div class="insight-summary" [innerHTML]="renderSummary(insight().summary)"></div>

      @if (insight().sources.length > 0) {
        <div class="sources-section">
          <p class="sources-label">Sources</p>
          <ul class="sources-list">
            @for (source of insight().sources; track source.url) {
              <li>
                <a [href]="source.url" target="_blank" rel="noopener noreferrer">
                  {{ source.title || source.url }}
                </a>
              </li>
            }
          </ul>
        </div>
      }
    </div>
  `,
  styles: [`
    .insight-card {
      border-left: 3px solid rgba(29, 45, 53, 0.07);
      transition: transform 0.2s, box-shadow 0.2s;

      &.unread {
        border-left-color: #E9C46A;
      }

      &:hover {
        transform: translateY(-2px);
        box-shadow:
          0 12px 36px rgba(29, 45, 53, 0.1),
          0 4px 12px rgba(29, 45, 53, 0.06),
          inset 0 1px 0 rgba(255, 255, 255, 0.98);
      }
    }

    .insight-meta {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 0.75rem;
      margin-bottom: 0.9rem;
      flex-wrap: wrap;
    }

    .meta-date  { font-size: 0.8rem; color: #9db5c0; }
    .meta-query { font-size: 0.8rem; color: #B5838D; font-style: italic; }

    .mark-read-btn { flex-shrink: 0; }

    .insight-summary {
      font-size: 0.9rem;
      line-height: 1.75;
      color: #3d5a68;
      margin-bottom: 1.1rem;

      :deep(a) { color: #2d5f72; &:hover { color: #264653; } }
      :deep(strong) { font-weight: 700; color: #1D2D35; }
      :deep(p) { margin: 0.5rem 0; }
      :deep(p:first-child) { margin-top: 0; }
      :deep(p:last-child)  { margin-bottom: 0; }
      :deep(ul), :deep(ol) { padding-left: 1.5rem; margin: 0.5rem 0; }
      :deep(h3), :deep(h4) { color: #264653; margin: 0.75rem 0 0.25rem; }
    }

    .sources-section {
      border-top: 1px solid rgba(29, 45, 53, 0.07);
      padding-top: 0.85rem;
    }

    .sources-label {
      font-size: 0.72rem;
      font-weight: 700;
      color: #9db5c0;
      text-transform: uppercase;
      letter-spacing: 0.07em;
      margin: 0 0 0.5rem;
    }

    .sources-list {
      margin: 0;
      padding: 0;
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.3rem;

      li {
        font-size: 0.85rem;

        &::before { content: '→ '; color: #B5838D; margin-right: 0.2rem; }
      }

      a { color: #2d5f72; word-break: break-all; &:hover { color: #264653; } }
    }
  `],
})
export class InsightCardComponent {
  readonly insight = input.required<Insight>();
  readonly readToggled = output<string>();

  private readonly sanitizer = inject(DomSanitizer);

  renderSummary(markdown: string): SafeHtml {
    const html = markdown
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/^### (.+)$/gm, '<h4 style="margin:0.75rem 0 0.25rem;font-size:0.95rem;">$1</h4>')
      .replace(/^## (.+)$/gm,  '<h3 style="margin:0.75rem 0 0.25rem;font-size:1rem;">$1</h3>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/gs, '<ul style="margin:0.5rem 0;padding-left:1.5rem;">$1</ul>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');

    return this.sanitizer.bypassSecurityTrustHtml(`<p>${html}</p>`);
  }

  formatDate(isoString: string): string {
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }
}
