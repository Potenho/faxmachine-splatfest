import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgOptimizedImage } from '@angular/common';
import { TranslocoPipe } from '@jsverse/transloco';
import { REGULAR_STAGES } from '../../../../../../common/tokens/regular-stages';
import { EditorService } from '../../../../../../services/splatfest/editor';
import { SplatfestRules } from '../../../../../../services/splatfest/types/splatfest-model';

@Component({
  selector: 'app-rotation-category',
  imports: [TranslocoPipe, NgOptimizedImage, ReactiveFormsModule],
  templateUrl: './rotation-category.html',
  styleUrl: './rotation-category.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'onModalEscape()' },
})
export class RotationCategory {
  readonly #editorService = inject(EditorService);
  readonly #destroyRef = inject(DestroyRef);
  readonly allStages = inject(REGULAR_STAGES);
  readonly SplatfestRules = SplatfestRules;

  readonly stages = computed(() => this.#editorService.festRotation()?.Stages ?? []);
  readonly canAddMore = computed(() => this.stages().length < 3);
  readonly canRemove = computed(() => this.stages().length > 1);

  readonly showModal = signal(false);
  readonly editingIndex = signal<number | null>(null);

  readonly ruleControl = new FormControl<SplatfestRules>(SplatfestRules.TurfWars, { nonNullable: true });

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
    this.showModal.set(true);
  }

  openModalForAdd(): void {
    this.editingIndex.set(null);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  onModalEscape(): void {
    if (this.showModal()) this.closeModal();
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
    this.closeModal();
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
