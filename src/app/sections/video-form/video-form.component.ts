import {
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';

import {
  toSignal,
} from '@angular/core/rxjs-interop';

import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import {
  finalize,
  map,
} from 'rxjs';

import {
  VideoContent,
} from '../../../app/core/models/home.models';

import {
  HomePageService,
} from '../../../app/core/services/home-page.service';

import {
  applyServerErrors,
} from '../../../app/core/utils/http-error';

import {
  extractYoutubeId,
  notBlank,
  youtubeUrlValidator,
} from '../../../app/core/utils/validators';

import {
  FieldErrorComponent,
} from '../../shared/components/field-error/field-error.component';

import {
  SectionCardComponent,
} from '../../shared/components/section-card/section-card.component';


@Component({
  selector: 'app-video-form',

  imports: [
    ReactiveFormsModule,
    SectionCardComponent,
    FieldErrorComponent,
  ],

  templateUrl: './video-form.component.html',
})
export class VideoFormComponent
  implements OnInit {


  // =========================================================
  // DEPENDENCIES
  // =========================================================

  private readonly fb = inject(
    NonNullableFormBuilder
  );

  private readonly api = inject(
    HomePageService
  );


  // =========================================================
  // STATE
  // =========================================================

  loading = signal(true);

  saving = signal(false);


  // =========================================================
  // FORM
  // =========================================================

  form = this.fb.group({

    title: [

      '',

      [
        Validators.required,

        notBlank,

        Validators.minLength(3),

        Validators.maxLength(120),
      ],

    ],

    subtitle: [

      '',

      [
        Validators.required,

        notBlank,

        Validators.maxLength(250),
      ],

    ],

    youtubeUrl: [

      '',

      [
        Validators.required,

        notBlank,

        youtubeUrlValidator,
      ],

    ],

  });


  // =========================================================
  // YOUTUBE PREVIEW
  // =========================================================

  videoId = toSignal(

    this.form.controls.youtubeUrl
      .valueChanges
      .pipe(

        map(value =>
          extractYoutubeId(value)
        )

      ),

    {
      initialValue: null as string | null,
    }

  );


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    this.loadVideo();

  }


  // =========================================================
  // LOAD VIDEO
  // =========================================================

  private loadVideo(): void {

    this.api

      .getVideo()

      .pipe(

        finalize(() =>
          this.loading.set(false)
        )

      )

      .subscribe({

        next: video => {

          if (!video) {

            return;

          }


          this.form.patchValue({

            title: video.title,

            subtitle: video.subtitle,

            youtubeUrl: video.youtubeUrl,

          });

        },


        error: (error: unknown) => {

          console.error(
            'Failed to load video content.',
            error
          );

        },

      });

  }


  // =========================================================
  // SAVE
  // =========================================================

  save(): void {

    if (this.form.invalid) {

      this.form.markAllAsTouched();

      return;

    }


    this.saving.set(true);


    const formValue =
      this.form.getRawValue();


    const body: VideoContent = {

      title:
        formValue.title,

      subtitle:
        formValue.subtitle,

      youtubeUrl:
        formValue.youtubeUrl,

    };


    this.api

      .saveVideo(body)

      .pipe(

        finalize(() =>
          this.saving.set(false)
        )

      )

      .subscribe({

        next: response => {

          if (response.data) {

            this.form.patchValue({

              title:
                response.data.title,

              subtitle:
                response.data.subtitle,

              youtubeUrl:
                response.data.youtubeUrl,

            });

          }

        },


        error: (error: unknown) => {

          applyServerErrors(
            this.form,
            error
          );

        },

      });

  }

}