import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.models';
import { ToastService } from '../services/toast.service';
import { extractErrorMessage } from '../utils/http-error';

export const apiFeedbackInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiUrl)) return next(req);   // only our API

  const toast = inject(ToastService);
  const isMutation = req.method !== 'GET';

  return next(req).pipe(
    // success toast: only for save / create / delete, using the backend's own message
    tap(event => {
      if (isMutation && event instanceof HttpResponse) {
        const message = (event.body as ApiResponse | null)?.message;
        if (message) toast.success(message);
      }
    }),
    // error toast: for every request
    catchError((err: HttpErrorResponse) => {
      toast.error(extractErrorMessage(err));
      return throwError(() => err);
    }),
  );
};