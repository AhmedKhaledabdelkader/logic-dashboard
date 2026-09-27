import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';

import { API } from '../config/api-endpoints';

import { ApiResponse } from '../models/api.models';

import {
  Insight,
  InsightPayload,
} from '../models/insight.model';

import { toFormData } from '../utils/form-data';
import { withMediaUrl } from '../utils/media-url';
import { normalizeInsight } from '../utils/normalize-insight';


/**
 * Single boundary point: every insight coming back from the API passes
 * through both the media-URL mapping and the is_featured normalization,
 * so callers never have to think about backend serialization quirks.
 */
function toInsight(raw: Insight): Insight {
  return withMediaUrl(normalizeInsight(raw));
}


@Injectable({
  providedIn: 'root',
})
export class InsightsService {

  private readonly http = inject(HttpClient);


  /**
   * Get all insights.
   *
   * Used by the dashboard.
   */
  getAll() {
    return this.http
      .get<ApiResponse<Insight[]>>(
        API.insights
      )
      .pipe(
        map(response =>
          (response.data ?? []).map(
            toInsight
          )
        )
      );
  }


  /**
   * Get only the 3 insights
   * that appear on the Home page.
   */
  getFeatured() {
    return this.http
      .get<ApiResponse<Insight[]>>(
        `${API.insights}/featured`
      )
      .pipe(
        map(response =>
          (response.data ?? []).map(
            toInsight
          )
        )
      );
  }


  /**
   * Get one insight.
   */
  getById(id: number) {
    return this.http
      .get<ApiResponse<Insight>>(
        `${API.insights}/${id}`
      )
      .pipe(
        map(response =>
          toInsight(response.data)
        )
      );
  }


  /**
   * Create a new insight.
   */
  create(
    body: InsightPayload
  ) {
    return this.http
      .post<ApiResponse<Insight>>(
        API.insights,
        toFormData({
          title: body.title,
          image: body.image,
          is_featured: body.is_featured,
        })
      )
      .pipe(
        map(response =>
          toInsight(response.data)
        )
      );
  }


  /**
   * Update an existing insight.
   */
  update(
    id: number,
    body: InsightPayload
  ) {
    return this.http
      .put<ApiResponse<Insight>>(
        `${API.insights}/${id}`,
        toFormData({
          title: body.title,
          image: body.image,
          is_featured: body.is_featured,
        })
      )
      .pipe(
        map(response =>
          toInsight(response.data)
        )
      );
  }


  /**
   * Delete an insight.
   */
  remove(id: number) {
    return this.http
      .delete<ApiResponse<null>>(
        `${API.insights}/${id}`
      );
  }
}