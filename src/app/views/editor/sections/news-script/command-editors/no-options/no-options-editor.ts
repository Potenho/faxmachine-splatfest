import { Component, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-no-options-editor',
  imports: [TranslocoPipe],
  templateUrl: './no-options-editor.html',
  styleUrl: './no-options-editor.scss',
})
export class NoOptionsEditor {
  readonly commandName = input.required<string>();
}
