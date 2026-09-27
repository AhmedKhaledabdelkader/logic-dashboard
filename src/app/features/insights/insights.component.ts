import {
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';

import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { finalize } from 'rxjs';

import {
  ImageValue,
} from '../../core/models/image-value.model';

import {
  Insight,
  InsightPayload,
} from '../../core/models/insight.model';

import {
  InsightsService,
} from '../../core/services/insights.service';

import {
  fileOrNull,
} from '../../core/utils/form-data';

import {
  applyServerErrors,
} from '../../core/utils/http-error';

import {
  imageFileValidator,
  notBlank,
} from '../../core/utils/validators';

import {
  FieldErrorComponent,
} from '../../shared/components/field-error/field-error.component';

import {
  ImageUploadComponent,
} from '../../shared/components/image-upload/image-upload.component';

import {
  SectionCardComponent,
} from '../../shared/components/section-card/section-card.component';


@Component({
  selector: 'app-insights',

  imports: [
    ReactiveFormsModule,
    SectionCardComponent,
    ImageUploadComponent,
    FieldErrorComponent,
  ],

  templateUrl: './insights.component.html',

  styleUrl: './insights.component.scss',
})
export class InsightsComponent implements OnInit {

  private readonly fb =
    inject(NonNullableFormBuilder);

  private readonly api =
    inject(InsightsService);


  /*
   * All insights
   */
  items = signal<Insight[]>([]);


  /*
   * Page states
   */
  loading = signal(true);

  saving = signal(false);


  /*
   * Currently edited insight
   *
   * null = creating new insight
   * number = editing existing insight
   */
  editingId =
    signal<number | null>(null);


  /*
   * Currently deleting insight
   */
  deletingId =
    signal<number | null>(null);


  /*
   * Number of insights currently
   * selected to appear on Home.
   *
   * Maximum = 3
   */
  featuredCount = computed(() =>
    this.items().filter(
      item => item.is_featured
    ).length
  );


  /*
   * Form
   */
  form = this.fb.group({

    title: [
      '',
      [
        Validators.required,
        notBlank,
        Validators.minLength(3),
        Validators.maxLength(150),
      ],
    ],

    image: this.fb.control<ImageValue>(
      null,
      [
        Validators.required,
        imageFileValidator(),
      ]
    ),

    isFeatured: this.fb.control(
      false
    ),

  });


  /*
   * Determines whether the current
   * insight can be marked as featured.
   *
   * Rules:
   *
   * 1. Creating a new insight:
   *    allowed only when fewer than 3
   *    insights are featured.
   *
   * 2. Editing a non-featured insight:
   *    allowed only when fewer than 3
   *    insights are featured.
   *
   * 3. Editing an already-featured insight:
   *    always allowed to remain featured.
   */
  editingFeaturedAllowed = computed(() => {

    const currentId =
      this.editingId();

    const currentInsight =
      this.items().find(
        item => item.id === currentId
      );

    /*
     * Creating a new insight
     */
    if (!currentInsight) {
      return this.featuredCount() < 3;
    }

    /*
     * Already featured.
     *
     * It can remain featured even
     * when there are already 3.
     */
    if (currentInsight.is_featured) {
      return true;
    }

    /*
     * Currently not featured.
     *
     * It can become featured only
     * when there are fewer than 3.
     */
    return this.featuredCount() < 3;
  });


  /*
   * Component initialization
   */
  ngOnInit(): void {
    this.loadInsights();
  }


  /*
   * Load all insights.
   */
  private loadInsights(): void {

    this.loading.set(true);

    this.api
      .getAll()
      .pipe(
        finalize(() =>
          this.loading.set(false)
        )
      )
      .subscribe({

        next: list => {
          this.items.set(list);
        },

        error: error => {
          console.error(
            'Failed to load insights.',
            error
          );
        },

      });
  }


  /*
   * Edit an existing insight.
   */
  edit(item: Insight): void {

    this.editingId.set(item.id);

    this.deletingId.set(null);

    this.form.reset({

      title: item.title,

      /*
       * Existing image URL.
       *
       * ImageUploadComponent should display
       * the existing image as the preview.
       */
      image: item.image,

      isFeatured: item.is_featured,

    });
  }


  /*
   * Cancel create/edit mode.
   */
  cancel(): void {

    this.editingId.set(null);

    this.deletingId.set(null);

    this.form.reset({

      title: '',

      image: null,

      isFeatured: false,

    });
  }


  /*
   * Create or update an insight.
   */
  save(): void {

    /*
     * Validate form first.
     */
    if (this.form.invalid) {

      this.form.markAllAsTouched();

      return;
    }


    const formValue =
      this.form.getRawValue();


    /*
     * Prevent selecting a fourth
     * featured insight on the frontend.
     *
     * The backend also validates this,
     * so this is only an additional
     * user-friendly protection.
     */
    if (
      formValue.isFeatured &&
      !this.editingFeaturedAllowed()
    ) {

      this.form.controls.isFeatured.setValue(
        false
      );

      return;
    }


    /*
     * Prepare request payload.
     */
    const body: InsightPayload = {

      id: this.editingId(),

      title: formValue.title,

      /*
       * If the user selected a new file,
       * fileOrNull() returns the File.
       *
       * If the existing image is only a URL,
       * it returns null so the backend can
       * keep the existing image.
       */
      image: fileOrNull(
        formValue.image
      ),

      is_featured:
        formValue.isFeatured,
    };


    this.saving.set(true);


    /*
     * CREATE
     *
     * editingId === null
     *
     * UPDATE
     *
     * editingId !== null
     */
    const request$ =
      this.editingId() !== null

        ? this.api.update(
            this.editingId()!,
            body
          )

        : this.api.create(body);


    request$
      .pipe(
        finalize(() =>
          this.saving.set(false)
        )
      )
      .subscribe({

        /*
         * Create/update succeeded.
         */
        next: saved => {

          this.items.update(list => {

            /*
             * Updating existing insight
             */
            if (
              this.editingId() !== null
            ) {

              return list.map(item =>
                item.id === saved.id
                  ? saved
                  : item
              );
            }


            /*
             * Creating new insight
             */
            return [
              saved,
              ...list,
            ];
          });


          /*
           * Reset form after successful
           * create/update.
           */
          this.cancel();
        },


        /*
         * Backend validation error.
         */
        error: error => {

          applyServerErrors(
            this.form,
            error
          );

        },

      });
  }


  /*
   * Start delete confirmation.
   */
  startDelete(id: number): void {

    this.deletingId.set(id);
  }


  /*
   * Confirm delete.
   */
  confirmDelete(id: number): void {

    this.api
      .remove(id)
      .subscribe({

        /*
         * Delete succeeded.
         */
        next: () => {

          this.items.update(
            list =>
              list.filter(
                item => item.id !== id
              )
          );


          /*
           * If the deleted insight is
           * currently being edited,
           * reset the form.
           */
          if (
            this.editingId() === id
          ) {

            this.cancel();
          }


          this.deletingId.set(null);
        },


        /*
         * Delete failed.
         */
        error: error => {

          console.error(
            'Failed to delete insight.',
            error
          );

          this.deletingId.set(null);
        },

      });
  }
}