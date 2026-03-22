import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { LangSwitcher } from '../../../common/components/lang-switcher/lang-switcher';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [TranslocoPipe, LangSwitcher],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About {
  constructor(private router: Router) {}

  goBack() {
    this.router.navigate(['/home/home']);
  }
}