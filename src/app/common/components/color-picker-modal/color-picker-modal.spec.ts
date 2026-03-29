import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getTranslocoTestingModule } from '../../../../transloco-testing.module';
import { ColorPickerModal } from './color-picker-modal';

describe('ColorPickerModal', () => {
  let component: ColorPickerModal;
  let fixture: ComponentFixture<ColorPickerModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColorPickerModal, getTranslocoTestingModule()],
    }).compileComponents();

    fixture = TestBed.createComponent(ColorPickerModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should parse a color string and compute hex', () => {
    component['#parseColor']('1, 0, 0, 1');
    expect(component.hex()).toBe('#ff0000');
  });

  it('should clamp values above 1 for hex computation', () => {
    component.rRaw.set(1.5);
    component.gRaw.set(0);
    component.bRaw.set(0);
    expect(component.rClamped()).toBe(1);
    expect(component.hex()).toBe('#ff0000');
    expect(component.hasOverflow()).toBeTrue();
  });

  it('should convert hex input to raw signals', () => {
    component.onHexChange('#ff8000');
    expect(component.r255()).toBe(255);
    expect(component.g255()).toBe(128);
    expect(component.b255()).toBe(0);
  });

  it('should ignore invalid hex input', () => {
    component.rRaw.set(1);
    component.onHexChange('invalid');
    expect(component.rRaw()).toBe(1);
  });

  it('should allow game format values above 1', () => {
    component.onGameChange('r', '1.8');
    expect(component.rRaw()).toBe(1.8);
    expect(component.rClamped()).toBe(1);
  });

  it('should round-trip rgb change through signals', () => {
    component.onRgbChange('r', '200');
    expect(component.r255()).toBe(200);
  });

  it('should emit color string on confirm', () => {
    const emitted: string[] = [];
    component.colorChanged.subscribe((v: string) => emitted.push(v));
    component.rRaw.set(1);
    component.gRaw.set(0.5);
    component.bRaw.set(0);
    component.aRaw.set(1);
    component.onConfirm();
    expect(emitted.length).toBe(1);
    expect(emitted[0]).toContain('1');
  });

  it('should switch tabs', () => {
    expect(component.activeTab()).toBe('hex');
    component.activeTab.set('rgb');
    expect(component.activeTab()).toBe('rgb');
  });
});
