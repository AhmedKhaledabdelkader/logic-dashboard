import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';

import { API } from '../config/api-endpoints';
import { ApiResponse } from '../models/api.models';
import { Service, ServicePayload } from '../models/service.model';

/** Laravel may send booleans as true/1/"1" — normalise once at the boundary. */
function toService(raw: Service): Service {
  const active: unknown = raw.is_active;
  return {
    ...raw,
    is_active: active === true || active === 1 || active === '1',
    items: raw.items ?? [],
  };
}

@Injectable({ providedIn: 'root' })
export class ServicesService {
  private readonly http = inject(HttpClient);

  getAll() {
    return this.http
      .get<ApiResponse<Service[]>>(API.services)
      .pipe(map(r => (r.data ?? []).map(toService)));
  }

  create(body: ServicePayload) {
    return this.http
      .post<ApiResponse<Service>>(API.services, body)
      .pipe(map(r => toService(r.data)));
  }

  update(id: number, body: Partial<ServicePayload>) {
    return this.http
      .put<ApiResponse<Service>>(`${API.services}/${id}`, body)
      .pipe(map(r => toService(r.data)));
  }

  remove(id: number) {
    return this.http.delete<ApiResponse<null>>(`${API.services}/${id}`);
  }

  /** Persist drag-and-drop order. Returns the freshly ordered list. */
  reorder(ids: number[]) {
    return this.http
      .post<ApiResponse<Service[]>>(`${API.services}/reorder`, { ids })
      .pipe(map(r => (r.data ?? []).map(toService)));
  }
}
