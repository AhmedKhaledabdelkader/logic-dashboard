import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import {
  map,
  Observable,
} from 'rxjs';

import { API } from '../config/api-endpoints';

import {
  ApiResponse,
} from '../models/api.models';

import {
  HeroSlide,
  HeroSlidePayload,
  RegionalContent,
  RegionalPayload,
  StatItem,
  VideoContent,
} from '../models/home.models';

import { toFormData } from '../utils/form-data';
import { withMediaUrl } from '../utils/media-url';


@Injectable({
  providedIn: 'root',
})
export class HomePageService {

  private readonly http = inject(
    HttpClient
  );


  // =========================================================
  // HERO SLIDES
  // =========================================================

  getSlides(): Observable<HeroSlide[]> {

    return this.http

      .get<ApiResponse<HeroSlide[]>>(
        API.home.slides
      )

      .pipe(

        map(response =>
          (response.data ?? [])
            .map(withMediaUrl)
        )

      );

  }


  saveSlides(
    slides: HeroSlidePayload[]
  ) {

    return this.http

      .post<ApiResponse<HeroSlide[]>>(
        API.home.slides,

        toFormData({
          slides,
        })
      )

      .pipe(

        map(response => ({

          ...response,

          data: (response.data ?? [])
            .map(withMediaUrl),

        }))

      );

  }


  // =========================================================
  // REGIONAL
  // =========================================================

  getRegional():
    Observable<RegionalContent | null> {

    return this.http

      .get<
        ApiResponse<RegionalContent | null>
      >(
        API.home.regional
      )

      .pipe(

        map(response =>
          response.data

            ? withMediaUrl(
                response.data
              )

            : null
        )

      );

  }


  saveRegional(
    body: RegionalPayload
  ) {

    return this.http

      .post<
        ApiResponse<RegionalContent>
      >(
        API.home.regional,

        toFormData(body)
      )

      .pipe(

        map(response => ({

          ...response,

          data: response.data

            ? withMediaUrl(
                response.data
              )

            : response.data,

        }))

      );

  }


  // =========================================================
  // STATISTICS
  // =========================================================

  getStats(): Observable<StatItem[]> {

    return this.http

      .get<ApiResponse<StatItem[]>>(
        API.home.stats
      )

      .pipe(

        map(response =>
          response.data ?? []
        )

      );

  }


  saveStats(
    statistics: StatItem[]
  ) {

    return this.http

      .post<ApiResponse<StatItem[]>>(
        API.home.stats,

        {
          statistics,
        }

      )

      .pipe(

        map(response => ({

          ...response,

          data: response.data ?? [],

        }))

      );

  }


  // =========================================================
  // VIDEO
  // =========================================================

  getVideo():
    Observable<VideoContent | null> {

    return this.http

      .get<
        ApiResponse<VideoContent | null>
      >(
        API.home.video
      )

      .pipe(

        map(response =>
          response.data ?? null
        )

      );

  }


  saveVideo(
    body: VideoContent
  ) {

    return this.http

      .post<
        ApiResponse<VideoContent>
      >(
        API.home.video,

        body
      );

  }


  // =========================================================
  // FEATURED INSIGHTS
  // =========================================================

  getFeaturedInsights():
    Observable<number[]> {

    return this.http

      .get<ApiResponse<number[]>>(
        API.home.insights
      )

      .pipe(

        map(response =>
          response.data ?? []
        )

      );

  }


  saveFeaturedInsights(
    insightIds: number[]
  ) {

    return this.http

      .post<ApiResponse<number[]>>(
        API.home.insights,

        {
          insightIds,
        }

      );

  }

}