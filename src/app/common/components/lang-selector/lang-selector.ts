import { Component, input, output } from '@angular/core';
import { Languages } from '../../../services/splatfest/types/languages';

@Component({
  selector: 'app-lang-selector',
  templateUrl: './lang-selector.html',
  styleUrl: './lang-selector.scss',
  host: { role: 'group' },
})
export class LangSelector {
  readonly selected = input.required<Languages>();
  readonly langChange = output<Languages>();

  readonly languages = Object.values(Languages);

  readonly labels: Record<Languages, string> = {
    [Languages.EUde]: 'EU DE',
    [Languages.EUen]: 'EU EN',
    [Languages.EUes]: 'EU ES',
    [Languages.EUfr]: 'EU FR',
    [Languages.EUit]: 'EU IT',
    [Languages.JPja]: 'JP JA',
    [Languages.USen]: 'US EN',
    [Languages.USes]: 'US ES',
    [Languages.USfr]: 'US FR',
  };
}
