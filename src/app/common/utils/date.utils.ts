import { AbstractControl, ValidatorFn } from '@angular/forms';

export function dateOrderValidator(earlierKey: string, laterKey: string, errorKey: string): ValidatorFn {
  return (group: AbstractControl) => {
    const earlier = (group.get(earlierKey)?.value as string) ?? '';
    const later = (group.get(laterKey)?.value as string) ?? '';
    if (!earlier || !later) return null;
    return new Date(earlier) > new Date(later) ? { [errorKey]: true } : null;
  };
}

export function isoToLocal(iso: string): string {
  if (!iso) return '';
  return iso.slice(0, 16);
}

export function localToIso(local: string): string {
  if (!local) return '';
  return `${local}:00.000Z`;
}
