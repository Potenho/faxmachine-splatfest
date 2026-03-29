import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-lang-switcher',
  imports: [],
  standalone: true,
  templateUrl: './app-lang-switcher.html',
  styleUrl: './app-lang-switcher.scss',
})
export class AppLangSwitcher {
  #transloco = inject(TranslocoService);

  readonly LANGS = [
    { code: 'en',    label: 'EN', name: 'English'    },
    { code: 'pt-BR', label: 'PT', name: 'Português'  },
    { code: 'de',    label: 'DE', name: 'Deutsch'    },
    { code: 'es',    label: 'ES', name: 'Español'    },
    { code: 'fr',    label: 'FR', name: 'Français'   },
    { code: 'it',    label: 'IT', name: 'Italiano'   },
    { code: 'ja',    label: 'JA', name: '日本語'      },
  ] as const;

  readonly langs = this.LANGS;
  activeLang = toSignal(this.#transloco.langChanges$, {
    initialValue: this.#transloco.getActiveLang(),
  });

  setLang(code: string) {
    this.#transloco.setActiveLang(code);
  }
}
