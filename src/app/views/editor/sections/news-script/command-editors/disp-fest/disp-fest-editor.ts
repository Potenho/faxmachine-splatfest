import { Component, DestroyRef, effect, inject, input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { DispFestOptions } from '../../../../../../services/splatfest/types/news-params';
import { DispFestCommand } from '../../../../../../services/splatfest/types/news-commands';

@Component({
  selector: 'app-disp-fest-editor',
  imports: [ReactiveFormsModule, TranslocoPipe],
  templateUrl: './disp-fest-editor.html',
  styleUrl: './disp-fest-editor.scss',
})
export class DispFestEditor {
  readonly #destroyRef = inject(DestroyRef);

  readonly command = input.required<DispFestCommand>();
  readonly commandChange = output<DispFestCommand>();

  readonly kindValues = Object.values(DispFestOptions);

  readonly form = new FormGroup({
    Kind: new FormControl<DispFestOptions>(DispFestOptions.Fest, { nonNullable: true }),
  });

  constructor() {
    effect(() => {
      this.form.patchValue({ Kind: this.command().Kind }, { emitEvent: false });
    });

    this.form.valueChanges.pipe(takeUntilDestroyed(this.#destroyRef)).subscribe(() => {
      this.commandChange.emit({ Command: 'DispFest', Kind: this.form.getRawValue().Kind });
    });
  }
}
