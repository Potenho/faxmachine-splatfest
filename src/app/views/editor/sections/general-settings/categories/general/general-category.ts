import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { EditorService } from '../../../../../../services/splatfest/editor';

@Component({
  selector: 'app-general-category',
  imports: [ReactiveFormsModule, TranslocoPipe],
  templateUrl: './general-category.html',
  styleUrl: './general-category.scss',
})
export class GeneralCategory {
  #editorService = inject(EditorService);
  #destroyRef = inject(DestroyRef);

  form = new FormGroup({
    FestivalId: new FormControl<number>(0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0)],
    }),
    BattleResultRate: new FormControl<number>(0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0)],
    }),
    Version: new FormControl<number>(0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0)],
    }),
  });

  constructor() {
    const params = this.#editorService.festEtcParams();
    if (params) {
      this.form.patchValue({
        FestivalId: params.FestivalId,
        BattleResultRate: params.BattleResultRate,
        Version: params.Version,
      });
    }

    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe(() => {
        if (!this.form.valid) return;
        const { FestivalId, BattleResultRate, Version } = this.form.getRawValue();
        this.#editorService.festEtcParams.update(prev =>
          prev ? { ...prev, FestivalId, BattleResultRate, Version } : prev
        );
      });
  }
}
