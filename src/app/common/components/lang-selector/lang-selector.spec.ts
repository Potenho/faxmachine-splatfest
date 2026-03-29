import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { LangSelector } from './lang-selector';
import { Languages } from '../../../services/splatfest/types/languages';

@Component({
  imports: [LangSelector],
  template: `<app-lang-selector [selected]="selected" (langChange)="onChange($event)" />`,
})
class TestHost {
  selected = Languages.USen;
  changed: Languages | null = null;
  onChange(lang: Languages) { this.changed = lang; }
}

describe('LangSelector', () => {
  let fixture: ComponentFixture<TestHost>;
  let host: TestHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TestHost] }).compileComponents();
    fixture = TestBed.createComponent(TestHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render all 9 language buttons', () => {
    const btns = fixture.nativeElement.querySelectorAll('.lang-selector__btn');
    expect(btns.length).toBe(9);
  });

  it('should mark the selected lang as active', () => {
    const btns: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll('.lang-selector__btn');
    const active = Array.from(btns).filter(b => b.classList.contains('lang-selector__btn--active'));
    expect(active.length).toBe(1);
    expect(active[0].getAttribute('aria-pressed')).toBe('true');
  });

  it('should emit langChange on button click', () => {
    const btns: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll('.lang-selector__btn');
    btns[0].click();
    expect(host.changed).toBe(Languages.EUde);
  });
});
