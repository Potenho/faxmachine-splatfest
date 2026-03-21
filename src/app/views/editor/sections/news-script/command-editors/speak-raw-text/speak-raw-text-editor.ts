import { Component, DestroyRef, computed, effect, inject, input, output } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { IdolEmotions, Idols } from '../../../../../../services/splatfest/types/idols';
import { SpeakRawTextCommand } from '../../../../../../services/splatfest/types/news-commands';

@Component({
  selector: 'app-speak-raw-text-editor',
  imports: [ReactiveFormsModule, TranslocoPipe],
  templateUrl: './speak-raw-text-editor.html',
  styleUrl: './speak-raw-text-editor.scss',
})
export class SpeakRawTextEditor {
  readonly #destroyRef = inject(DestroyRef);

  readonly command = input.required<SpeakRawTextCommand>();
  readonly commandChange = output<SpeakRawTextCommand>();

  readonly Idols = Idols;
  readonly idolValues = Object.values(Idols);
  readonly emotionValues = Object.values(IdolEmotions);

  readonly form = new FormGroup({
    Speaker: new FormControl<Idols>(Idols.Callie, { nonNullable: true }),
    Emotion: new FormControl<IdolEmotions>(IdolEmotions.NormalTalk, { nonNullable: true }),
    Text: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    WaitButton: new FormControl<boolean>(false, { nonNullable: true }),
    Skip: new FormControl<boolean>(true, { nonNullable: true }),
  });

  readonly #speaker = toSignal(this.form.controls.Speaker.valueChanges, {
    initialValue: this.form.controls.Speaker.value,
  });

  readonly speakerCssColor = computed(() => {
    switch (this.command().Speaker) {
      case Idols.Callie: return 'var(--color-team-alpha)';
      case Idols.Marie:  return 'var(--color-team-bravo)';
      case Idols.All:    return 'var(--color-team-neutral)';
      default:           return 'var(--color-team-alpha)';
    }
  });

  constructor() {
    effect(() => {
      const cmd = this.command();
      this.form.patchValue({
        Speaker: cmd.Speaker,
        Emotion: cmd.Emotion,
        Text: cmd.Text,
        WaitButton: cmd.WaitButton,
        Skip: cmd.Skip ?? true,
      }, { emitEvent: false });
    });

    this.form.valueChanges.pipe(takeUntilDestroyed(this.#destroyRef)).subscribe(() => {
      const v = this.form.getRawValue();
      this.commandChange.emit({
        Command: 'SpeakRawText',
        Speaker: v.Speaker,
        Emotion: v.Emotion,
        Text: v.Text,
        WaitButton: v.WaitButton,
        ...(v.Skip === false ? { Skip: false } : {}),
      });
    });
  }
}
