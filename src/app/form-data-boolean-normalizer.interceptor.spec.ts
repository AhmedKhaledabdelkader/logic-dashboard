import { formDataBooleanNormalizerInterceptor } from './core/interceptors/form-data-boolean-normalizer.interceptor';
import { TestBed } from '@angular/core/testing';
import { HttpInterceptorFn } from '@angular/common/http';


describe('formDataBooleanNormalizerInterceptorInterceptor', () => {
  const interceptor: HttpInterceptorFn = (req, next) => 
    TestBed.runInInjectionContext(() => formDataBooleanNormalizerInterceptor(req, next));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });
});
