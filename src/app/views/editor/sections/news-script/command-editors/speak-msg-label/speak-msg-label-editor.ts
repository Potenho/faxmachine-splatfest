import { Component, DestroyRef, effect, inject, input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { SpeakMsgLabelCommand } from '../../../../../../services/splatfest/types/news-commands';

@Component({
  selector: 'app-speak-msg-label-editor',
  imports: [ReactiveFormsModule, TranslocoPipe],
  templateUrl: './speak-msg-label-editor.html',
  styleUrl: './speak-msg-label-editor.scss',
})
export class SpeakMsgLabelEditor {
  readonly #destroyRef = inject(DestroyRef);

  readonly command = input.required<SpeakMsgLabelCommand>();
  readonly commandChange = output<SpeakMsgLabelCommand>();

  readonly form = new FormGroup({
    Label: new FormControl<string>('', { nonNullable: true }),
    Skip: new FormControl<boolean | null>(null),
  });

  constructor() {
    effect(() => {
      this.form.patchValue(
        { Label: this.command().Label, Skip: this.command().Skip ?? null },
        { emitEvent: false },
      );
    });

    this.form.valueChanges.pipe(takeUntilDestroyed(this.#destroyRef)).subscribe(() => {
      const v = this.form.getRawValue();
      this.commandChange.emit({
        Command: 'SpeakMsgLabel',
        Label: v.Label,
        ...(v.Skip !== null ? { Skip: v.Skip } : {}),
      });
    });
  }
}
