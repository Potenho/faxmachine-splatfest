import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, input, output, viewChild } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NgOptimizedImage } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { REGULAR_STAGES } from '../../../../../../common/tokens/regular-stages';
import { StagePickerModal } from '../../../../../../common/components/stage-picker-modal/stage-picker-modal';
import { DispMapCommand } from '../../../../../../services/splatfest/types/news-commands';

@Component({
  selector: 'app-disp-map-editor',
  imports: [ReactiveFormsModule, TranslocoPipe, NgOptimizedImage, StagePickerModal],
  templateUrl: './disp-map-editor.html',
  styleUrl: './disp-map-editor.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DispMapEditor {
  readonly #destroyRef = inject(DestroyRef);
  readonly #allStages = inject(REGULAR_STAGES);

  readonly command = input.required<DispMapCommand>();
  readonly commandChange = output<DispMapCommand>();

  protected readonly stagePicker = viewChild.required(StagePickerModal);

  readonly form = new FormGroup({
    MapId: new FormControl<number>(0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0)],
    }),
  });

  readonly #mapId = toSignal(this.form.controls.MapId.valueChanges, {
    initialValue: this.form.controls.MapId.value,
  });

  readonly selectedStage = computed(() => {
    const id = this.#mapId();
    return this.#allStages.find(s => s.id === id) ?? this.#allStages[0];
  });

  constructor() {
    effect(() => {
      this.form.patchValue({ MapId: this.command().MapId }, { emitEvent: false });
    });

    this.form.valueChanges.pipe(takeUntilDestroyed(this.#destroyRef)).subscribe(() => {
      if (this.form.invalid) return;
      this.commandChange.emit({ Command: 'DispMap', MapId: this.form.getRawValue().MapId });
    });
  }

  selectStage(id: number): void {
    this.form.patchValue({ MapId: id });
  }
}
