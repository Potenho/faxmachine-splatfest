import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { IdolEmotions, Idols } from '../../../../../../services/splatfest/types/idols';
import { ChangeAnimationCommand } from '../../../../../../services/splatfest/types/news-commands';

@Component({
  selector: 'app-change-animation-editor',
  imports: [ReactiveFormsModule, TranslocoPipe],
  templateUrl: './change-animation-editor.html',
  styleUrl: './change-animation-editor.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangeAnimationEditor {
  readonly #destroyRef = inject(DestroyRef);

  readonly command = input.required<ChangeAnimationCommand>();
  readonly commandChange = output<ChangeAnimationCommand>();

  readonly idolValues = Object.values(Idols);
  readonly emotionValues = Object.values(IdolEmotions);

  readonly form = new FormGroup({
    Speaker: new FormControl<Idols>(Idols.Callie, { nonNullable: true }),
    Emotion: new FormControl<IdolEmotions>(IdolEmotions.NormalTalk, { nonNullable: true }),
  });

  constructor() {
    effect(() => {
      this.form.patchValue(
        { Speaker: this.command().Speaker, Emotion: this.command().Emotion },
        { emitEvent: false },
      );
    });

    this.form.valueChanges.pipe(takeUntilDestroyed(this.#destroyRef)).subscribe(() => {
      const v = this.form.getRawValue();
      this.commandChange.emit({ Command: 'ChangeAnimation', Speaker: v.Speaker, Emotion: v.Emotion });
    });
  }
}
