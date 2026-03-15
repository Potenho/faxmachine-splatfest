import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import chroma from 'chroma-js';
import { FestThemeService } from './fest-theme.service';
import { EditorService } from './editor';
import { SplatfestTeams } from './types/splatfest-model';

const makeTeams = (alpha: string, bravo: string, neutral: string): SplatfestTeams => ({
  Teams: [
    { Color: alpha, Name: {} as any, ShortName: {} as any },
    { Color: bravo, Name: {} as any, ShortName: {} as any },
    { Color: neutral },
  ],
});

// Converts "r, g, b, a" float string to chroma color
const toChroma = (raw: string) => {
  const [r, g, b] = raw.split(',').map(v => parseFloat(v.trim()));
  return chroma(r * 255, g * 255, b * 255);
};

// Normal color (lightness ~0.5 — no adjustment expected)
const NORMAL_RAW = '0.33, 0.54, 0.25, 1.0';
// Very dark color (lightness < 0.35 — should be clamped to 0.35)
const DARK_RAW   = '0.03, 0.03, 0.06, 1.0';
// Very light color (lightness > 0.70 — should be clamped to 0.70)
const LIGHT_RAW  = '0.95, 0.97, 0.92, 1.0';

const CSS_VARS = ['--color-team-alpha', '--color-team-alpha-light', '--color-team-bravo', '--color-team-neutral'];

describe('FestThemeService', () => {
  let festTeams: ReturnType<typeof signal<SplatfestTeams | null>>;

  beforeEach(() => {
    festTeams = signal<SplatfestTeams | null>(null);

    TestBed.configureTestingModule({
      providers: [
        FestThemeService,
        { provide: EditorService, useValue: { festTeams } },
      ],
    });
  });

  afterEach(() => {
    CSS_VARS.forEach(v => document.documentElement.style.removeProperty(v));
  });

  it('should be created', () => {
    expect(TestBed.inject(FestThemeService)).toBeTruthy();
  });

  it('should set CSS variables when teams are provided', () => {
    TestBed.inject(FestThemeService);
    festTeams.set(makeTeams(NORMAL_RAW, NORMAL_RAW, NORMAL_RAW));
    TestBed.tick();

    const expected = toChroma(NORMAL_RAW).css();
    const root = document.documentElement;
    expect(root.style.getPropertyValue('--color-team-alpha')).toBe(expected);
    expect(root.style.getPropertyValue('--color-team-bravo')).toBe(expected);
    expect(root.style.getPropertyValue('--color-team-neutral')).toBe(expected);
  });

  it('should clamp lightness up for very dark colors', () => {
    TestBed.inject(FestThemeService);
    festTeams.set(makeTeams(DARK_RAW, NORMAL_RAW, NORMAL_RAW));
    TestBed.tick();

    const raw = toChroma(DARK_RAW);
    expect(raw.get('hsl.l')).toBeLessThan(0.35);

    const applied = chroma(document.documentElement.style.getPropertyValue('--color-team-alpha'));
    expect(applied.get('hsl.l')).toBeCloseTo(0.35, 2);
  });

  it('should clamp lightness down for very light colors', () => {
    TestBed.inject(FestThemeService);
    festTeams.set(makeTeams(LIGHT_RAW, NORMAL_RAW, NORMAL_RAW));
    TestBed.tick();

    const raw = toChroma(LIGHT_RAW);
    expect(raw.get('hsl.l')).toBeGreaterThan(0.70);

    const applied = chroma(document.documentElement.style.getPropertyValue('--color-team-alpha'));
    expect(applied.get('hsl.l')).toBeCloseTo(0.70, 2);
  });

  it('should remove CSS variables when teams become null', () => {
    TestBed.inject(FestThemeService);
    festTeams.set(makeTeams(NORMAL_RAW, NORMAL_RAW, NORMAL_RAW));
    TestBed.tick();

    festTeams.set(null);
    TestBed.tick();

    CSS_VARS.forEach(v => expect(document.documentElement.style.getPropertyValue(v)).toBe(''));
  });

  it('should update CSS variables when team colors change', () => {
    TestBed.inject(FestThemeService);
    festTeams.set(makeTeams(NORMAL_RAW, NORMAL_RAW, NORMAL_RAW));
    TestBed.tick();

    festTeams.set(makeTeams(DARK_RAW, LIGHT_RAW, NORMAL_RAW));
    TestBed.tick();

    const root = document.documentElement;
    const alpha = chroma(root.style.getPropertyValue('--color-team-alpha'));
    const bravo = chroma(root.style.getPropertyValue('--color-team-bravo'));
    expect(alpha.get('hsl.l')).toBeCloseTo(0.35, 2);
    expect(bravo.get('hsl.l')).toBeCloseTo(0.70, 2);
  });
});
