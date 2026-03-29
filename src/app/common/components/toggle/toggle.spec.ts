import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Toggle } from './toggle';

@Component({
  imports: [Toggle, ReactiveFormsModule],
  template: `<app-toggle [formControl]="ctrl" />`,
})
class TestHost {
  ctrl = new FormControl<boolean>(false, { nonNullable: true });
}

describe('Toggle', () => {
  let fixture: ComponentFixture<TestHost>;
  let host: TestHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TestHost] }).compileComponents();
    fixture = TestBed.createComponent(TestHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(host).toBeTruthy();
  });

  it('should reflect form control value', () => {
    host.ctrl.setValue(true);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('.toggle__input');
    expect(input.checked).toBeTruthy();
  });

  it('should update form control on change', () => {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('.toggle__input');
    input.click();
    fixture.detectChanges();
    expect(host.ctrl.value).toBeTruthy();
  });
});
