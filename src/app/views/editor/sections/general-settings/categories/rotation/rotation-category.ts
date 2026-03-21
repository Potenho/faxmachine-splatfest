import { Component, computed, DestroyRef, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgOptimizedImage } from '@angular/common';
import { TranslocoPipe } from '@jsverse/transloco';
import { REGULAR_STAGES } from '../../../../../../common/tokens/regular-stages';
import { EditorService } from '../../../../../../services/splatfest/editor';
import { SplatfestRules } from '../../../../../../services/splatfest/types/splatfest-model';
import { StagePickerModal } from '../../../../../../common/components/stage-picker-modal/stage-picker-modal';

@Component({
  selector: 'app-rotation-category',
  imports: [TranslocoPipe, NgOptimizedImage, ReactiveFormsModule, StagePickerModal],
  templateUrl: './rotation-category.html',
  styleUrl: './rotation-category.scss',
})
export class RotationCategory {
  readonly #editorService = inject(EditorService);
  readonly #destroyRef = inject(DestroyRef);
  readonly allStages = inject(REGULAR_STAGES);
  readonly SplatfestRules = SplatfestRules;

  readonly stages = computed(() => this.#editorService.festRotation()?.Stages ?? []);
  readonly canAddMore = computed(() => this.stages().length < 3);
  readonly canRemove = computed(() => this.stages().length > 1);

  readonly editingIndex = signal<number | null>(null);

  readonly ruleControl = new FormControl<SplatfestRules>(SplatfestRules.TurfWars, { nonNullable: true });

  protected readonly stagePicker = viewChild.required(StagePickerModal);

  constructor() {
    const rotation = this.#editorService.festRotation();
    if (rotation) {
      this.ruleControl.setValue(rotation.Rule, { emitEvent: false });
    }

    this.ruleControl.valueChanges
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe(rule => {
        this.#editorService.festRotation.update(prev => prev ? { ...prev, Rule: rule } : prev);
      });
  }

  openModalForEdit(index: number): void {
    this.editingIndex.set(index);
    this.stagePicker().open();
  }

  openModalForAdd(): void {
    this.editingIndex.set(null);
    this.stagePicker().open();
  }

  selectStage(id: number): void {
    const idx = this.editingIndex();
    this.#editorService.festRotation.update(prev => {
      if (!prev) return prev;
      const stages = [...prev.Stages];
      if (idx === null) {
        stages.push({ MapID: id });
      } else {
        stages[idx] = { MapID: id };
      }
      return { ...prev, Stages: stages };
    });
  }

  removeStage(index: number, event: Event): void {
    event.stopPropagation();
    this.#editorService.festRotation.update(prev => {
      if (!prev) return prev;
      return { ...prev, Stages: prev.Stages.filter((_, i) => i !== index) };
    });
  }

  stageName(id: number): string {
    return this.allStages.find(s => s.id === id)?.name ?? String(id);
  }
}
