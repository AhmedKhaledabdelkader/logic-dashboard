import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';

import { API } from '../config/api-endpoints';
import { ApiResponse } from '../models/api.models';
import { AboutPage, AboutPagePayload } from '../models/about-page.models';
import { mediaUrl } from '../utils/media-url';


@Injectable({
  providedIn: 'root',
})
export class AboutPageService {

  private readonly http = inject(HttpClient);


  get() {
    return this.http
      .get<ApiResponse<AboutPage>>(API.about)
      .pipe(map(response => this.withImageUrl(response.data)));
  }


  update(body: AboutPagePayload) {
    return this.http
      .put<ApiResponse<AboutPage>>(API.about, this.toFormData(body))
      .pipe(map(response => this.withImageUrl(response.data)));
  }


  private withImageUrl(page: AboutPage): AboutPage {
    return {
      ...page,
      story_image: mediaUrl(page.story_image),
    };
  }


  private toFormData(body: AboutPagePayload): FormData {
    const formData = new FormData();

    formData.append('hero_title', body.hero_title);
    formData.append('hero_subtitle', body.hero_subtitle);

    formData.append('story_title', body.story_title);
    formData.append('story_paragraph', body.story_paragraph);

    if (body.story_image) {
      formData.append('story_image', body.story_image);
    }

    // FormData can't hold nested arrays/objects directly —
    // send both repeatable lists as JSON strings; the backend
    // decodes each before validation.
    formData.append('presence', JSON.stringify(body.presence));
    formData.append('values', JSON.stringify(body.values));

    return formData;
  }
}