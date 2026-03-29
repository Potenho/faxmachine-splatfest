import { Component, ElementRef, input, output, signal, computed, viewChild } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

export type ColorTab = 'hex' | 'rgb' | 'hsl';

@Component({
  selector: 'app-color-picker-modal',
  imports: [TranslocoPipe],
  templateUrl: './color-picker-modal.html',
  styleUrl: './color-picker-modal.scss',
})
export class ColorPickerModal {
  readonly title = input<string>('');
  readonly colorChanged = output<string>();

  readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  readonly tabs: Array<{ id: ColorTab; label: string }> = [
    { id: 'hex', label: 'HEX' },
    { id: 'rgb', label: 'RGB' },
    { id: 'hsl', label: 'HSL' },
  ];

  readonly activeTab = signal<ColorTab>('hex');

  readonly rRaw = signal(0);
  readonly gRaw = signal(0);
  readonly bRaw = signal(0);
  readonly aRaw = signal(1);

  readonly #originalColor = signal('0, 0, 0, 1');

  readonly rClamped = computed(() => Math.min(Math.max(this.rRaw(), 0), 1));
  readonly gClamped = computed(() => Math.min(Math.max(this.gRaw(), 0), 1));
  readonly bClamped = computed(() => Math.min(Math.max(this.bRaw(), 0), 1));

  readonly hex = computed(() => {
    const toHex = (n: number) => Math.round(n * 255).toString(16).padStart(2, '0');
    return `#${toHex(this.rClamped())}${toHex(this.gClamped())}${toHex(this.bClamped())}`;
  });

  readonly r255 = computed(() => Math.round(this.rClamped() * 255));
  readonly g255 = computed(() => Math.round(this.gClamped() * 255));
  readonly b255 = computed(() => Math.round(this.bClamped() * 255));

  readonly hsl = computed(() => this.#rgb01ToHsl(this.rClamped(), this.gClamped(), this.bClamped()));

  readonly hasOverflow = computed(() => this.rRaw() > 1 || this.gRaw() > 1 || this.bRaw() > 1);

  open(colorStr: string): void {
    this.#originalColor.set(colorStr);
    this.#parseColor(colorStr);
    this.activeTab.set('hex');
    this.dialog().nativeElement.showModal();
  }

  close(): void {
    if (this.dialog().nativeElement.open) {
      this.dialog().nativeElement.close();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === this.dialog().nativeElement) {
      this.#cancel();
    }
  }

  onDialogCancel(): void {
    this.#cancel();
  }

  onConfirm(): void {
    const fmt = (n: number) => parseFloat(n.toFixed(4));
    this.colorChanged.emit(
      `${fmt(this.rRaw())}, ${fmt(this.gRaw())}, ${fmt(this.bRaw())}, ${fmt(this.aRaw())}`
    );
    this.close();
  }

  onHexChange(value: string): void {
    const v = value.trim();
    const hex = v.startsWith('#') ? v : `#${v}`;
    if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return;
    this.rRaw.set(this.#round(parseInt(hex.slice(1, 3), 16) / 255));
    this.gRaw.set(this.#round(parseInt(hex.slice(3, 5), 16) / 255));
    this.bRaw.set(this.#round(parseInt(hex.slice(5, 7), 16) / 255));
  }

  onRgbChange(channel: 'r' | 'g' | 'b', value: string): void {
    const n = parseInt(value, 10);
    if (isNaN(n)) return;
    const v = this.#round(Math.min(Math.max(n, 0), 255) / 255);
    if (channel === 'r') this.rRaw.set(v);
    else if (channel === 'g') this.gRaw.set(v);
    else this.bRaw.set(v);
  }

  onHslChange(channel: 'h' | 's' | 'l', value: string): void {
    const n = parseFloat(value);
    if (isNaN(n)) return;
    const { h, s, l } = this.hsl();
    const nh = channel === 'h' ? Math.min(Math.max(n, 0), 360) : h;
    const ns = channel === 's' ? Math.min(Math.max(n, 0), 100) : s;
    const nl = channel === 'l' ? Math.min(Math.max(n, 0), 100) : l;
    const rgb = this.#hslToRgb01(nh, ns, nl);
    this.rRaw.set(this.#round(rgb.r));
    this.gRaw.set(this.#round(rgb.g));
    this.bRaw.set(this.#round(rgb.b));
  }

  onGameChange(channel: 'r' | 'g' | 'b', value: string): void {
    const n = parseFloat(parseFloat(value).toFixed(4));
    if (isNaN(n)) return;
    if (channel === 'r') this.rRaw.set(n);
    else if (channel === 'g') this.gRaw.set(n);
    else this.bRaw.set(n);
  }

  #round(n: number): number {
    return parseFloat(n.toFixed(4));
  }

  #cancel(): void {
    this.#parseColor(this.#originalColor());
    this.close();
  }

  #parseColor(colorStr: string): void {
    const parts = colorStr.split(',').map(v => parseFloat(v.trim()));
    if (parts.length === 4 && !parts.some(isNaN)) {
      this.rRaw.set(parts[0]);
      this.gRaw.set(parts[1]);
      this.bRaw.set(parts[2]);
      this.aRaw.set(parts[3]);
    }
  }

  #rgb01ToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    let h = 0, s = 0;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  }

  #hslToRgb01(h: number, s: number, l: number): { r: number; g: number; b: number } {
    const sn = s / 100, ln = l / 100;
    const c = (1 - Math.abs(2 * ln - 1)) * sn;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = ln - c / 2;
    let r = 0, g = 0, b = 0;
    if (h < 60)       { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else              { r = c; g = 0; b = x; }
    return { r: r + m, g: g + m, b: b + m };
  }
}
