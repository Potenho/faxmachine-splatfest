import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { APP_VERSION } from '../../../common/tokens/app-version.token';
import { EditorService } from '../../../services/splatfest/editor';
import { LangSwitcher } from '../../../components/lang-switcher/lang-switcher';

@Component({
  selector: 'app-home',
  imports: [TranslocoPipe, LangSwitcher],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'onEscapeKey()',
  },
})
export class Home {
  #editorService = inject(EditorService);
  #router = inject(Router);

  readonly version = inject(APP_VERSION);

  showErrorModal = signal(false);
  loadingAction = signal<'file' | 'template' | null>(null);
  loading = computed(() => this.loadingAction() !== null);

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.loadingAction.set('file');
    try {
      await this.#editorService.initializeFromFile(file);
      await this.#router.navigate(['/editor']);
    } catch {
      this.showErrorModal.set(true);
    } finally {
      this.loadingAction.set(null);
      input.value = '';
    }
  }

  async onUseTemplate() {
    this.loadingAction.set('template');
    try {
      await this.#editorService.initializeFromTemplate();
      await this.#router.navigate(['/editor']);
    } catch {
      this.showErrorModal.set(true);
    } finally {
      this.loadingAction.set(null);
    }
  }

  closeErrorModal() {
    this.showErrorModal.set(false);
  }

  onEscapeKey() {
    if (this.showErrorModal()) this.closeErrorModal();
  }
}
