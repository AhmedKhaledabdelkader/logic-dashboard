import { HttpInterceptorFn } from '@angular/common/http';

/**
 * FormData can only hold strings, so `formData.append('is_featured', true)`
 * always ends up as the literal string "true" / "false" on the wire — and
 * Laravel's `boolean` validation rule only accepts 1, 0, "1", "0" (not the
 * words "true"/"false"), so that field fails validation on the backend.
 *
 * This rewrites every "true"/"false" value in any outgoing FormData body to
 * "1"/"0" before the request is sent, so callers can keep writing
 * `formData.append('is_featured', someBoolean)` anywhere in the app without
 * thinking about it.
 */
export const formDataBooleanNormalizerInterceptor: HttpInterceptorFn = (req, next) => {
  if (!(req.body instanceof FormData)) return next(req);

  const original = req.body;
  const normalized = new FormData();

  for (const [key, value] of original.entries()) {
    if (value === 'true') {
      normalized.append(key, "1");
    } else if (value === 'false') {
      normalized.append(key, "0");
    } else {
      normalized.append(key, value);
    }
  }

  return next(req.clone({ body: normalized }));
};