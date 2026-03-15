import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-news-script',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="placeholder">
      <p>News Script — coming soon</p>
    </div>
  `,
  styles: `
    :host {
      display: flex;
      flex: 1;
    }
    @media (prefers-reduced-motion: no-preference) {
      :host { animation: page-fade-in 220ms ease both; }
    }
    .placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      flex: 1;
      color: var(--color-text-muted);
      font-size: 0.95rem;
    }
  `,
})
export class NewsScript {}
