import { Component } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { GeneralCategory } from './categories/general/general-category';
import { DatesCategory } from './categories/dates/dates-category';
import { RotationCategory } from './categories/rotation/rotation-category';
import { MatchmakingCategory } from './categories/matchmaking/matchmaking-category';

@Component({
  selector: 'app-general-settings',
  imports: [TranslocoPipe, GeneralCategory, DatesCategory, RotationCategory, MatchmakingCategory],
  templateUrl: './general-settings.html',
  styleUrl: './general-settings.scss',
})
export class GeneralSettings {}
