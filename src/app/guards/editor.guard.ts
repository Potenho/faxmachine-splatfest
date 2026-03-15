import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { EditorService } from '../services/splatfest/editor';

export const editorGuard: CanActivateFn = () => {
  const isEditing = inject(EditorService).isEditing();

  if (isEditing) return true;

  return inject(Router).createUrlTree(['/home']);
};
