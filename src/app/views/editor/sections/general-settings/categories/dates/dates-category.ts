import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { dateOrderValidator, isoToLocal, localToIso } from '../../../../../../common/utils/date.utils';
import { EditorService } from '../../../../../../services/splatfest/editor';

@Component({
  selector: 'app-dates-category',
  imports: [ReactiveFormsModule, TranslocoPipe],
  templateUrl: './dates-category.html',
  styleUrl: './dates-category.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatesCategory {
  #editorService = inject(EditorService);
  #destroyRef = inject(DestroyRef);

  form = new FormGroup(
    {
      Announce: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      Start: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      End: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      Result: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    },
    {
      validators: [
        dateOrderValidator('Announce', 'Start', 'startNotAfterAnnounce'),
        dateOrderValidator('Start', 'End', 'endNotAfterStart'),
        dateOrderValidator('End', 'Result', 'resultNotAfterEnd'),
      ],
    }
  );

  constructor() {
    const time = this.#editorService.festTime()?.Time;
    if (time) {
      this.form.patchValue({
        Announce: isoToLocal(time.Announce),
        Start: isoToLocal(time.Start),
        End: isoToLocal(time.End),
        Result: isoToLocal(time.Result),
      });
    }

    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe(() => {
        if (!this.form.valid) return;
        const { Announce, Start, End, Result } = this.form.getRawValue();
        this.#editorService.festTime.update(prev =>
          prev
            ? {
                Time: {
                  Announce: localToIso(Announce),
                  Start: localToIso(Start),
                  End: localToIso(End),
                  Result: localToIso(Result),
                },
              }
            : prev
        );
      });
  }
}
