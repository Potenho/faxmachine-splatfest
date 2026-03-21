import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { APP_VERSION } from '../../common/tokens/app-version.token';
import { EditorService } from '../../services/splatfest/editor';
import { FestThemeService } from '../../services/splatfest/fest-theme.service';

@Component({
  selector: 'app-editor',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslocoPipe],
  templateUrl: './editor.html',
  styleUrl: './editor.scss',
  host: { '(document:keydown.escape)': 'onEscapeKey()' },
})
export class Editor {
  #editorService = inject(EditorService);
  #router = inject(Router);
  readonly #festTheme = inject(FestThemeService);

  readonly version = inject(APP_VERSION);

  showCloseModal = signal(false);

  openCloseModal() {
    this.showCloseModal.set(true);
  }

  cancelClose() {
    this.showCloseModal.set(false);
  }

  saveAndExit() {
    this.#editorService.downloadSplatfestFile();
    this.#exitEditor();
  }

  exitWithoutSaving() {
    this.#exitEditor();
  }

  saveFile() {
    this.#editorService.downloadSplatfestFile();
  }

  onEscapeKey() {
    if (this.showCloseModal()) {
      this.cancelClose();
    }
  }

  #exitEditor() {
    this.showCloseModal.set(false);
    this.#editorService.closeEditor();
    this.#router.navigate(['/home']);
  }
}
