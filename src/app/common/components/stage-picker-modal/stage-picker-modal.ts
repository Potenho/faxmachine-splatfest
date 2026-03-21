import { ChangeDetectionStrategy, Component, ElementRef, inject, input, output, viewChild } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { TranslocoPipe } from '@jsverse/transloco';
import { REGULAR_STAGES } from '../../tokens/regular-stages';

@Component({
  selector: 'app-stage-picker-modal',
  imports: [NgOptimizedImage, TranslocoPipe],
  templateUrl: './stage-picker-modal.html',
  styleUrl: './stage-picker-modal.scss',
})
export class StagePickerModal {
  readonly allStages = inject(REGULAR_STAGES);

  readonly titleKey = input<string>('editor.generalSettings.rotation.stages.modal.title');
  readonly stageSelected = output<number>();

  readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  open(): void {
    this.dialog().nativeElement.showModal();
  }

  close(): void {
    if (this.dialog().nativeElement.open) {
      this.dialog().nativeElement.close();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === this.dialog().nativeElement) {
      this.close();
    }
  }

  select(id: number): void {
    this.stageSelected.emit(id);
    this.close();
  }

  stageName(id: number): string {
    return this.allStages.find(s => s.id === id)?.name ?? String(id);
  }
}
