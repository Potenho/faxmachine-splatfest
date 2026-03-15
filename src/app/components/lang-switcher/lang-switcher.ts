import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslocoService } from '@jsverse/transloco';

const LANGS = [
  { code: 'en',    label: 'EN', name: 'English'    },
  { code: 'pt-BR', label: 'PT', name: 'Português'  },
  { code: 'de',    label: 'DE', name: 'Deutsch'    },
  { code: 'es',    label: 'ES', name: 'Español'    },
  { code: 'fr',    label: 'FR', name: 'Français'   },
  { code: 'it',    label: 'IT', name: 'Italiano'   },
  { code: 'ja',    label: 'JA', name: '日本語'      },
] as const;

@Component({
  selector: 'app-lang-switcher',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="lang-switcher" role="group" aria-label="Language">
      @for (lang of langs; track lang.code) {
        <button
          type="button"
          class="lang-switcher__btn"
          [class.lang-switcher__btn--active]="activeLang() === lang.code"
          [attr.aria-pressed]="activeLang() === lang.code"
          [attr.aria-label]="lang.name"
          (click)="setLang(lang.code)"
        >
          {{ lang.label }}
        </button>
      }
    </div>
  `,
  styles: `
    .lang-switcher {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;
    }

    .lang-switcher__btn {
      padding: 0.3rem 0.6rem;
      background: transparent;
      border: 1px solid var(--color-border);
      border-radius: 0.375rem;
      color: var(--color-text-muted);
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      cursor: pointer;
      transition: color 0.15s ease, border-color 0.15s ease, background 0.15s ease;

      &:hover {
        color: var(--color-text);
        border-color: color-mix(in srgb, var(--color-text) 25%, transparent);
      }

      &--active {
        color: var(--color-secondary);
        border-color: color-mix(in srgb, var(--color-secondary) 40%, transparent);
        background: color-mix(in srgb, var(--color-secondary) 8%, transparent);
      }

      &:focus-visible {
        outline: 2px solid color-mix(in srgb, var(--color-secondary) 75%, transparent);
        outline-offset: 2px;
      }
    }
  `,
})
export class LangSwitcher {
  #transloco = inject(TranslocoService);

  readonly langs = LANGS;
  activeLang = toSignal(this.#transloco.langChanges$, {
    initialValue: this.#transloco.getActiveLang(),
  });

  setLang(code: string) {
    this.#transloco.setActiveLang(code);
  }
}
