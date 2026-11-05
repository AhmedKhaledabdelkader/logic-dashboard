import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';

import { API } from '../config/api-endpoints';
import { ApiResponse } from '../models/api.models';
import { WorkStep, WorkStepPayload } from '../models/work-step.model';

/** Laravel may send booleans as true/1/"1" — normalise once at the boundary. */
function toStep(raw: WorkStep): WorkStep {
  const active: unknown = raw.is_active;
  return { ...raw, is_active: active === true || active === 1 || active === '1' };
}

@Injectable({ providedIn: 'root' })
export class WorkStepsService {
  private readonly http = inject(HttpClient);

  getAll() {
    return this.http
      .get<ApiResponse<WorkStep[]>>(API.howWeWork)
      .pipe(map(r => (r.data ?? []).map(toStep)));
  }

  create(body: WorkStepPayload) {
    return this.http
      .post<ApiResponse<WorkStep>>(API.howWeWork, body)
      .pipe(map(r => toStep(r.data)));
  }

  update(id: number, body: Partial<WorkStepPayload>) {
    return this.http
      .put<ApiResponse<WorkStep>>(`${API.howWeWork}/${id}`, body)
      .pipe(map(r => toStep(r.data)));
  }

  /** Deleting renumbers the remaining steps, so callers should reload afterwards. */
  remove(id: number) {
    return this.http.delete<ApiResponse<null>>(`${API.howWeWork}/${id}`);
  }

  /** Persist drag-and-drop order. Returns the freshly ordered list. */
  reorder(ids: number[]) {
    return this.http
      .post<ApiResponse<WorkStep[]>>(`${API.howWeWork}/reorder`, { ids })
      .pipe(map(r => (r.data ?? []).map(toStep)));
  }
}
