import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl } from '@angular/forms';
import { ApiValidationError } from '../models/api.models';

/** The message shown in the error toast: backend message first, friendly fallback second */
export function extractErrorMessage(err: HttpErrorResponse): string {
  if (err.status === 0) return 'Cannot reach the server. Please check your connection.';

  const body = err.error as Partial<ApiValidationError> | null;
  if (body?.message) return body.message;

  switch (err.status) {
    case 401: return 'Your session has expired. Please sign in again.';
    case 403: return 'You are not allowed to do this.';
    case 404: return 'The requested item was not found.';
    case 413: return 'The file is too large.';
    case 422: return 'Please correct the highlighted fields.';
    default:  return err.status >= 500 ? 'Server error. Please try again later.' : `Request failed (${err.status}).`;
  }
}

/**
 * Puts the backend's field errors (HTTP 422) under the matching inputs.
 * Backend keys must match the form paths, e.g. "title" or "slides.0.title".
 */
export function applyServerErrors(form: AbstractControl, err: unknown): void {
  if (!(err instanceof HttpErrorResponse) || err.status !== 422) return;

  const errors = (err.error as ApiValidationError | null)?.errors ?? {};
  for (const [path, messages] of Object.entries(errors)) {
    const control = form.get(path);
    if (control && messages?.length) {
      control.setErrors({ server: messages[0] });
      control.markAsTouched();
    }
  }
}