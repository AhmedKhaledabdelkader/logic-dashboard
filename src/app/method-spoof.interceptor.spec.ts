import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { methodSpoofInterceptor } from './core/interceptors/method-spoof.interceptor';


describe('methodSpoofInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([methodSpoofInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Ensures no unexpected/unmatched requests were made in a test.
    httpMock.verify();
  });

  it('rewrites a PUT request with a FormData body to POST and appends _method=PUT', () => {
    const formData = new FormData();
    formData.append('title', 'Insight2kkkk');
    formData.append('is_featured', '1');

    httpClient.put('/api/insights/7', formData).subscribe();

    const req = httpMock.expectOne('/api/insights/7');

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBe(formData);
    expect((req.request.body as FormData).get('_method')).toBe('PUT');
    expect((req.request.body as FormData).get('title')).toBe('Insight2kkkk');

    req.flush({ status: 'success' });
  });

  it('rewrites a PATCH request with a FormData body to POST and appends _method=PATCH', () => {
    const formData = new FormData();
    formData.append('title', 'Partial update');

    httpClient.patch('/api/insights/7', formData).subscribe();

    const req = httpMock.expectOne('/api/insights/7');

    expect(req.request.method).toBe('POST');
    expect((req.request.body as FormData).get('_method')).toBe('PATCH');

    req.flush({ status: 'success' });
  });

  it('leaves a PUT request with a plain JSON body untouched', () => {
    const payload = { title: 'No file here' };

    httpClient.put('/api/insights/7', payload).subscribe();

    const req = httpMock.expectOne('/api/insights/7');

    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);

    req.flush({ status: 'success' });
  });

  it('leaves a POST request with a FormData body untouched (already correct verb)', () => {
    const formData = new FormData();
    formData.append('title', 'New insight');

    httpClient.post('/api/insights', formData).subscribe();

    const req = httpMock.expectOne('/api/insights');

    expect(req.request.method).toBe('POST');
    expect((req.request.body as FormData).get('_method')).toBeNull();

    req.flush({ status: 'success' }, { status: 201, statusText: 'Created' });
  });

  it('leaves a DELETE request untouched', () => {
    httpClient.delete('/api/insights/7').subscribe();

    const req = httpMock.expectOne('/api/insights/7');

    expect(req.request.method).toBe('DELETE');

    req.flush({ status: 'success' });
  });
});