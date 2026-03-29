import { Component, forwardRef, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-toggle',
  templateUrl: './toggle.html',
  styleUrl: './toggle.scss',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => Toggle),
    multi: true,
  }],
})
export class Toggle implements ControlValueAccessor {

  readonly checked = signal(false);
  readonly disabled = signal(false);

  #onChange: (v: boolean) => void = () => {};
  #onTouched: () => void = () => {};

  onInputChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.checked.set(checked);
    this.#onChange(checked);
    this.#onTouched();
  }

  writeValue(v: unknown): void {
    this.checked.set(!!v);
  }

  registerOnChange(fn: (v: boolean) => void): void {
    this.#onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.#onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.disabled.set(disabled);
  }
}
