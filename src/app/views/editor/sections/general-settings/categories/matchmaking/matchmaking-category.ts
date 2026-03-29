import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { Toggle } from '../../../../../../common/components/toggle/toggle';
import { EditorService } from '../../../../../../services/splatfest/editor';

@Component({
  selector: 'app-matchmaking-category',
  imports: [ReactiveFormsModule, TranslocoPipe, Toggle],
  templateUrl: './matchmaking-category.html',
  styleUrl: './matchmaking-category.scss',
})
export class MatchmakingCategory {
  #editorService = inject(EditorService);
  #destroyRef = inject(DestroyRef);

  form = new FormGroup({
    SeparateMatchingJP: new FormControl<boolean>(false, { nonNullable: true }),
    LowPopulationNotJP: new FormControl<boolean>(false, { nonNullable: true }),
  });

  constructor() {
    const params = this.#editorService.festEtcParams();
    if (params) {
      this.form.patchValue({
        SeparateMatchingJP: params.SeparateMatchingJP,
        LowPopulationNotJP: params.LowPopulationNotJP,
      });
    }

    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe(() => {
        const { SeparateMatchingJP, LowPopulationNotJP } = this.form.getRawValue();
        this.#editorService.festEtcParams.update(prev =>
          prev ? { ...prev, SeparateMatchingJP, LowPopulationNotJP } : prev
        );
      });
  }
}
