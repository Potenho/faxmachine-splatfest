import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { PictureTypes } from '../../../../../../services/splatfest/types/news-params';
import { DispPictureCommand } from '../../../../../../services/splatfest/types/news-commands';

@Component({
  selector: 'app-disp-picture-editor',
  imports: [ReactiveFormsModule, TranslocoPipe],
  templateUrl: './disp-picture-editor.html',
  styleUrl: './disp-picture-editor.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DispPictureEditor {
  readonly #destroyRef = inject(DestroyRef);

  readonly command = input.required<DispPictureCommand>();
  readonly commandChange = output<DispPictureCommand>();

  readonly pictureValues = Object.values(PictureTypes);

  readonly form = new FormGroup({
    Picture: new FormControl<PictureTypes>(PictureTypes.FirstNewsUFO, { nonNullable: true }),
  });

  constructor() {
    effect(() => {
      this.form.patchValue({ Picture: this.command().Picture }, { emitEvent: false });
    });

    this.form.valueChanges.pipe(takeUntilDestroyed(this.#destroyRef)).subscribe(() => {
      this.commandChange.emit({ Command: 'DispPicture', Picture: this.form.getRawValue().Picture });
    });
  }
}
