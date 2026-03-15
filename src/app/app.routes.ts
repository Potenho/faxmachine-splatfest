import { Routes } from '@angular/router';
import { Home } from './views/home/home/home';
import { Editor } from './views/editor/editor';
import { GeneralSettings } from './views/editor/sections/general-settings/general-settings';
import { NewsScript } from './views/editor/sections/news-script/news-script';
import { Teams } from './views/editor/sections/teams/teams';
import { editorGuard } from './guards/editor.guard';
import { homeGuard } from './guards/home.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home, canActivate: [homeGuard] },
  {
    path: 'editor',
    component: Editor,
    canActivate: [editorGuard],
    children: [
      { path: '', redirectTo: 'general-settings', pathMatch: 'full' },
      { path: 'general-settings', component: GeneralSettings },
      { path: 'news-script', component: NewsScript },
      { path: 'teams',       component: Teams },
    ],
  },
  { path: '**', redirectTo: 'home' },
];
