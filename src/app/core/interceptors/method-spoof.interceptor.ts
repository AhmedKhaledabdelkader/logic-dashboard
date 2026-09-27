import { HttpInterceptorFn } from '@angular/common/http';

/**
 * PHP only parses multipart/form-data bodies into $_FILES / $_POST on a real
 * POST request — PUT and PATCH bodies are left unparsed, so file uploads on
 * update silently vanish. This interceptor transparently rewrites any
 * PUT/PATCH request whose body is FormData into a spoofed POST, appending
 * `_method` so Laravel's method-spoofing middleware still routes it to the
 * matching PUT/PATCH route handler.
 */
export const methodSpoofInterceptor: HttpInterceptorFn = (req, next) => {
  const isFormData = req.body instanceof FormData;
  const needsSpoof = req.method === 'PUT' || req.method === 'PATCH';

  if (!isFormData || !needsSpoof) return next(req);

  (req.body as FormData).append('_method', req.method);
  const spoofed = req.clone({ method: 'POST' });

  return next(spoofed);
};