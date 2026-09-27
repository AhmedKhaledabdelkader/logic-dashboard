import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { apiFeedbackInterceptor } from './core/interceptors/api-feedback.interceptor';
import { routes } from './app.routes';
import { methodSpoofInterceptor } from './core/interceptors/method-spoof.interceptor';
import { formDataBooleanNormalizerInterceptor } from './core/interceptors/form-data-boolean-normalizer.interceptor';


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
    provideHttpClient(withInterceptors([apiFeedbackInterceptor,methodSpoofInterceptor,formDataBooleanNormalizerInterceptor])),
  //   { provide: HTTP_INTERCEPTORS, useClass: MethodSpoofInterceptor, multi: true }
  ],
};