import { effect, inject, Injectable } from '@angular/core';
import chroma from 'chroma-js';
import { EditorService } from './editor';

const MIN_LIGHTNESS   = 0.35;
const MAX_LIGHTNESS   = 0.70;
const LIGHT_BUMP      = 0.15; // how much brighter --color-team-alpha-light is vs alpha

@Injectable({ providedIn: 'root' })
export class FestThemeService {
  readonly #editorService = inject(EditorService);

  constructor() {
    effect(() => {
      const teams = this.#editorService.festTeams();
      if (teams) {
        this.#applyTheme(
          teams.Teams[0].Color,
          teams.Teams[1].Color,
          teams.Teams[2].Color,
        );
      } else {
        this.#resetTheme();
      }
    });
  }

  #applyTheme(alphaColor: string, bravoColor: string, neutralColor: string): void {
    const root = document.documentElement;
    const alphaChroma   = this.#normalizeChroma(alphaColor);
    const bravoChroma   = this.#normalizeChroma(bravoColor);
    const neutralChroma = this.#normalizeChroma(neutralColor);

    const alpha   = alphaChroma.css();
    const bravo   = bravoChroma.css();
    const neutral = neutralChroma.css();
    const alphaLight = alphaChroma
      .set('hsl.l', Math.min(alphaChroma.get('hsl.l') + LIGHT_BUMP, 0.92))
      .css();

    root.style.setProperty('--color-team-alpha', alpha);
    root.style.setProperty('--color-team-alpha-light', alphaLight);
    root.style.setProperty('--color-team-bravo', bravo);
    root.style.setProperty('--color-team-neutral', neutral);
  }

  #normalizeChroma(raw: string): chroma.Color {
    const [r, g, b] = raw.split(',').map(v => parseFloat(v.trim()));
    let color = chroma(r * 255, g * 255, b * 255);

    const l = color.get('hsl.l');

    if (l < MIN_LIGHTNESS) {
      color = color.set('hsl.l', MIN_LIGHTNESS);
    } else if (l > MAX_LIGHTNESS) {
      color = color.set('hsl.l', MAX_LIGHTNESS);
    }

    return color;
  }

  #resetTheme(): void {
    const root = document.documentElement;
    root.style.removeProperty('--color-team-alpha');
    root.style.removeProperty('--color-team-alpha-light');
    root.style.removeProperty('--color-team-bravo');
    root.style.removeProperty('--color-team-neutral');
  }
}
