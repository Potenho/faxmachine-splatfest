import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { EditorService } from '../../../../services/splatfest/editor';
import { Languages } from '../../../../services/splatfest/types/languages';
import { ColorPickerModal } from '../../../../common/components/color-picker-modal/color-picker-modal';
import { LangSelector } from '../../../../common/components/lang-selector/lang-selector';

@Component({
  selector: 'app-teams',
  imports: [TranslocoPipe, ColorPickerModal, LangSelector],
  templateUrl: './teams.html',
  styleUrl: './teams.scss',
})
export class Teams {
  readonly #editorService = inject(EditorService);
  readonly #translocoService = inject(TranslocoService);

readonly selectedLang = signal<Languages>(Languages.USen);
  readonly #editingTeamIndex = signal<0 | 1 | 2 | null>(null);

  readonly colorPickerModal = viewChild.required<ColorPickerModal>('colorPickerModal');

  readonly teamAlpha = computed(() => this.#editorService.festTeams()?.Teams[0] ?? null);
  readonly teamBravo = computed(() => this.#editorService.festTeams()?.Teams[1] ?? null);
  readonly teamNeutral = computed(() => this.#editorService.festTeams()?.Teams[2] ?? null);

  readonly alphaHex = computed(() => {
    const alpha = this.teamAlpha();
    return alpha ? this.#colorToHex(alpha.Color) : '#000000';
  });

  readonly bravoHex = computed(() => {
    const bravo = this.teamBravo();
    return bravo ? this.#colorToHex(bravo.Color) : '#000000';
  });

  readonly neutralHex = computed(() => {
    const neutral = this.teamNeutral();
    return neutral ? this.#colorToHex(neutral.Color) : '#000000';
  });

  readonly colorPickerTitle = computed(() => {
    const idx = this.#editingTeamIndex();
    if (idx === 0) return this.#translocoService.translate('editor.teams.alpha.title');
    if (idx === 1) return this.#translocoService.translate('editor.teams.bravo.title');
    return this.#translocoService.translate('editor.teams.neutral.title');
  });

  selectLang(lang: Languages): void {
    this.selectedLang.set(lang);
  }

  openColorPicker(index: 0 | 1 | 2): void {
    this.#editingTeamIndex.set(index);
    const teams = this.#editorService.festTeams();
    const color = teams?.Teams[index]?.Color ?? '0, 0, 0, 1';
    this.colorPickerModal().open(color);
  }

  updateTeamColor(colorStr: string): void {
    const idx = this.#editingTeamIndex();
    if (idx === null) return;
    const parts = colorStr.split(',').map(v => parseFloat(v.trim()));
    if (parts.length !== 4 || parts.some(isNaN)) return;
    this.#editorService.festTeams.update(prev => {
      if (!prev) return prev;
      const [t0, t1, t2] = prev.Teams;
      if (idx === 0) return { Teams: [{ ...t0, Color: colorStr }, t1, t2] };
      if (idx === 1) return { Teams: [t0, { ...t1, Color: colorStr }, t2] };
      return { Teams: [t0, t1, { Color: colorStr }] };
    });
  }

  updateAlphaName(value: string): void {
    const lang = this.selectedLang();
    this.#editorService.festTeams.update(prev => {
      if (!prev) return prev;
      const [alpha, bravo, neutral] = prev.Teams;
      return { Teams: [{ ...alpha, Name: { ...alpha.Name, [lang]: value } }, bravo, neutral] };
    });
  }

  updateAlphaShortName(value: string): void {
    const lang = this.selectedLang();
    this.#editorService.festTeams.update(prev => {
      if (!prev) return prev;
      const [alpha, bravo, neutral] = prev.Teams;
      return { Teams: [{ ...alpha, ShortName: { ...alpha.ShortName, [lang]: value } }, bravo, neutral] };
    });
  }

  updateBravoName(value: string): void {
    const lang = this.selectedLang();
    this.#editorService.festTeams.update(prev => {
      if (!prev) return prev;
      const [alpha, bravo, neutral] = prev.Teams;
      return { Teams: [alpha, { ...bravo, Name: { ...bravo.Name, [lang]: value } }, neutral] };
    });
  }

  updateBravoShortName(value: string): void {
    const lang = this.selectedLang();
    this.#editorService.festTeams.update(prev => {
      if (!prev) return prev;
      const [alpha, bravo, neutral] = prev.Teams;
      return { Teams: [alpha, { ...bravo, ShortName: { ...bravo.ShortName, [lang]: value } }, neutral] };
    });
  }

  #colorToHex(color: string): string {
    try {
      const parts = color.split(',').map(v => parseFloat(v.trim()));
      if (parts.length !== 4 || parts.some(isNaN)) return '#000000';
      const [r, g, b] = parts;
      const toHex = (n: number) =>
        Math.round(Math.min(Math.max(n, 0), 1) * 255).toString(16).padStart(2, '0');
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    } catch {
      return '#000000';
    }
  }
}
