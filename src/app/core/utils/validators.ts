import { AbstractControl, ValidationErrors } from '@angular/forms';

import { ValidatorFn } from '@angular/forms';

/** Checks type and size of a newly chosen file (an existing URL or an empty value is ignored) */
export function imageFileValidator(maxMb = 2): ValidatorFn {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];

  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!(value instanceof File)) return null;
    if (!allowed.includes(value.type)) return { imageType: true };
    if (value.size > maxMb * 1024 * 1024) return { imageSize: { maxMb } };
    return null;
  };
}

/** Rejects values that contain only spaces (empty values are handled by Validators.required) */
export function notBlank(control: AbstractControl): ValidationErrors | null {
  const v = control.value;
  return typeof v === 'string' && v.length > 0 && v.trim().length === 0 ? { blank: true } : null;
}

const YOUTUBE_REGEX =
  /^(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})(?:[?&#/].*)?$/;

export function extractYoutubeId(url: string | null | undefined): string | null {
  const match = (url ?? '').trim().match(YOUTUBE_REGEX);
  return match ? match[1] : null;
}

export function youtubeUrlValidator(control: AbstractControl): ValidationErrors | null {
  const v = (control.value ?? '').toString().trim();
  return !v || extractYoutubeId(v) ? null : { youtube: true };
}