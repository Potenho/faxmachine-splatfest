import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { HeaderTypes } from '../../../../../../services/splatfest/types/news-params';
import { ShowHeaderCommand } from '../../../../../../services/splatfest/types/news-commands';

@Component({
  selector: 'app-show-header-editor',
  imports: [ReactiveFormsModule, TranslocoPipe],
  templateUrl: './show-header-editor.html',
  styleUrl: './show-header-editor.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowHeaderEditor {
  readonly #destroyRef = inject(DestroyRef);

  readonly command = input.required<ShowHeaderCommand>();
  readonly commandChange = output<ShowHeaderCommand>();

  readonly headerValues = Object.values(HeaderTypes);

  readonly form = new FormGroup({
    Type: new FormControl<HeaderTypes>(HeaderTypes.None, { nonNullable: true }),
  });

  constructor() {
    effect(() => {
      this.form.patchValue({ Type: this.command().Type }, { emitEvent: false });
    });

    this.form.valueChanges.pipe(takeUntilDestroyed(this.#destroyRef)).subscribe(() => {
      this.commandChange.emit({ Command: 'ShowHeader', Type: this.form.getRawValue().Type });
    });
  }
}
